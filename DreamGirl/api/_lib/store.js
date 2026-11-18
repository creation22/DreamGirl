// Portrait storage. Production talks to Supabase (REST + Storage) with the secret key.
// Local dev (vite) with no Supabase settings uses an in-memory store instead.

const COLUMNS = "id,username,image_url,caption,style,model,cost_micro,list_micro,created_at";
const BUCKET = "portraits";

export class StoreError extends Error {
  constructor(message, status = 500, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function toItem(row) {
  return {
    id: row.id,
    username: row.username,
    imageUrl: row.image_url,
    caption: row.caption,
    style: row.style,
    model: row.model,
    costMicro: Number(row.cost_micro) || 0,
    listMicro: Number(row.list_micro) || 0,
    createdAt: row.created_at,
  };
}

const EXT = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

function supabaseStore(url, key) {
  const root = url.replace(/\/+$/, "");
  const auth = { apikey: key };
  // Legacy service_role keys are JWTs and go in Authorization too; new sb_secret_ keys must not.
  if (key.startsWith("eyJ")) auth.Authorization = `Bearer ${key}`;

  async function call(path, { method = "GET", body, prefer, headers = {}, raw } = {}) {
    const res = await fetch(`${root}${path}`, {
      method,
      headers: { ...auth, ...(raw ? {} : { "Content-Type": "application/json" }), ...(prefer ? { Prefer: prefer } : {}), ...headers },
      body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
    });
    if (!res.ok) {
      let detail = {};
      try {
        detail = await res.json();
      } catch {
        /* not JSON */
      }
      if (detail.code === "23505") throw new StoreError("Already saved", 409, "duplicate");
      if (detail.code === "23503") throw new StoreError("That portrait is gone.", 404);
      console.error("[store]", method, path.split("?")[0], res.status, detail.message || detail.error || "");
      throw new StoreError("The gallery database didn't answer", 502);
    }
    return res;
  }

  const rest = (path, opts) => call(`/rest/v1${path}`, opts);

  return {
    async uploadImage(id, bytes, contentType) {
      const path = `${new Date().toISOString().slice(0, 10)}/${id}.${EXT[contentType] || "png"}`;
      await call(`/storage/v1/object/${BUCKET}/${path}`, {
        method: "POST",
        raw: bytes,
        headers: { "Content-Type": contentType, "Cache-Control": "max-age=31536000, immutable", "x-upsert": "false" },
      });
      return { path, url: `${root}/storage/v1/object/public/${BUCKET}/${path}` };
    },
    async deleteImage(path) {
      if (!path) return;
      await call(`/storage/v1/object/${BUCKET}`, { method: "DELETE", body: { prefixes: [path] } }).catch(() => {});
    },
    async insert(row) {
      const res = await rest("/portraits", { method: "POST", body: row, prefer: "return=representation" });
      return toItem((await res.json())[0]);
    },
    async list({ username, before, limit }) {
      const q = new URLSearchParams({
        select: COLUMNS,
        hidden: "is.false",
        username: "not.is.null",
        order: "created_at.desc",
        limit: String(limit),
      });
      if (username) q.set("username_lc", `eq.${username.toLowerCase()}`);
      if (before) q.set("created_at", `lt.${before}`);
      const res = await rest(`/portraits?${q}`);
      return (await res.json()).map(toItem);
    },
    // Every portrait ever drawn from this IP, hidden and removed ones included.
    async countForIp(ipHash) {
      const q = new URLSearchParams({ select: "id", ip_hash: `eq.${ipHash}`, limit: "1" });
      const res = await rest(`/portraits?${q}`, { prefer: "count=exact" });
      return Number((res.headers.get("content-range") || "*/0").split("/")[1]) || 0;
    },
    // A visit: when this IP first opened the site, when it last did, how often.
    async trackVisit(ipHash) {
      await rest("/rpc/track_visit", { method: "POST", body: { p_ip_hash: ipHash } });
    },
    async stats() {
      const res = await rest("/rpc/portrait_stats", { method: "POST", body: {} });
      return res.json();
    },
    async attachUsername(id, tokenHash, username) {
      const q = new URLSearchParams({ id: `eq.${id}`, delete_token_hash: `eq.${tokenHash}`, username: "is.null", hidden: "is.false" });
      const res = await rest(`/portraits?${q}&select=${COLUMNS}`, { method: "PATCH", body: { username }, prefer: "return=representation" });
      const rows = await res.json();
      return rows[0] ? toItem(rows[0]) : null;
    },
    // The row is kept (hidden, no username) so it still counts toward this IP's three
    // portraits; only the picture is deleted.
    async remove(id, tokenHash) {
      const q = new URLSearchParams({ id: `eq.${id}`, delete_token_hash: `eq.${tokenHash}`, hidden: "is.false" });
      const res = await rest(`/portraits?${q}&select=storage_path`, {
        method: "PATCH",
        body: { hidden: true, username: null },
        prefer: "return=representation",
      });
      const rows = await res.json();
      if (!rows.length) return false;
      await this.deleteImage(rows[0].storage_path);
      return true;
    },
    async report(id, ipHash) {
      await rest("/rpc/report_portrait", { method: "POST", body: { p_id: id, p_ip_hash: ipHash } });
    },
    async logPrompt(entry) {
      await rest("/prompt_log", { method: "POST", body: entry, prefer: "return=minimal" });
    },
  };
}

// Local dev keeps the prompt log in a file you can open: .dev-data/prompt_log.jsonl
async function appendDevLog(entry) {
  const { appendFile, mkdir } = await import("node:fs/promises");
  await mkdir(".dev-data", { recursive: true });
  await appendFile(".dev-data/prompt_log.jsonl", `${JSON.stringify(entry)}\n`);
}

function memoryStore() {
  const db = (globalThis.__dreamherMemory ??= { rows: [], reports: new Set(), images: new Map(), visits: new Map() });
  const listed = () =>
    db.rows.filter((r) => !r.hidden && r.username).sort((a, b) => b.created_at.localeCompare(a.created_at));
  return {
    async uploadImage(id, bytes, contentType) {
      return { path: id, url: `data:${contentType};base64,${Buffer.from(bytes).toString("base64")}` };
    },
    async deleteImage() {},
    async insert(row) {
      const full = { hidden: false, created_at: new Date().toISOString(), ...row };
      db.rows.push(full);
      return toItem(full);
    },
    async list({ username, before, limit }) {
      return listed()
        .filter((r) => !username || r.username.toLowerCase() === username.toLowerCase())
        .filter((r) => !before || r.created_at < before)
        .slice(0, limit)
        .map(toItem);
    },
    async countForIp(ipHash) {
      return db.rows.filter((r) => r.ip_hash === ipHash).length;
    },
    async trackVisit(ipHash) {
      const seen = (db.visits ??= new Map());
      seen.set(ipHash, (seen.get(ipHash) || 0) + 1);
    },
    async stats() {
      const rows = db.rows;
      return {
        portraits: rows.length,
        cost_micro: rows.reduce((s, r) => s + r.cost_micro, 0),
        list_micro: rows.reduce((s, r) => s + r.list_micro, 0),
      };
    },
    async attachUsername(id, tokenHash, username) {
      const row = db.rows.find((r) => r.id === id && r.delete_token_hash === tokenHash && !r.username && !r.hidden);
      if (!row) return null;
      row.username = username;
      return toItem(row);
    },
    async remove(id, tokenHash) {
      const row = db.rows.find((r) => r.id === id && r.delete_token_hash === tokenHash && !r.hidden);
      if (!row) return false;
      row.hidden = true;
      row.username = null;
      return true;
    },
    async report(id, ipHash) {
      db.reports.add(`${id}:${ipHash}`);
      const n = [...db.reports].filter((k) => k.startsWith(`${id}:`)).length;
      const row = db.rows.find((r) => r.id === id);
      if (row && n >= 3) row.hidden = true;
    },
    async logPrompt(entry) {
      await appendDevLog({ created_at: new Date().toISOString(), ...entry });
    },
  };
}

export function getStore() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) return supabaseStore(url, key);
  if (process.env.DREAMHER_DEV_STORE === "memory") return memoryStore();
  return null;
}

// "Download" saves a 1080x1350 card: her portrait glowing on night film, what she's like,
// and what she cost on Surplus. The portrait must allow CORS (Supabase public storage and
// same-origin images do).
import { usd } from "./money";

const W = 1080;
const H = 1350;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Her portrait couldn't be loaded for the card."));
    img.src = src;
  });
}

function grain(ctx) {
  const tile = document.createElement("canvas");
  tile.width = tile.height = 180;
  const t = tile.getContext("2d");
  const data = t.createImageData(180, 180);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = Math.random() * 255;
    data.data[i] = data.data[i + 1] = data.data[i + 2] = v;
    data.data[i + 3] = 18;
  }
  t.putImageData(data, 0, 0);
  ctx.fillStyle = ctx.createPattern(tile, "repeat");
  ctx.fillRect(0, 0, W, H);
}

function wrap(ctx, text, maxWidth, maxLines) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, "") + "...";
  }
  return lines;
}

export async function renderShareCard({ image, caption, costMicro, handle }) {
  await Promise.all([
    document.fonts.load('italic 400 48px "Bodoni Moda"'),
    document.fonts.load('500 30px "Archivo"'),
  ]);
  const img = await loadImage(image);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0D0D0D";
  ctx.fillRect(0, 0, W, H);

  // her light: a soft halo behind the portrait
  const halo = ctx.createRadialGradient(W / 2, 520, 120, W / 2, 520, 700);
  halo.addColorStop(0, "rgba(255,255,255,.16)");
  halo.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, H);

  const size = 880;
  const x = (W - size) / 2;
  const y = 90;
  ctx.save();
  ctx.shadowColor = "rgba(255,255,255,.28)";
  ctx.shadowBlur = 90;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, 40);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, 40);
  ctx.clip();
  const s = Math.max(size / img.width, size / img.height);
  ctx.drawImage(img, x + (size - img.width * s) / 2, y + (size - img.height * s) * 0.3, img.width * s, img.height * s);
  ctx.restore();

  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  ctx.font = 'italic 400 46px "Bodoni Moda"';
  const lines = wrap(ctx, caption || "my dream girl", size, 2);
  lines.forEach((l, i) => ctx.fillText(l, x, y + size + 78 + i * 56));

  const base = H - 72;
  ctx.font = 'italic 500 54px "Bodoni Moda"';
  ctx.fillText("DreamHer", x, base);
  if (handle) {
    ctx.fillStyle = "#8F8F8F";
    ctx.font = '500 26px "Archivo"';
    ctx.fillText(`dreamed up by @${handle}`, x, base - 70);
  }

  ctx.textAlign = "right";
  ctx.fillStyle = "#fff";
  ctx.font = '600 34px "Archivo"';
  ctx.fillText(costMicro > 0 ? `Brought to life for ${usd(costMicro)}` : "Brought to life for about 1¢", x + size, base - 36);
  ctx.fillStyle = "#8F8F8F";
  ctx.font = '500 26px "Archivo"';
  ctx.fillText("on Surplus Intelligence", x + size, base + 2);

  grain(ctx);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't make the card."))), "image/png"),
  );
}

export async function downloadShareCard(data, filename = "dreamher.png") {
  const blob = await renderShareCard(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

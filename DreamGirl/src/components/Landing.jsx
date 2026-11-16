import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import { Header, Heart, Photo } from "./Chrome";
import { LINKS } from "../constants/links";
import { gallery } from "../constants/gallery";

const CYCLE_MS = 4500;

/** The hero's card stack. The front card develops through real results. */
function DevelopingStack() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    gallery.forEach(({ src }) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      if (!document.hidden) setI((n) => (n + 1) % gallery.length);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, [reduce]);

  const front = gallery[i];
  const back = gallery[(i + 4) % gallery.length];

  return (
    <div className="relative mx-auto w-[min(76vw,340px)] lg:w-[350px]">
      <Photo caption={back.caption} className="absolute inset-0 translate-x-6 translate-y-3 rotate-[6deg] bg-pink-soft">
        <img src={back.src} alt="" className="h-full w-full object-cover" />
      </Photo>
      <Photo caption={front.caption} shadow="shadow-nb-lg" className="relative -rotate-2">
        <img
          key={front.src}
          src={front.src}
          alt={`AI portrait made from the answers: ${front.caption}`}
          className="h-full w-full animate-develop object-cover"
          fetchpriority="high"
        />
      </Photo>
      <p
        aria-hidden
        className="absolute -left-5 -top-6 z-10 grid h-24 w-24 rotate-[-12deg] place-items-center rounded-full border-3 border-ink bg-white text-center text-xs font-bold leading-tight shadow-nb sm:-left-10 sm:h-28 sm:w-28 sm:text-sm"
      >
        Free.
        <br />
        No sign-up.
      </p>
    </div>
  );
}

const steps = [
  {
    title: "Answer 10 questions",
    body: "Her vibe, look, outfit, hair, expression and the art style. Pick an option or type your own.",
  },
  {
    title: "We write the description",
    body: "Your answers become a detailed prompt for the image model. You can read it on the result.",
  },
  {
    title: "She's drawn",
    body: "Save her, share her, or draw her again from the same answers for a new take.",
  },
];

const faqs = [
  {
    q: "Is it free?",
    a: "Yes. There's no account and no payment. Portraits come from Pollinations, a free image service, which allows one drawing every 45 seconds.",
  },
  {
    q: "Will I get the same portrait twice?",
    a: "No. Every drawing starts from a new random seed. Use Draw her again to see another take on the same answers.",
  },
  {
    q: "What if my answer isn't in the list?",
    a: "Most questions have a Something else choice. Type whatever you have in mind and it goes into the description as written.",
  },
  {
    q: "Are my answers saved?",
    a: "No. Your answers stay in your browser. Only the written description is sent to the image service to draw her.",
  },
  {
    q: "Can I save her?",
    a: "Yes. Open full size puts the 768 by 768 image in a new tab, where you can save it.",
  },
];

const tilt = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "rotate-[-1.5deg]", "rotate-[1.5deg]"];

export default function Landing({ onStart }) {
  return (
    <div className="overflow-x-clip">
      <Header />

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-16 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1.3fr_.7fr] lg:gap-10 lg:pb-28 lg:pt-20">
          <div>
            <h1 className="font-display text-[clamp(2.25rem,10vw,5rem)] leading-[1.02] tracking-tight">
              <span className="block whitespace-nowrap">Describe her.</span>
              <span className="mt-3 inline-block whitespace-nowrap -rotate-[1.5deg] rounded-xl border-3 border-ink bg-pink px-3 pb-1 shadow-nb sm:px-4">
                We'll draw her.
              </span>
            </h1>
            <p className="mt-8 max-w-[33rem] text-lg leading-relaxed text-neutral-700 sm:text-xl">
              Answer 10 quick questions about her look, her style and her mood. DreamHer turns
              your answers into a portrait in about a minute.
            </p>
            <button type="button" onClick={onStart} className="nb-btn-pink mt-9 px-8 py-4 text-lg">
              Start the 10 questions
            </button>
          </div>
          <DevelopingStack />
        </section>

        {/* How it works */}
        <section className="border-y-3 border-ink bg-pink-wash">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <h2 className="font-display text-3xl sm:text-4xl">Three steps, about a minute</h2>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {steps.map((s, n) => (
                <li key={s.title} className="nb-card p-6">
                  <span
                    aria-hidden
                    className="grid h-11 w-11 place-items-center rounded-full border-3 border-ink bg-pink font-display text-lg"
                  >
                    {n + 1}
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-neutral-700">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Gallery */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl sm:text-4xl">Drawn from other people's answers</h2>
            <p className="mt-4 text-lg leading-relaxed text-neutral-700">
              Every portrait here came out of the same 10 questions. The strip under each one is
              what was picked.
            </p>
          </div>
          <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-8 sm:gap-y-10 md:grid-cols-3">
            {gallery.map((g, n) => (
              <li key={g.src}>
                <Photo
                  caption={g.caption}
                  className={`${tilt[n % tilt.length]} transition-[transform,box-shadow] duration-150 ease-out hover:rotate-0 hover:shadow-nb-lg`}
                >
                  <img
                    src={g.src}
                    alt={`AI portrait: ${g.caption}`}
                    loading="lazy"
                    width="640"
                    height="640"
                    className="h-full w-full object-cover"
                  />
                </Photo>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section className="border-t-3 border-ink bg-pink-wash">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-24 sm:px-6 lg:grid-cols-[.75fr_1.25fr]">
            <h2 className="font-display text-3xl sm:text-4xl">Questions people ask</h2>
            <div className="space-y-4">
              {faqs.map((f) => (
                <details key={f.q} className="nb-card group overflow-hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-5 py-4 text-lg font-bold group-open:border-b-3 group-open:border-ink group-open:bg-pink-soft [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span
                      aria-hidden
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-3 border-ink bg-white transition-transform duration-150 group-open:rotate-45"
                    >
                      <Plus className="h-4 w-4" strokeWidth={3} />
                    </span>
                  </summary>
                  <p className="max-w-prose px-5 py-4 leading-relaxed text-neutral-700">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final call */}
        <section className="border-t-3 border-ink">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="flex flex-col items-start gap-8 rounded-2xl border-3 border-ink bg-pink p-8 shadow-nb-lg sm:p-12 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <h2 className="font-display text-3xl sm:text-5xl">Who's in your head?</h2>
                <p className="mt-4 text-lg font-medium leading-relaxed">
                  Ten answers is all it takes. If the first drawing isn't her, draw her again.
                </p>
              </div>
              <button type="button" onClick={onStart} className="nb-btn-white shrink-0 px-8 py-4 text-lg">
                Start the 10 questions
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-3 border-ink bg-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="flex items-center gap-2">
            <Heart className="h-5 w-5 shrink-0" />
            <span>
              Made by{" "}
              <a href="https://github.com/creation22" target="_blank" rel="noopener noreferrer" className="font-bold text-pink underline-offset-4 hover:underline">
                creation22
              </a>
              . Portraits by Pollinations AI.
            </span>
          </p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 font-semibold" aria-label="Footer">
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="hover:text-pink">GitHub</a>
            <a href={LINKS.coffee} target="_blank" rel="noopener noreferrer" className="hover:text-pink">Buy me a coffee</a>
            <a href={LINKS.feedback} target="_blank" rel="noopener noreferrer" className="hover:text-pink">Send feedback</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

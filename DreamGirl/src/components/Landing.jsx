import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Header, Photo } from "./Chrome";
import { LINKS } from "../constants/links";
import { gallery } from "../constants/gallery";

const CYCLE_MS = 4500;

/** The hero's photo stack. The front photo "develops" through real results. */
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
  const back1 = gallery[(i + 3) % gallery.length];
  const back2 = gallery[(i + 6) % gallery.length];

  return (
    <div className="relative mx-auto w-[min(78vw,360px)] pb-6 pt-4 lg:w-[400px]">
      {/* warm light the photos sit under */}
      <div aria-hidden className="pointer-events-none absolute -inset-16 rounded-full bg-rose/20 blur-3xl" />
      <Photo
        caption={back2.caption}
        className="absolute inset-x-0 top-4 -rotate-[9deg] opacity-80"
      >
        <img src={back2.src} alt="" className="h-full w-full object-cover" />
      </Photo>
      <Photo
        caption={back1.caption}
        className="absolute inset-x-0 top-4 rotate-[7deg] opacity-90"
      >
        <img src={back1.src} alt="" className="h-full w-full object-cover" />
      </Photo>
      <Photo caption={front.caption} className="relative -rotate-1">
        <img
          key={front.src}
          src={front.src}
          alt={`AI portrait made from the answers: ${front.caption}`}
          className="h-full w-full animate-develop object-cover"
          fetchpriority="high"
        />
      </Photo>
    </div>
  );
}

const steps = [
  {
    title: "Answer 10 questions",
    body: "Her vibe, look, outfit, hair, expression, and the art style. Pick an option or type your own.",
  },
  {
    title: "We write the description",
    body: "Your answers become a detailed prompt for the image model. You can read it on the result.",
  },
  {
    title: "She's drawn",
    body: "Download her, share her, or draw her again from the same answers for a new take.",
  },
];

const faqs = [
  {
    q: "Is it free?",
    a: "Yes. There's no account and no payment. Portraits come from Pollinations, a free image service, so it can be slower when it's busy.",
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
    q: "Can I download her?",
    a: "Yes. Every portrait is 768 by 768 pixels and downloads as an image file.",
  },
];

const tilt = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "-rotate-[1.5deg]", "rotate-[1.5deg]"];

export default function Landing({ onStart }) {
  return (
    <div className="overflow-x-clip">
      <Header />

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-6 sm:px-6 lg:grid-cols-[1.15fr_.85fr] lg:gap-8 lg:pb-28 lg:pt-12">
          <div>
            <h1 className="text-[clamp(2.9rem,12.5vw,4.5rem)] font-extrabold leading-[0.92] tracking-[-0.035em] text-film sm:text-[clamp(4.5rem,8.2vw,5.9rem)]">
              <span className="block whitespace-nowrap">Describe her.</span>
              <span className="block whitespace-nowrap lg:pl-[0.55em]">We'll draw her.</span>
            </h1>
            <p className="mt-7 max-w-[34rem] text-lg leading-relaxed text-lavender sm:text-xl">
              Answer 10 quick questions about her look, her style and her mood. DreamHer turns
              your answers into a portrait in about a minute.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
              <button type="button" onClick={onStart} className="btn-primary px-8 py-4 text-lg">
                Start the 10 questions
              </button>
              <p className="font-hand text-2xl text-blush">free, no sign-up</p>
            </div>
          </div>
          <DevelopingStack />
        </section>

        {/* How it works */}
        <section className="border-y border-twilight/70 bg-dusk/40">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <h2 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
              Three steps, about a minute
            </h2>
            <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {steps.map((s, n) => (
                <li key={s.title} className="relative">
                  <span aria-hidden className="font-hand text-6xl font-bold leading-none text-rose">
                    {n + 1}
                  </span>
                  <h3 className="mt-3 text-xl font-bold text-film">{s.title}</h3>
                  <p className="mt-2 max-w-xs leading-relaxed text-lavender">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Gallery */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Drawn from other people's answers</h2>
            <p className="mt-4 text-lg leading-relaxed text-lavender">
              Every portrait here came out of the same 10 questions. The note under each one is
              what was picked.
            </p>
          </div>
          <ul className="mt-14 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-8 sm:gap-y-12 md:grid-cols-3">
            {gallery.map((g, n) => (
              <li key={g.src}>
                <Photo
                  caption={g.caption}
                  className={`${tilt[n % tilt.length]} transition-transform duration-200 ease-out hover:rotate-0 hover:scale-[1.03]`}
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
        <section className="border-t border-twilight/70">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-24 sm:px-6 lg:grid-cols-[.8fr_1.2fr]">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Questions people ask</h2>
            <div className="divide-y divide-twilight border-y border-twilight">
              {faqs.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold text-film [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span
                      aria-hidden
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-twilight text-blush transition-transform duration-200 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-prose leading-relaxed text-lavender">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final call */}
        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <div className="flex flex-col items-center gap-10 rounded-[28px] bg-dusk px-6 py-16 text-center sm:py-20 md:flex-row md:justify-center md:gap-16 md:text-left">
            <Photo caption="your answers go here" className="w-52 shrink-0 rotate-3 sm:w-60">
              <div className="grid h-full w-full place-items-center bg-twilight/60">
                <span className="font-hand text-3xl text-lavender">?</span>
              </div>
            </Photo>
            <div className="max-w-md">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Who's in your head?</h2>
              <p className="mt-4 text-lg leading-relaxed text-lavender">
                Ten answers is all it takes. If the first drawing isn't her, draw her again.
              </p>
              <button type="button" onClick={onStart} className="btn-primary mt-8">
                Start the 10 questions
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-twilight/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-lavender sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            Made by{" "}
            <a href="https://github.com/creation22" target="_blank" rel="noopener noreferrer" className="text-blush underline-offset-4 hover:underline">
              creation22
            </a>
            . Portraits drawn by Pollinations AI.
          </p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer">
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="hover:text-film">GitHub</a>
            <a href={LINKS.coffee} target="_blank" rel="noopener noreferrer" className="hover:text-film">Buy me a coffee</a>
            <a href={LINKS.feedback} target="_blank" rel="noopener noreferrer" className="hover:text-film">Send feedback</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

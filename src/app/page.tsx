import type { FC } from "react";
import Link from "next/link";

const Home: FC = () => {
  return (
    <main className="flex min-h-screen items-center bg-canvas px-4 py-20 text-ink sm:px-8">
      <section className="mx-auto w-full max-w-5xl rounded-sm border border-hairline bg-surface p-8 sm:p-12">
        <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
          PayLens frontend foundation
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-medium tracking-[-0.03em] sm:text-6xl">
          Compensation operations, made clear.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-7 text-body">
          The application foundation is ready. Explore the living component
          library to review tokens, themes, interaction states, and reusable
          primitives.
        </p>
        <Link
          className="mt-8 inline-flex min-h-10 items-center justify-center rounded-sm bg-primary px-4 font-mono text-sm font-medium tracking-[0.005em] text-on-primary uppercase transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/60"
          href="/showcase"
        >
          Explore components
        </Link>
      </section>
    </main>
  );
};

export default Home;

const features = [
  "Next.js App Router",
  "TypeScript",
  "React components",
  "Node-ready project scripts"
];

export default function Home() {
  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Dummy Project</p>
        <h1>CruiseStack AI</h1>
        <p className="intro">
          A fresh Next.js starter using the `src/app` structure, ready for your
          first real feature.
        </p>
      </section>

      <section className="feature-grid" aria-label="Project features">
        {features.map((feature) => (
          <article className="feature-card" key={feature}>
            <span aria-hidden="true" />
            <h2>{feature}</h2>
            <p>
              This placeholder block keeps the scaffold visible while the app
              shape is still early.
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

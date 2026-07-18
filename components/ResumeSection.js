/**
 * The repeated two-column section wrapper used by all four resume sections.
 * Owns the top border, vertical rhythm and the heading column only — each
 * section's inner content differs enough (timeline entries vs. pill rows vs. a
 * hobby grid) that it isn't worth abstracting further.
 *
 * The grid collapses to a single column below lg, where a 160-220px heading
 * column would leave too little room for the content beside it.
 */
export default function ResumeSection({ heading, children }) {
  return (
    <section className="grid gap-6 border-t border-line py-9 lg:grid-cols-[minmax(160px,220px)_1fr] lg:gap-x-12">
      <h2 className="m-0 text-[20px] font-bold tracking-[-0.02em] text-ink">
        {heading}
      </h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

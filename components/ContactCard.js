/**
 * One contact channel. The handoff drops the icons the previous cards carried,
 * so the platform name and handle do all the work — the handle sits in the mono
 * face, matching how metadata is treated everywhere else on the site.
 *
 * `external` is explicit rather than inferred from the href: the mailto: and
 * the RSS feed are both non-http-ish cases where guessing would get it wrong.
 */
export default function ContactCard({ name, handle, href, external = false }) {
  return (
    <a
      href={href}
      data-testid="contact-card"
      {...(external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
      className="flex flex-col gap-1 rounded-xl border border-line bg-card px-[22px] py-5 no-underline hover:border-accent"
    >
      <span className="text-[16px] font-semibold text-ink">{name}</span>
      <span className="font-mono text-[13.5px] break-all text-muted">
        {handle}
      </span>
    </a>
  );
}

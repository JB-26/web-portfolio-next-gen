// Text links rather than the previous SVG icon set: fewer requests, and it
// retires the hardcoded-blue hover-invert CSS filter in footer.module.css,
// which would have needed re-tuning on every future token change.
const LINKS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jblewitt/" },
  { label: "GitHub", href: "https://github.com/JB-26" },
  { label: "Bluesky", href: "https://bsky.app/profile/joshblewitt.dev" },
  { label: "YouTube", href: "https://www.youtube.com/@joshuablewitt6022" },
  { label: "Instagram", href: "https://www.instagram.com/jblw1tt/" },
  { label: "RSS", href: "/rss.xml" },
];

export default function Footer() {
  return (
    <footer data-testid="footer-component" className="border-t border-line">
      <div className="mx-auto flex w-full max-w-[1040px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-6 text-[14px] text-faint">
        <p className="m-0">© {new Date().getFullYear()} Joshua Blewitt</p>
        {/* Six links at 14px with a 20px gap need 397px, against 342px of
            content width on a 390px phone — which orphaned "RSS" onto its own
            line. Tightening the gap and dropping a point of type on mobile
            brings the row to ~316px so it stays on one line, with the designed
            sizing restored from lg. */}
        <ul className="m-0 flex list-none items-center gap-x-2 p-0 text-[13px] lg:gap-x-5 lg:text-[14px]">
          {LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                rel="noopener noreferrer"
                target="_blank"
                // min-h-11 keeps the mobile touch target at 44px.
                className="inline-flex min-h-11 items-center text-faint no-underline hover:text-ink lg:min-h-0"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

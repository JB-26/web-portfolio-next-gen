import Link from "next/link";
import { useRouter } from "next/router";
import ThemeToggle from "./ThemeToggle";

// "Blog" stays active across every post-listing surface, per the design spec.
const NAV = [
  {
    href: "/blog",
    label: "Blog",
    isActive: (p) => /^\/(blog|posts|page|tags)(\/|$)/.test(p),
  },
  {
    href: "/resume",
    label: "Resume",
    isActive: (p) => p.startsWith("/resume"),
  },
  {
    href: "/contact",
    label: "Contact",
    isActive: (p) => p.startsWith("/contact"),
  },
];

export default function Header() {
  const { pathname } = useRouter();

  return (
    <header data-testid="header-component" className="w-full">
      <nav className="mx-auto flex w-full max-w-[1040px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-[26px]">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-[18px] font-bold tracking-[-0.02em] text-ink no-underline hover:text-ink lg:min-h-0"
        >
          JB<span className="text-accent">.</span>
        </Link>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[15.5px]">
          {NAV.map(({ href, label, isActive }) => {
            const active = isActive(pathname);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                // min-h-11 keeps mobile touch targets at 44px; the design's
                // compact nav returns at lg:.
                className={`inline-flex min-h-11 items-center border-b-2 no-underline lg:min-h-0 ${
                  active
                    ? "border-accent font-semibold text-ink"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}

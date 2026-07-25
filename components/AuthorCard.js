import Image from "next/image";
import Link from "next/link";
import avatar from "../public/images/profile_2.png";

/**
 * Post-page author card. Replaces the retired Signature component, which
 * rendered the same bio at the bottom of every non-home page; the design
 * scopes it to post pages only.
 *
 * Bio wording is carried over from Signature verbatim. The "Let me know your
 * thoughts" link now points at /contact rather than a mailto:, per the design
 * — the contact page lists the email address along with every other channel.
 *
 * The avatar sits below a full article, so it is never the LCP element:
 * explicit 72x72 and default lazy loading, never `priority`.
 */
export default function AuthorCard() {
  return (
    <aside
      data-testid="author-card"
      className="mt-12 flex flex-wrap items-start gap-5 rounded-xl border border-line bg-card p-6"
    >
      <Image
        src={avatar}
        alt="Joshua Blewitt"
        width={72}
        height={72}
        className="h-[72px] w-[72px] shrink-0 rounded-full object-cover"
      />
      <div className="flex min-w-[240px] flex-1 flex-col gap-2">
        <p className="m-0 text-[15.5px] font-bold text-ink">Joshua Blewitt</p>
        <p className="m-0 text-[14.5px] leading-[1.6] text-muted">
          I&apos;m passionate about product, a technology advocate, customer
          champion, curious mind and writer. I&apos;ve worked for companies such
          as Rightmove, Domino&apos;s Pizza and IQVIA.
        </p>
        <Link
          href="/contact"
          className="text-[14.5px] font-semibold text-accent no-underline hover:text-ink"
        >
          Let me know your thoughts →
        </Link>
      </div>
    </aside>
  );
}

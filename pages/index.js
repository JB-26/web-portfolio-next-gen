import Head from "next/head";
import Link from "next/link";
import Layout, { siteTitle } from "../components/layout";
import Polaroid from "../components/Polaroid";
import PostCard from "../components/PostCard";
import { getSortedPostsData } from "../lib/posts";
// A clean 400x400 square with no frame of its own — the Polaroid component
// supplies the frame in CSS so it can follow the theme. A pre-framed source
// image would double-frame here: invisible in light mode, obvious in dark.
import portrait from "../public/images/profile_2.png";

const RECENT_POST_COUNT = 4;

export default function Home({ recentPosts }) {
  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
        <meta
          name="description"
          content="The personal site of Joshua Blewitt — an IT professional writing about software, the industry and life."
        />
      </Head>

      {/* Hero. flex-wrap handles the collapse to a single column on narrow
          viewports without a breakpoint — the text column's min-w-[300px]
          decides when there is no longer room for two columns. */}
      <header className="flex flex-wrap items-center gap-14 py-12 pb-14">
        <div data-testid="image">
          <Polaroid
            src={portrait}
            alt="Joshua Blewitt"
            size={200}
            mobileSize={248}
            rotate={-2}
            // The LCP element on this page.
            priority
          />
        </div>
        <div className="flex min-w-[300px] flex-1 flex-col gap-[18px]">
          <h1
            data-testid="main-heading"
            className="m-0 text-[clamp(34px,5vw,46px)] font-bold leading-[1.08] tracking-[-0.03em] text-ink"
          >
            Hey, I&apos;m Joshua<span className="text-accent">.</span>
          </h1>
          <p
            data-testid="paragraph"
            className="m-0 max-w-[560px] text-[17.5px] leading-[1.65] text-muted"
          >
            A hobbyist{" "}
            <Link
              href="https://github.com/JB-26"
              rel="noopener noreferrer"
              target="_blank"
            >
              developer
            </Link>
            , technologist, traveller, amateur{" "}
            <Link
              href="https://www.instagram.com/jblw1tt/"
              rel="noopener noreferrer"
              target="_blank"
            >
              photographer
            </Link>
            , small-time{" "}
            <Link
              href="https://www.youtube.com/@joshuablewitt6022"
              rel="noopener noreferrer"
              target="_blank"
            >
              YouTuber
            </Link>
            , and{" "}
            <Link
              href="https://bsky.app/profile/joshblewitt.dev"
              rel="noopener noreferrer"
              target="_blank"
            >
              writer
            </Link>
            . I have ten years of experience in the software industry — from
            testing software to working with stakeholders at companies like
            Domino&apos;s Pizza Group and IQVIA.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/blog"
              className="inline-flex min-h-11 items-center rounded-lg bg-accent px-[22px] py-[11px] text-[15.5px] font-semibold text-accent-contrast no-underline hover:text-accent-contrast"
            >
              Read the blog
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center rounded-lg border border-line px-[22px] py-[11px] text-[15.5px] font-semibold text-muted no-underline hover:border-accent hover:text-ink"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </header>

      <section className="flex flex-col gap-5 border-t border-line pt-9">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="m-0 text-[23px] font-bold tracking-[-0.02em] text-ink">
            Recent posts
          </h2>
          <Link
            href="/blog"
            className="text-[15px] font-semibold text-accent no-underline hover:text-ink"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
          {recentPosts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>
      </section>
    </Layout>
  );
}

export async function getStaticProps() {
  const recentPosts = getSortedPostsData()
    .slice(0, RECENT_POST_COUNT)
    .map(({ id, title, date, description = null, readingTime = null }) => ({
      id,
      title,
      date,
      description,
      readingTime,
    }));

  return { props: { recentPosts } };
}

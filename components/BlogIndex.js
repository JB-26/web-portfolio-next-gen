import Head from "next/head";
import Layout, { siteTitle } from "./layout";
import PinnedPostCard from "./PinnedPostCard";
import PostListRow from "./PostListRow";
import Pagination from "./Pagination";

export const POSTS_PER_PAGE = 5;

// Page 1 lives at /blog; /page/1 also exists and renders identically. That
// duplicate predates the redesign and is left alone (URLs are out of scope).
export function blogHref(page) {
  return page <= 1 ? "/blog" : `/page/${page}`;
}

/**
 * Shared by /blog and /page/[pageNumber] — screenshot 03 shows page 2 keeping
 * the same header and pinned card as page 1, so the two routes differ only in
 * which slice of posts they receive. Previously each page rendered its own
 * near-identical copy of this markup.
 */
export default function BlogIndex({
  posts,
  pinnedPost,
  currentPage,
  numPages,
  totalPosts,
}) {
  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
        <meta
          charSet="utf-8"
          name="The personal website of IT Professional, Joshua Blewitt"
        />
      </Head>

      <header className="max-w-[720px] pt-10 pb-2">
        <h1
          data-testid="blog-posts"
          className="m-0 mb-2.5 text-[clamp(30px,4vw,38px)] font-bold tracking-[-0.03em] text-ink"
        >
          Blog
        </h1>
        <p className="m-0 text-[16.5px] leading-[1.6] text-muted">
          Thoughts on software, testing, AI and the occasional tangent.
        </p>
        <p className="m-0 mt-2 text-[13.5px] leading-[1.5] text-faint italic">
          The views contained herein are those of my own, not of my employer.
        </p>
      </header>

      <PinnedPostCard post={pinnedPost} />

      <div className="flex flex-col pt-7">
        <p
          data-testid="post-counter"
          className="m-0 pb-3.5 font-mono text-[12px] tracking-[0.1em] text-faint uppercase"
        >
          {totalPosts} posts · page {currentPage} of {numPages}
        </p>

        {posts.map((post) => (
          <PostListRow key={post.id} {...post} />
        ))}

        <Pagination
          currentPage={currentPage}
          numPages={numPages}
          hrefFor={blogHref}
        />
      </div>
    </Layout>
  );
}

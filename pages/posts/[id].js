import Layout from "../../components/layout";
import { getAllPostIds, getPostData, getRelatedPosts } from "../../lib/posts";
import Head from "next/head";
import DateFormatter from "../../components/date";
import postStyle from "../../styles/post.module.css";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import dynamic from "next/dynamic";
import { useRef, useSyncExternalStore } from "react";
import TableOfContents from "../../components/TableOfContents";
import AuthorCard from "../../components/AuthorCard";
import TagPill from "../../components/TagPill";

// Lazy-load CommentsSection so it is excluded from the post's initial JS bundle.
// ssr: false avoids hydration mismatches (isOwner is cookie-derived client-side).
const CommentsSection = dynamic(
  () => import("../../components/comments/CommentsSection"),
  { ssr: false, loading: () => null },
);

// isOwner comes from the non-httpOnly sentinel cookie set at login. Read via
// useSyncExternalStore rather than a setState-in-effect: it is external state,
// the server snapshot is always false, and there is no extra render pass.
// The cookie does not change during a page's lifetime, so no subscription is
// needed. Purely decorative — the server re-validates auth on every DELETE.
const subscribeToNothing = () => () => {};
const getIsOwnerSnapshot = () => document.cookie.includes("owner_ui=1");
const getIsOwnerServerSnapshot = () => false;

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id);
  const relatedPosts = getRelatedPosts(params.id, postData.tags, 3);

  return {
    props: {
      postData,
      relatedPosts,
    },
  };
}

export async function getStaticPaths() {
  const paths = getAllPostIds();
  return {
    paths,
    fallback: false,
  };
}

export default function Post({ postData, relatedPosts }) {
  const isOwner = useSyncExternalStore(
    subscribeToNothing,
    getIsOwnerSnapshot,
    getIsOwnerServerSnapshot,
  );

  // The TOC reads headings out of this subtree after mount.
  const articleRef = useRef(null);

  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>

        {/* Open Graph meta tags */}
        <meta property="og:title" content={postData.title} />
        <meta property="og:description" content={postData.description} />
        <meta
          property="og:url"
          content={`https://www.joshblewitt.dev/posts/${postData.id}`}
        />
        <meta property="og:image:alt" content={postData.description} />
        <meta property="og:type" content="article" />
      </Head>

      <div className="flex items-start gap-14 pt-10">
        <div className="min-w-0 max-w-[720px] flex-1">
          <Link
            href="/blog"
            className="text-[14.5px] text-faint no-underline hover:text-ink"
          >
            ← Back to blog
          </Link>

          <article ref={articleRef}>
            <h1 className="mt-3.5 mb-3 text-[clamp(30px,4vw,40px)] font-bold leading-[1.12] tracking-[-0.03em] text-ink">
              {postData.title}
            </h1>

            <div
              className="pb-2 font-mono text-[13.5px] text-faint"
              data-testid="post-reading-time"
            >
              <DateFormatter dateString={postData.date} short />
              {postData.readingTime ? ` · ${postData.readingTime}` : null}
            </div>

            {postData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 pb-5">
                {postData.tags.map((tag) => (
                  <TagPill key={tag} label={tag} href={`/tags/${tag}`} />
                ))}
              </div>
            )}

            <div
              className={`${postStyle.dropCap} prose prose-post max-w-none`}
            >
              <ReactMarkdown
                rehypePlugins={[rehypeRaw, rehypeSlug]}
                components={{
                  a: ({ node, href, children, ...props }) => {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                      >
                        {children}
                      </a>
                    );
                  },
                  // Markdown images can't safely use next/image — arbitrary
                  // author-supplied images have no known dimensions at build
                  // time, and next/image requires either explicit width/height
                  // or `fill` inside a sized parent. Instead, defer loading and
                  // decoding for these (necessarily below-the-fold, non-LCP)
                  // images so they don't compete with the page's real LCP
                  // element for network/main-thread priority.
                  img: ({ node, alt, ...props }) => {
                    return (
                      <img alt={alt || ""} loading="lazy" decoding="async" {...props} />
                    );
                  },
                }}
              >
                {postData.contentHtml}
              </ReactMarkdown>
            </div>
          </article>

          <AuthorCard />

          {relatedPosts.length > 0 && (
            <section className="mt-12" data-testid="related-posts">
              <h2
                className="m-0 mb-2 text-[23px] font-bold tracking-[-0.02em] text-ink"
                data-testid="related-posts-heading"
              >
                Related posts
              </h2>
              <ul className="m-0 list-none p-0">
                {relatedPosts.map((post) => (
                  <li key={post.id} data-testid="related-post-item">
                    <Link
                      href={`/posts/${post.id}`}
                      className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line py-3.5 no-underline"
                    >
                      <span className="text-[16.5px] font-semibold text-ink group-hover:text-accent">
                        {post.title}
                      </span>
                      <span
                        className="font-mono text-[12.5px] whitespace-nowrap text-faint"
                        data-testid="related-post-reading-time"
                      >
                        <DateFormatter dateString={post.date} short />
                        {post.readingTime ? ` · ${post.readingTime}` : null}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Comments — lazy-loaded, client-only, isolated from the post SSG */}
          <section aria-labelledby="comments-heading" className="mt-12">
            <h2
              id="comments-heading"
              className="m-0 mb-5 text-[23px] font-bold tracking-[-0.02em] text-ink"
            >
              Comments
            </h2>
            <CommentsSection postId={postData.id} isOwner={isOwner} />
          </section>
        </div>

        <TableOfContents articleRef={articleRef} />
      </div>
    </Layout>
  );
}

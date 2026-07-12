import Layout from "../../components/layout";
import { getAllPostIds, getPostData, getRelatedPosts } from "../../lib/posts";
import Head from "next/head";
import Date from "../../components/date";
import postStyle from "../../styles/post.module.css";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

// Lazy-load CommentsSection so it is excluded from the post's initial JS bundle.
// ssr: false avoids hydration mismatches (isOwner is cookie-derived client-side).
const CommentsSection = dynamic(
  () => import("../../components/comments/CommentsSection"),
  { ssr: false, loading: () => null },
);

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
  // isOwner is detected client-side from the non-httpOnly sentinel cookie set
  // at login. The CommentsSection uses ssr: false so there is no hydration
  // mismatch — the server always renders null for this component.
  const [isOwner, setIsOwner] = useState(false);
  useEffect(() => {
    setIsOwner(document.cookie.includes("owner_ui=1"));
  }, []);

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
      <article>
        <h1 className="text-2xl font-extrabold tracking-tighter leading-tight mb-3.5 md:text-3xl md:leading-snug">
          {postData.title}
        </h1>
        <div className="text-[#666] dark:text-slate-400 mb-3.5" data-testid="post-reading-time">
          <Date dateString={postData.date} /> &middot; {postData.readingTime}
        </div>
        <div className={`${postStyle.dropCap} prose dark:prose-invert text-black dark:text-slate-100 max-w-none`}>
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
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
      <div className="mr-1.5">
        <h2 className="text-2xl font-extrabold leading-snug mt-4 mb-3">Tags</h2>
        {postData.tags.map((tag) => (
          <Link key={tag} href={`/tags/${tag}`} className="mr-2">
            {tag}
          </Link>
        ))}
      </div>
      {relatedPosts.length > 0 && (
        <div className="mt-8" data-testid="related-posts">
          <h2 className="text-2xl font-extrabold leading-snug mb-3" data-testid="related-posts-heading">Related Posts</h2>
          <ul className="list-none divide-y divide-gray-200 dark:divide-slate-700">
            {relatedPosts.map((post) => (
              <li className="py-3 text-lg md:text-xl" key={post.id} data-testid="related-post-item">
                <Link href={`/posts/${post.id}`} className="block font-semibold mb-1">
                  {post.title}
                </Link>
                <p className="text-[#666] dark:text-slate-400 text-sm m-0">
                  {post.description || "No description available."}
                </p>
                <small className="text-[#666] dark:text-slate-400" data-testid="related-post-reading-time">
                  <Date dateString={post.date} /> &middot; {post.readingTime}
                </small>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Comments — lazy-loaded, client-only, isolated from the post SSG */}
      <section aria-labelledby="comments-heading" className="mt-10">
        <h2
          id="comments-heading"
          className="text-2xl font-extrabold leading-snug mb-5"
        >
          Comments
        </h2>
        <CommentsSection postId={postData.id} isOwner={isOwner} />
      </section>
    </Layout>
  );
}

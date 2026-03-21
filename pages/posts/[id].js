import Layout from "../../components/layout";
import { getAllPostIds, getPostData, getRelatedPosts } from "../../lib/posts";
import Head from "next/head";
import Date from "../../components/date";
import postStyle from "../../styles/post.module.css";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

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
        <div className="text-[#666] mb-3.5" data-testid="post-reading-time">
          <Date dateString={postData.date} /> &middot; {postData.readingTime}
        </div>
        <div className={`${postStyle.dropCap} prose text-black max-w-none`}>
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
          <ul className="list-none divide-y divide-gray-200">
            {relatedPosts.map((post) => (
              <li className="py-3 text-lg md:text-xl" key={post.id} data-testid="related-post-item">
                <Link href={`/posts/${post.id}`} className="block font-semibold mb-1">
                  {post.title}
                </Link>
                <p className="text-[#666] text-sm m-0">
                  {post.description || "No description available."}
                </p>
                <small className="text-[#666]" data-testid="related-post-reading-time">
                  <Date dateString={post.date} /> &middot; {post.readingTime}
                </small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Layout>
  );
}

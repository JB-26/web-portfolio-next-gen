import Layout from "../../components/layout";
import { getAllPostIds, getPostData } from "../../lib/posts";
import Head from "next/head";
import Date from "../../components/date";
import postStyle from "../../styles/post.module.css";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id);

  return {
    props: {
      postData,
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

export default function Post({ postData }) {
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
        <h1 className="text-2xl/9 font-extrabold tracking-tighter mb-3.5 md:text-3xl/9">
          {postData.title}
        </h1>
        <div className="text-[#666] mb-3.5">
          <Date dateString={postData.date} />
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
        <h1 className="text-2xl/9 mt-4 mb-4 font-extrabold">Tags: </h1>
        {postData.tags.map((tag) => (
          <Link key={tag} href={`/tags/${tag}`} className="mr-2">
            {tag}
          </Link>
        ))}
      </div>
    </Layout>
  );
}

import Layout from "../../components/layout";
import { getAllPostIds, getPostData } from "../../lib/posts";
import Head from "next/head";
import Date from "../../components/date";
import utilStyles from "../../styles/utils.module.css";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw';

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
        <meta property="og:url" content={`https://www.joshblewitt.dev/posts/${postData.id}`} />
        <meta property="og:image:alt" content={postData.description} />
        <meta property="og:type" content="article" />
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{postData.title}</h1>
        <div className={utilStyles.lightText}>
          <Date dateString={postData.date} />
        </div>
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{postData.contentHtml}</ReactMarkdown>
      </article>
      <div className={utilStyles.tags}>
        <h1 className={utilStyles.headingLg}>Tags:{" "}</h1>
        {postData.tags.map((tag) => (
          <Link key={tag} href={`/tags/${tag}`} className={utilStyles.tag}>
            {tag}
          </Link>
          ))}
      </div>
    </Layout>
    );
}

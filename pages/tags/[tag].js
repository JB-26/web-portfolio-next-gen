import Layout from "../../components/layout";
import { getPostsByTag, getAllTags } from "../../lib/posts"; // Import the function
import Link from "next/link";
import Head from "next/head";

export async function getStaticProps({ params }) {
  const tag = params.tag;
  const posts = getPostsByTag(tag);

  return {
    props: {
      tag,
      posts,
    },
  };
}

export async function getStaticPaths() {
  const tags = getAllTags();
  const paths = tags.map((tag) => ({ params: { tag } }));

  return {
    paths,
    fallback: false,
  };
}

export default function TagPage({ tag, posts }) {
  return (
    <Layout>
      <Head>
        <title>{tag}</title>
      </Head>
      <h1
        data-testid="tag-heading"
        className="text-2xl/9 font-extrabold tracking-tighter mb-3.5 md:text-3xl/9"
      >
        Posts tagged with {tag}
      </h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <Link href={`/posts/${post.id}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </Layout>
  );
}

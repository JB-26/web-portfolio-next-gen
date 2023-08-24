import Layout from "../../components/layout";
import { getPostsByTag } from "../../lib/posts"; // Import the function
import Link from "next/link";
import Head from "next/head";
import Footer from "../../components/footer";

export async function getServerSideProps({ params }) {
  const tag = params.tag;
  const posts = getPostsByTag(tag);

  return {
    props: {
      tag,
      posts,
    },
  };
}

export default function TagPage({ tag, posts }) {
  return (
    <Layout home>
      <Head>
        <title>{tag}</title>
      </Head>
      <h1>Posts tagged with {tag}</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <Link href={`/posts/${post.id}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
      <Footer></Footer>
    </Layout>
  );
}

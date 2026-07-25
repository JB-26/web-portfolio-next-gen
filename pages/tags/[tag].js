import Head from "next/head";
import Link from "next/link";
import Layout from "../../components/layout";
import PostListRow from "../../components/PostListRow";
import { getPostsByTag, getAllTags } from "../../lib/posts"; // Import the function

// The handoff has no screenshot for this view, so it extrapolates from the blog
// index: the same header block, mono counter and PostListRow rows. Previously
// this was a bare <ul> of title links with no date, description or read time.
//
// Pinned posts are not excluded here — that rule exists to stop the blog index
// showing the same post twice, which doesn't apply to a filtered list.

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

      <header className="max-w-[720px] pt-10 pb-2">
        <Link
          href="/blog"
          className="text-[14.5px] text-faint no-underline hover:text-ink"
        >
          ← Back to blog
        </Link>
        <h1
          data-testid="tag-heading"
          className="m-0 mt-3.5 mb-2.5 text-[clamp(30px,4vw,38px)] font-bold tracking-[-0.03em] text-ink"
        >
          Posts tagged with {tag}
        </h1>
      </header>

      <div className="flex flex-col pt-7">
        <p
          data-testid="post-counter"
          className="m-0 pb-3.5 font-mono text-[12px] tracking-[0.1em] text-faint uppercase"
        >
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </p>

        {posts.map((post) => (
          <PostListRow key={post.id} {...post} />
        ))}
      </div>
    </Layout>
  );
}

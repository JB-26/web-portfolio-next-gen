import BlogIndex, { POSTS_PER_PAGE } from "../../components/BlogIndex";
import { getPinnedPost, getUnpinnedPosts } from "../../lib/posts";

export async function getStaticPaths() {
  const numPages = Math.max(
    1,
    Math.ceil(getUnpinnedPosts().length / POSTS_PER_PAGE),
  );

  return {
    paths: Array.from({ length: numPages }, (_, i) => ({
      params: { pageNumber: (i + 1).toString() },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const unpinned = getUnpinnedPosts();
  const pinnedPost = getPinnedPost();
  const pageNumber = parseInt(params.pageNumber, 10);
  const start = (pageNumber - 1) * POSTS_PER_PAGE;

  return {
    props: {
      posts: unpinned.slice(start, start + POSTS_PER_PAGE),
      pinnedPost: pinnedPost ?? null,
      currentPage: pageNumber,
      numPages: Math.max(1, Math.ceil(unpinned.length / POSTS_PER_PAGE)),
      totalPosts: unpinned.length,
    },
  };
}

export default function BlogPage(props) {
  return <BlogIndex {...props} />;
}

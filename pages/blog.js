import BlogIndex, { POSTS_PER_PAGE } from "../components/BlogIndex";
import { getPinnedPost, getUnpinnedPosts } from "../lib/posts";

export async function getStaticProps() {
  // The pinned post is excluded from the paginated list so it never appears
  // twice, and the counter/page-count are computed from the unpinned set.
  const unpinned = getUnpinnedPosts();
  const pinnedPost = getPinnedPost();

  return {
    props: {
      posts: unpinned.slice(0, POSTS_PER_PAGE),
      pinnedPost: pinnedPost ?? null,
      currentPage: 1,
      numPages: Math.max(1, Math.ceil(unpinned.length / POSTS_PER_PAGE)),
      totalPosts: unpinned.length,
    },
  };
}

export default function Blog(props) {
  return <BlogIndex {...props} />;
}

import Head from "next/head";
import Date from "../../components/date";
import Layout, { siteTitle } from "../../components/layout";
import Footer from "../../components/footer";
import { getSortedPostsData } from "../../lib/posts";
import Link from "next/link";

const postsPerPage = 5;

export async function getStaticPaths() {
  const allPostsData = getSortedPostsData();
  const numPages = Math.ceil(allPostsData.length / postsPerPage);
  const paths = Array.from({ length: numPages }, (_, i) => ({
    params: { pageNumber: (i + 1).toString() },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const allPostsData = getSortedPostsData();
  const pageNumber = parseInt(params.pageNumber, 10);
  const startIndex = (pageNumber - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = allPostsData.slice(startIndex, endIndex);

  return {
    props: {
      currentPosts,
      pageNumber,
      numPages: Math.ceil(allPostsData.length / postsPerPage),
    },
  };
}

export default function BlogPage({ currentPosts, numPages, pageNumber }) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className="text-xl">
        <h1 className="text-2xl font-extrabold tracking-tighter leading-tight mb-3.5 md:text-3xl md:leading-snug">
          Blog - Page {pageNumber}
        </h1>
        <ul className="list-none mb-2 divide-y divide-gray-200">
          {currentPosts.map(({ id, date, title, description }) => (
            <li className="py-4 text-lg md:text-xl" key={id}>
              <Link href={`/posts/${id}`} className="block font-semibold mb-1">{title}</Link>
              <p className="text-[#666] text-sm m-0">{description || "No description available"}</p>
              <small className="text-[#666]">
                <Date dateString={date} />
              </small>
            </li>
          ))}
        </ul>
        {/* Pagination links */}
        <nav aria-label="Blog pagination" className="mb-3.5 overflow-hidden">
          <ol className="flex flex-nowrap overflow-x-auto gap-2 list-none p-0 m-0 pb-1 scrollbar-none">
            {Array.from({ length: numPages }, (_, i) => (
              <li key={i + 1}>
                <Link
                  href={`/page/${i + 1}`}
                  aria-label={`Page ${i + 1}`}
                  className="flex items-center justify-center w-11 h-11 rounded border border-gray-300 text-base font-medium hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  {i + 1}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </section>
      <Footer></Footer>
    </Layout>
  );
}

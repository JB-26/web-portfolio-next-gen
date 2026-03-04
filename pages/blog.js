import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import Footer from "../components/footer";
import Date from "../components/date";
import { getSortedPostsData, getPostDataByName } from "../lib/posts";
import Link from "next/link";

const postsPerPage = 5;
import { useRouter } from "next/router";

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  const allPostsNum = allPostsData.length;
  const numPages = Math.ceil(allPostsData.length / postsPerPage);
  const specificPostName = "2025-01-30-scrum"; // Replace with the desired post name, without the .md file extension
  const specificPostData = await getPostDataByName(specificPostName);

  return {
    props: {
      allPostsData: allPostsData.slice(0, postsPerPage),
      numPages,
      allPostsNum,
      specificPostData,
    },
  };
}

export default function Blog({
  allPostsData,
  numPages,
  allPostsNum,
  specificPostData,
}) {
  const router = useRouter();

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
        <meta
          charSet="utf-8"
          name="The personal website of IT Professional, Joshua Blewitt"
        />
      </Head>
      <section className="text-xl">
        <p className="italic text-lg text-black mb-3.5 md:text-xl">
          The views contained herein are those of my own, not of my employer.
        </p>
        <h1
          data-testid="pinned"
          className="text-2xl font-extrabold tracking-tighter leading-tight mb-3.5 md:text-3xl md:leading-snug"
        >
          Pinned Post
        </h1>
        <div className="py-3 text-lg md:text-xl">
          <Link href={`/posts/${specificPostData.name}`} className="block font-semibold mb-1">
            {specificPostData.title}
          </Link>
          <p className="text-[#666] text-sm m-0">{specificPostData.description || "No description available"}</p>
          <small className="text-[#666]">
            <Date dateString={specificPostData.date} />
          </small>
        </div>

        <h1
          data-testid="blog-posts"
          className="text-2xl font-extrabold tracking-tighter leading-tight mb-3.5 md:text-3xl md:leading-snug"
        >
          Blog - {allPostsNum} posts
        </h1>
        <ul className="list-none mb-2 divide-y divide-gray-200">
          {allPostsData.map(({ id, date, title, description }) => (
            <li className="py-3 text-lg md:text-xl" key={id}>
              <Link href={`/posts/${id}`} className="block font-semibold mb-1">{title}</Link>
              <p className="text-[#666] text-sm m-0">{description || "No description available."}</p>
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

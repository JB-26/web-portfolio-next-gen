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
          className="text-2xl/9 font-extrabold tracking-tighter mb-3.5 md:text-3xl/9"
        >
          Pinned Post
        </h1>
        <div className="mb-3.5 text-lg md:text-xl">
          <Link href={`/posts/${specificPostData.name}`}>
            {specificPostData.title}
          </Link>
          <br />
          <small className="text-[#666]">
            {specificPostData.description || "No description available"}
          </small>
          <br />
          <small className="text-[#666]">
            <Date dateString={specificPostData.date} />
          </small>
        </div>

        <h1
          data-testid="blog-posts"
          className="text-2xl/9 font-extrabold tracking-tighter mb-3.5 md:text-3xl/9"
        >
          Blog - {allPostsNum} posts
        </h1>
        <ul className="list-none mb-5">
          {allPostsData.map(({ id, date, title, description }) => (
            <li className="mb-3.5" key={id}>
              <Link href={`/posts/${id}`}>{title}</Link>
              <br />
              <small className="text-[#666]">
                {description || "No description available."}
              </small>
              <br />
              <small className="text-[#666]">
                <Date dateString={date} />
              </small>
            </li>
          ))}
        </ul>
        {/* Pagination links */}
        <div className="whitespace-nowrap relative overflow-x-scroll overflow-y-hidden overflow-scroll mb-3.5">
          {Array.from({ length: numPages }, (_, i) => (
            <Link
              style={{ margin: "0.5rem" }}
              href={`/page/${i + 1}`}
              key={i + 1}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      </section>
      <Footer></Footer>
    </Layout>
  );
}

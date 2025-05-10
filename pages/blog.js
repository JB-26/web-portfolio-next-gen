import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import Footer from "../components/footer";
import Date from "../components/date";
import utilStyles from "../styles/utils.module.css";
import paginationStyle from "../styles/blog.module.css";
import { getSortedPostsData, getPostDataByName } from "../lib/posts";
import Link from "next/link";

const postsPerPage = 5;
import { useRouter } from "next/router";

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  const allPostsNum = allPostsData.length;
  const numPages = Math.ceil(allPostsData.length / postsPerPage);
  const specificPostName = "2024-03-02-ppp-meetings"; // Replace with the desired post name, without the .md file extension
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
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <p className={utilStyles.info}>
          The views contained herein are those of my own, not of my employer.
        </p>
        <h1 data-testid="pinned" className={utilStyles.headingXl}>
          Pinned Post
        </h1>
        <div className={utilStyles.listItem}>
          <Link href={`/posts/${specificPostData.name}`}>
            {specificPostData.title}
          </Link>
          <br />
          <small className={utilStyles.lightText}>
            {specificPostData.description || "No description available"}
          </small>
          <br />
          <small className={utilStyles.lightText}>
            <Date dateString={specificPostData.date} />
          </small>
        </div>

        <h1 data-testid="blog-posts" className={utilStyles.headingXl}>
          Blog - {allPostsNum} posts
        </h1>
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, date, title, description }) => (
            <li className={utilStyles.listItem} key={id}>
              <Link href={`/posts/${id}`}>{title}</Link>
              <br />
              <small className={utilStyles.lightText}>
                {description || "No description available."}
              </small>
              <br />
              <small className={utilStyles.lightText}>
                <Date dateString={date} />
              </small>
            </li>
          ))}
        </ul>
        {/* Pagination links */}
        <div className={paginationStyle.pagination}>
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

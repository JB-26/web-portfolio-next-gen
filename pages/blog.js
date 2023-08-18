import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import Footer from "../components/footer";
import Date from "../components/date";
import utilStyles from "../styles/utils.module.css";
import paginationStyle from "../styles/blog.module.css";
import { getSortedPostsData, getPostDataByName } from "../lib/posts";
import Link from "next/link";

const postsPerPage = 5;
import Script from "next/script";

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  const allPostsNum = allPostsData.length;
  const numPages = Math.ceil(allPostsData.length / postsPerPage);
  const specificPostName = "2023-03-26-MK-tech"; // Replace with the desired post name, without the .md file extension
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
  return (
    <Layout home>
      <Script
        src="https://kit.fontawesome.com/af67ca5a39.js"
        crossOrigin="anonymous"
        async
      ></Script>
      <Head>
        <title>{siteTitle}</title>
        <meta
          charSet="utf-8"
          name="The personal website of IT Professional, Joshua Blewitt"
        />
      </Head>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h1 className={utilStyles.headingXl}>
          Pinned Post <i className="fa-solid fa-thumbtack"></i>
        </h1>
        <div className={utilStyles.listItem}>
          <Link href={`/posts/${specificPostData.name}`}>
            {specificPostData.title}
          </Link>
          <br />
          <small className={utilStyles.lightText}>
            <Date dateString={specificPostData.date} />
          </small>
        </div>

        <h1 className={utilStyles.headingXl}>Blog - {allPostsNum} posts</h1>
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, date, title }) => (
            <li className={utilStyles.listItem} key={id}>
              <Link href={`/posts/${id}`}>{title}</Link>
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

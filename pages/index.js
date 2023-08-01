import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import { getSortedPostsData } from "../lib/posts";
import Link from "next/link";
import Date from "../components/date";
const postsPerPage = 5;

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  const allPostsNum = allPostsData.length;
  const numPages = Math.ceil(allPostsData.length / postsPerPage);

  return {
    props: {
      allPostsData: allPostsData.slice(0, postsPerPage),
      numPages,
      allPostsNum
    },
  };
}

export default function Home({ allPostsData, numPages, allPostsNum }) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>I'm Joshua Blewitt, hobbyist developer!</p>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog - {allPostsNum} posts</h2>
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
        <div>
          {Array.from({ length: numPages }, (_, i) => (
            <Link style={{ margin: '0.5rem' }} href={`/page/${i + 1}`} key={i + 1}>
              {i + 1}
            </Link>
            ))}
        </div>
      </section>
    </Layout>
  );
}

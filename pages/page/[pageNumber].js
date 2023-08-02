import Head from "next/head";
import Layout, { siteTitle } from "../../components/layout";
import Footer from "../../components/footer";
import utilStyles from "../../styles/utils.module.css";
import { getSortedPostsData } from "../../lib/posts";
import Link from "next/link";
import Date from "../../components/date";

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
      <section className={utilStyles.headingMd}>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog - Page {pageNumber}</h2>
        <ul className={utilStyles.list}>
          {currentPosts.map(({ id, date, title }) => (
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

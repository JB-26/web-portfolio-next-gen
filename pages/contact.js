import Layout, { siteTitle } from "../components/layout";
import Footer from "../components/footer";
import Head from "next/head";
import Link from "next/link";
import utilStyles from "../styles/utils.module.css";

export default function Contact() {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
        <meta
          charSet="utf-8"
          name="The personal website of IT Professional, Joshua Blewitt"
        />
      </Head>
      <section className={utilStyles.headingMd}>
        <h1 data-testid="heading1" className={utilStyles.headingXl}>
          Contact
        </h1>
      </section>
      <Footer></Footer>
    </Layout>
  );
}

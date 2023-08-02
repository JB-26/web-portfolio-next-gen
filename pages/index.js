import Layout, { siteTitle } from "../components/layout";
import Footer from "../components/footer";
import utilStyles from "../styles/utils.module.css";
import Script from 'next/script'
import Head from "next/head";

export default function Home() {
  return (
    <Layout home>
      <Script src='https://kit.fontawesome.com/af67ca5a39.js' crossOrigin='anonymous' async></Script>
      <Head>
        <title>{siteTitle}</title>
        <meta charSet='utf-8' name="The personal website of IT Professional, Joshua Blewitt"/>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>I&apos;m Joshua Blewitt, hobbyist developer!</p>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>

      </section>
      <Footer></Footer>
    </Layout>
  );
}

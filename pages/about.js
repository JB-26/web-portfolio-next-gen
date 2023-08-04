import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import Footer from "../components/footer";
import utilStyles from "../styles/utils.module.css";
import styles from "../styles/about.module.css";
import Script from "next/script";
import Image from "next/image";
import Img from "../public/images/me.webp";

export default function About() {
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
      <section className={utilStyles.headingMd}>
        <h1 className={utilStyles.headingXl}>A bit about me</h1>
        <i>I&apos;m a Test Engineer, hobbyist developer and problem solver.</i>
      </section>
      <section className={`${utilStyles.headingMd}`}>
        <p>
          <Image
            className={styles.imageAboutRight}
            priority
            src={Img}
            alt="I sure love donuts 🍩"
          />
          I&apos;m an IT Professional with 9 years of experience with a First Class Degree in Computer Science. I&apos;m
          currently a Software Test Engineer at IQVIA. I&apos;ve previously
          worked for companies like Domino&apos;s Pizza Group. I&apos;ve mostly
          worked within testing of software. I enjoy programming as a hobby and
          problem solving.
          <br />
          <br />I continue to learn by reading, watching videos and taking
          courses to expand my knowledge and way of thinking. Personal
          devleopment continues to be important to me as I want to improve my
          skills in being a better problem solver.
          <br />
          <br />
          I consider myself to be a donut connoisseur.
        </p>
      </section>
      <Footer></Footer>
    </Layout>
  );
}

import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import Footer from "../components/footer";
import utilStyles from "../styles/utils.module.css";
import styles from "../styles/about.module.css";
import Script from "next/script";
import Image from "next/image";
import Img from "../public/images/me.webp";
import Link from "next/link";

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
        <h1 data-testid="heading" className={utilStyles.headingXl}>A bit about me</h1>
        <i data-testid="intro">I&apos;m an Application Analyst, hobbyist developer, hobbyist podcaster and problem solver.</i>
      </section>
      <section className={`${utilStyles.headingMd}`}>
        <p>
          <Image
            className={styles.imageAboutRight}
            priority
            src={Img}
            alt="A picture of myself in a restaurant"
          />
          I&apos;m an IT Professional with 9 years of experience with a First Class Degree in Computer Science. I&apos;m
          currently an Application Analyst at Rightmove. I&apos;ve previously
          worked for companies like Domino&apos;s Pizza Group and IQVIA. I&apos;ve mostly
          worked within testing of software, but have moved into a role where I can analyse business problems, design and deliver technical solutions. I enjoy programming as a hobby and
          problem solving.
          <br />
          <br />I continue to learn by reading, watching videos and taking
          courses to expand my knowledge and way of thinking. Personal
          devleopment continues to be important to me as I want to improve my
          skills in being a better problem solver.
          <br />
          <br />
          Outside of work, I enjoy playing video games, watching TV, reading and planning my next trip.
          I consider myself to be a donut connoisseur.
          <br />
          <br />
          I also work on a small project, <Link href='https://github.com/JB-26/super-blog-starter'>Super Blog Starter</Link>, which allows anyone to get up and running with a great blog. Filled with features such as pagination, tagging posts, searching for posts and an RSS feed out of the box.
          <br />
          <br />
          Plus, I work on a related project, called <Link href='https://github.com/JB-26/super-podcast-starter'>Super Podcast Starter</Link>, allowing anyone with a podcast to have a great looking website.
        </p>
      </section>
      <Footer></Footer>
    </Layout>
  );
}

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
        <h1 data-testid="heading" className={utilStyles.headingXl}>
          A bit about me
        </h1>
        <i data-testid="intro" className={styles.intro}>
        I&apos;m passionate about product, a technology advocate, customer champion, and
          hobbyist podcaster.
        </i>
      </section>
      <section className={`${utilStyles.headingMd}`}>
        <p>
          <Image
            className={styles.imageAboutRight}
            priority
            src={Img}
            alt="A picture of myself in a restaurant"
          />
          I&apos;m an IT Professional with 9 years of experience in software
          development with a First Class Degree in Computer Science. I&apos;m
          currently looking for my next challenge. I&apos;ve previously worked
          for companies like Domino&apos;s Pizza Group, IQVIA and Rightmove.
          I&apos;ve mostly worked within testing of software, but have moved
          into a career where I can analyse business problems, design and
          deliver technical solutions. I enjoy programming as a hobby and
          problem solving.
          <br />
          <br />I continue to learn by reading, watching videos and taking
          courses to expand my knowledge and way of thinking. Personal
          devleopment continues to be important to me as I want to improve my
          skills in being a better problem solver.
          <br />
          <br />
          Outside of work, I enjoy playing video games, watching TV, reading and
          planning my next trip.
          <br />
          <br />I also work on a small project,{" "}
          <Link href="https://github.com/JB-26/super-blog-starter" rel="noopener noreferrer" target="_blank">
            Super Blog Starter
          </Link>
          , which allows anyone to get up and running with a great blog. Filled
          with features such as pagination, tagging posts, searching for posts
          and an RSS feed out of the box.
          <br />
          <br />
          Plus, I work on a related project, called{" "}
          <Link href="https://github.com/JB-26/super-podcast-starter" rel="noopener noreferrer" target="_blank">
            Super Podcast Starter
          </Link>
          , allowing anyone with a podcast to have a great looking website.
          <br />
          <br />
          I&apos;m also the host of the{" "}
          <Link href="https://stuff-i-dont-know.vercel.app/" rel="noopener noreferrer" target="_blank">
            &ldquo;Stuff I Don&apos;t Know!&ldquo;
          </Link>{" "}
          podcast.
          <br />
          <br />
          I&apos;m also active on the following platforms:
          <ul>
            <li><Link href="https://www.threads.net/@jblw1tt" rel="noopener noreferrer" target="_blank">Threads</Link></li>
            <li><Link href="https://mastodon.social/@jblewitt" rel="noopener noreferrer" target="_blank">Mastodon</Link></li>
          </ul>
        </p>
      </section>
      <Footer></Footer>
    </Layout>
  );
}

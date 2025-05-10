import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import Footer from "../components/footer";
import utilStyles from "../styles/utils.module.css";
import styles from "../styles/about.module.css";
import Image from "next/image";
import Img from "../public/images/about_photo_2.png";

export default function About() {
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
        <h1 data-testid="heading" className={utilStyles.headingXl}>
          A bit about me
        </h1>
        <i data-testid="intro" className={styles.intro}>
          I&apos;m passionate about product, a technology advocate, and customer
          champion.
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
          I&apos;m Joshua Blewitt. I currently live in the United Kingdom.
          I&apos;ve had a fascination with computers and software since I was a
          child in the 90&apos;s, growing up with Windows 98 and then Windows
          XP, which introduced me to the information superhighway and the
          possibilities of web applications.
          <br />
          <br />
          I graduated from University with a First Class Degree in Computer
          Science in 2014, and started work as a software tester for a small
          firm based in my home city of Milton Keynes.
          <br />
          <br />
          With a 10 year career working at companies like Domino&apos;s Pizza
          Group, IQVIA and Rightmove, I&apos;ve gained a wealth of experience in
          testing, software delivery and product management. I&apos;m currently
          an Assessment Systems Executive at the ICAEW.
          <br />
          <br />
          Writing posts on this blog is one of my favourite hobbies. I&apos;ve
          been maintaining this blog for five years and have written posts
          regarding professional work, self development and life. I also enjoy
          programming as a hobby. I am currently reading books and improving my
          knowledge of product management and UX.
          <br />
          <br />
          I continue to learn by reading, watching videos and taking courses to
          expand my knowledge and way of thinking. Personal devleopment
          continues to be important to me as I want to improve my skills in
          being a better problem solver.
          <br />
          <br />
          Outside of work, I enjoy playing video games, watching TV, reading and
          planning my next trip.
          <br />
          <br />
          The views contained herein are those of my own, not of my employer.
        </p>
      </section>
      <Footer></Footer>
    </Layout>
  );
}

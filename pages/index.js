import Layout, { siteTitle } from "../components/layout";
import Footer from "../components/footer";
import utilStyles from "../styles/utils.module.css";
import styles from "../styles/index.module.css";
import Script from 'next/script'
import Head from "next/head";
import Image from "next/image";
import indexImage from "../public/images/new_2023.webp";

export default function Home() {
  return (
    <Layout home>
      <Script src='https://kit.fontawesome.com/af67ca5a39.js' crossOrigin='anonymous' async></Script>
      <Head>
        <title>{siteTitle}</title>
        <meta charSet='utf-8' name="The personal website of IT Professional, Joshua Blewitt"/>
      </Head>
      <section className={utilStyles.headingMd}>
        <div className={styles.content}>
          <div className={styles.left}>
            <h1 className={utilStyles.heading2Xl}>
              Hey, I&apos;m Joshua Blewitt {"  "}
              <span role='img' aria-label='string'>
                👋
              </span>
            </h1>
            <p className={styles.known}>But you can call me JB.</p>
            <p>
              I&apos;m a hobbyist developer, technology advocate, analyst and curious mind that&apos;s based in the United
              Kingdom. My current work as an Application Analyst allows me to enable change by defining needs and recommending solutions that deliver value to stakeholders.
              In my spare time, I enjoy collecting and playing retro games, listening to podcasts, and
              travelling.
            </p>
            <div className={styles.buttonContainer}>
              <a className={styles.emailButton} href='mailto:joshblewitt@protonmail.com'>
                Get in touch! <i className='fa-regular fa-envelope'></i>
              </a>
            </div>
          </div>
          <div className={styles.right}>
            <Image priority className={styles.image} src={indexImage} alt='Me at Dishoom in London!'/>
          </div>
        </div>
      </section>
      <Footer></Footer>
    </Layout>
  );
}

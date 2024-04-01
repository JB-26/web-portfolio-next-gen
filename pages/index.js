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
            <h1 data-testid="main-heading" className={utilStyles.heading2Xl}>
              Hey, I&apos;m Joshua Blewitt {"  "}
              <span role='img' aria-label='string'>
                👋
              </span>
            </h1>
            <p data-testid="subtitle" className={styles.known}>But call me JB.</p>
            <p><i className="fa-solid fa-location-dot"></i> United Kingdom</p>
            <p><i className="fa-solid fa-briefcase"></i> Application Analyst @ Rightmove</p>
            <p data-testid="paragraph">
              I&apos;m a hobbyist developer, technology advocate, and curious mind.
              My current work allows me to analyse business problems, design and deliver technical solutions that deliver value to stakeholders.
            </p>
          </div>
          <div data-testid="image" className={styles.right}>
            <Image priority className={styles.image} src={indexImage} alt='Me at Dishoom in London!'/>
          </div>
        </div>
        <div data-testid="button" className={styles.buttonContainer}>
          <a className={styles.emailButton} href='mailto:joshblewitt@protonmail.com'>
            Get in touch! <i className='fa-regular fa-envelope'></i>
          </a>
        </div>
      </section>
      <Footer></Footer>
    </Layout>
  );
}

import Layout, { siteTitle } from "../components/layout";
import Footer from "../components/footer";
import utilStyles from "../styles/utils.module.css";
import styles from "../styles/index.module.css";
import Head from "next/head";
import Image from "next/image";
import indexImage from "../public/images/new_2025.png";
import paperPlane from "../public/icons/paper_plane.svg";
import Link from "next/link";

export default function Home() {
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
        <div className={styles.content}>
          <div className={styles.left}>
            <h1 data-testid="main-heading" className={utilStyles.heading2Xl}>
              Hey, I&apos;m{" "}
              <div className={styles.gradientText}>Joshua Blewitt</div> {"  "}
              <span role="img" aria-label="string">
                👋
              </span>
            </h1>
            <p data-testid="subtitle" className={styles.known}>
              But call me JB.
            </p>
            <p>
              <span role="img" aria-label="string" className={styles.emoji}>
                📍
              </span>{" "}
              {"  "} United Kingdom
            </p>
            <p>
              <span role="img" aria-label="string" className={styles.emoji}>
                💼
              </span>{" "}
              {"  "} Assessment Systems Executive @ ICAEW
            </p>
            <p>
              <span role="img" aria-label="string" className={styles.emoji}>
                📄
              </span>{" "}
              {"  "}
              <Link
                href="https://j-blewitt.notion.site/Joshua-Blewitt-Resume-CV-accea10012824431bc7f8654d77590a2?pvs=4"
                rel="noopener noreferrer"
                target="_blank"
              >
                Online Resume/CV
              </Link>
            </p>
            <p data-testid="paragraph">
              I&apos;m passionate about product, a technology advocate, customer
              champion, and curious mind. My work allows me to analyse business
              problems, design and deliver technical solutions that deliver
              value to stakeholders.
            </p>
          </div>
          <div data-testid="image" className={styles.right}>
            <Image
              priority
              className={styles.image}
              src={indexImage}
              alt="Cartoon image of myself"
            />
          </div>
        </div>
        <div data-testid="button" className={styles.buttonContainer}>
          <a
            className={styles.emailButton}
            href="mailto:joshblewitt@protonmail.com"
          >
            Email me <Image priority className={styles.icon} src={paperPlane} />
          </a>
        </div>
      </section>
      <Footer></Footer>
    </Layout>
  );
}

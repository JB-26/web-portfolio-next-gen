import Layout, { siteTitle } from "../components/layout";
import Footer from "../components/footer";
import utilStyles from "../styles/utils.module.css";
import styles from "../styles/index.module.css";
import Head from "next/head";
import Image from "next/image";
import indexImage from "../public/images/profile_photo_2.png";

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
      <div className="flex flex-col-reverse md:flex-row justify-center">
        <div className="max-w-[20rem] md:max-w-none lg:w-[2500px]">
          <h1
            data-testid="main-heading"
            className="text-[2.5rem]/[1.2] font-extrabold"
          >
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
          <p data-testid="paragraph">
            I&apos;m passionate about product, a technology advocate, customer
            champion, and curious mind. My work allows me to analyse business
            problems, design and deliver technical solutions that deliver value
            to stakeholders.
          </p>
        </div>
        <div data-testid="image" className={styles.right}>
          <Image
            priority
            className={styles.image}
            src={indexImage}
            alt="Photo of myself, presented in a polaroid frame"
          />
        </div>
      </div>
      <Footer></Footer>
    </Layout>
  );
}

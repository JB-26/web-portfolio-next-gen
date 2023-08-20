import Head from "next/head";
import styles from "./layout.module.css";
import Link from "next/link";
import Header from "./header";
import Footer from "./footer";
import Signature from "./signature";

export const siteTitle = "Joshua Blewitt";

export default function Layout({ children, home }) {
  return (
    <div className={styles.container}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="The website of IT Professional, Joshua Blewitt"
        />
        <meta
          property="og:image"
          content={`https://og-image.vercel.app/${encodeURI(
            siteTitle
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Header></Header>
      <main>{children}</main>
      {!home && (
        <>
          <Signature></Signature>
          <div className={styles.backToHome}>
            <Link href="/blog">← Back to blog</Link>
          </div>
        <Footer></Footer>
        </>
      )}
    </div>
  );
}

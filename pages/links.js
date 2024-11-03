import Layout, { siteTitle } from "../components/layout";
import Footer from "../components/footer";
import Script from "next/script";
import Head from "next/head";
import Link from "next/link";
import utilStyles from "../styles/utils.module.css";

export default function Links() {
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
        <h1 data-testid="heading1" className={utilStyles.headingXl}>
          Links
        </h1>
      </section>
      <section data-testid="content" className={`${utilStyles.headingMd}`}>
        <h2 data-testid="heading" className={utilStyles.headingLg}>
          Social Media
        </h2>
        <p>
          I’m quite active on{" "}
          <Link
            href="https://www.threads.net/intent/follow?username=jblw1tt"
            rel="noopener noreferrer"
            target="_blank"
          >
            Threads
          </Link>
          , and the account is federated so you can follow me on{" "}
          <Link
            href="https://mastodon.social/@jblw1tt@threads.net"
            rel="noopener noreferrer"
            target="_blank"
          >
            Mastodon
          </Link>{" "}
          if you prefer. I can also be found on{" "}
          <Link
            href="https://bsky.app/profile/joshblewitt.dev"
            rel="noopener noreferrer"
            target="_blank"
          >
            Bluesky
          </Link>
          . These are the places where I am active the most.
        </p>
        <h2 data-testid="heading" className={utilStyles.headingLg}>
          Professional
        </h2>
        <p>
          I am on{" "}
          <Link
            href="https://www.linkedin.com/in/jblewitt/"
            rel="noopener noreferrer"
            target="_blank"
          >
            LinkedIn
          </Link>
          . I don’t post there very much but feel free to add me (and send a
          message that you found this link from my site).
        </p>
        <p>
          I am also a certified{" "}
          <Link
            href="https://s3.amazonaws.com/scruminc-certs/RSM-8823626"
            rel="noopener noreferrer"
            target="_blank"
          >
            Scrum Master
          </Link>{" "}
          and have a foundation level{" "}
          <Link
            href="https://www.linkedin.com/in/jblewitt/details/certifications/1719413746906/single-media-viewer/?type=DOCUMENT&profileId=ACoAABNnSV0BPiMy5z3Y7_cW0HdDAuKeIs7pH0A"
            rel="noopener noreferrer"
            target="_blank"
          >
            ISTQB certificate.
          </Link>{" "}
          I also have a certificate in web design from{" "}
          <Link
            href="https://www.freecodecamp.org/certification/fcc2927573c-68b6-4b92-954b-d97d1ea76b7f/responsive-web-design"
            rel="noopener noreferrer"
            target="_blank"
          >
            freeCodeCamp
          </Link>
          .
        </p>
        <h2 data-testid="heading" className={utilStyles.headingLg}>
          Work and Projects
        </h2>
        <p>
          I have a{" "}
          <Link
            href="https://github.com/JB-26"
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub
          </Link>{" "}
          where you can see the code for this website and a few other active
          (and inactive) projects. Why not take a look at{" "}
          <Link
            href="https://github.com/JB-26/super-blog-starter"
            rel="noopener noreferrer"
            target="_blank"
          >
            Super Blog Starter
          </Link>
          ? That’s based on this blog so you can have a nice looking blog of
          your very own!
        </p>
      </section>
      <Footer></Footer>
    </Layout>
  );
}

import Layout, { siteTitle } from "../components/layout";
import Footer from "../components/footer";
import styles from "../styles/index.module.css";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
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
      {/* Hero section: stacks vertically on mobile and tablet (including iPad Mini
          portrait at 768 px). The side-by-side layout only engages at lg (1024 px)
          where there is enough horizontal space for both columns to breathe. */}
      <div className="flex flex-col-reverse lg:flex-row justify-center gap-6 lg:gap-10 mb-2">
        {/* Text column: flex-1 min-w-0 lets it fill remaining space in row mode
            without overflowing its parent — the correct flex shrink pattern. */}
        <div className="flex-1 min-w-0">
          <h1
            data-testid="main-heading"
            className="text-3xl md:text-[2.5rem] md:leading-tight font-extrabold"
          >
            Hey, I&apos;m{" "}
            <div className={styles.gradientText}>Joshua Blewitt</div>{" "}
            {/* Decorative emoji — hidden from assistive technology */}
            <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-3 text-lg leading-relaxed" data-testid="paragraph">
            A hobbyist{" "}
            <Link
              href="https://github.com/JB-26"
              rel="noopener noreferrer"
              target="_blank"
              className="font-extrabold"
            >
              developer
            </Link>
            , technologist, traveller, amateur{" "}
            <Link
              href="https://www.instagram.com/jblw1tt/"
              rel="noopener noreferrer"
              target="_blank"
              className="font-extrabold"
            >
              photographer
            </Link>
            , small-time{" "}
            <Link
              href="https://www.youtube.com/@joshuablewitt6022"
              rel="noopener noreferrer"
              target="_blank"
              className="font-extrabold"
            >
              YouTuber
            </Link>
            , and{" "}
            <Link
              href="https://bsky.app/profile/joshblewitt.dev"
              rel="noopener noreferrer"
              target="_blank"
              className="font-extrabold"
            >
              writer
            </Link>
            . I have ten years of experience in the software industry. From
            testing software to working with stakeholders, my work allows me to
            analyse business problems, design and deliver technical solutions
            that deliver value. <br />
            Described as a technology advocate, problem solver and curious mind.{" "}
            <br />
            I&apos;ve{" "}
            <Link
              href="https://www.linkedin.com/in/jblewitt/"
              rel="noopener noreferrer"
              target="_blank"
              className="font-extrabold"
            >
              worked
            </Link>{" "}
            at major companies such as Domino&apos;s Pizza Group and IQVIA.{" "}
            <br />
            If I&apos;m not working on my street photography skills, I&apos;m
            either writing my next blog post, YouTube video, or practicing
            programming. <br />
          </p>
        </div>
        {/* Image column: centred in stacked mode; auto-sized in row mode so it
            doesn't claim a fixed width that overflows the container.
            max-w-xs caps the image on small screens; lg:max-w-sm gives it
            a comfortable ceiling once the row layout is active. */}
        <div
          data-testid="image"
          className="flex justify-center items-start"
        >
          <Image
            priority
            className="rounded-3xl w-auto h-auto max-w-xs lg:max-w-sm lg:rotate-3 hover:rotate-0 hover:scale-105 transition-transform duration-300 motion-reduce:transition-none motion-reduce:hover:transform-none"
            src={indexImage}
            alt="Photo of myself, presented in a polaroid frame"
          />
        </div>
      </div>
      <Footer></Footer>
    </Layout>
  );
}

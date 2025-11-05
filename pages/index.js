import Layout, { siteTitle } from "../components/layout";
import Footer from "../components/footer";
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
      <div className="flex flex-col-reverse md:flex-row justify-center mb-2">
        <div className="max-w-[20rem] md:max-w-none lg:w-[2500px]">
          <h1
            data-testid="main-heading"
            className="text-3xl md:text-[2.5rem]/[1.2] font-extrabold"
          >
            Hey, I&apos;m{" "}
            <div className={styles.gradientText}>Joshua Blewitt</div> {"  "}
            <span role="img" aria-label="string">
              👋
            </span>
          </h1>
          <p className="mt-2 text-lg" data-testid="paragraph">
            A hobbyist developer, technologist, traveller, amateur photographer,
            small-time YouTuber, and writer. I have a ten years of experience in
            the software industry. From testing software to working with
            stakeholders, my work allows me to analyse business problems, design
            and deliver technical solutions that deliver value. <br />
            Described as a technology advocate, problem solver and curious mind.{" "}
            <br />
            I&apos;ve worked at major companies such as Domino&apos;s Pizza
            Group and IQVIA. <br />
            If I&apos;m not working on my street photography skills, I'm either
            writing my next blog post, YouTube video, or practicing programming.{" "}
            <br />
          </p>
        </div>
        <div
          data-testid="image"
          className="flex justify-center items-center text-center md:w-7xl"
        >
          <Image
            priority
            className="rounded-3xl w-auto h-auto lg:transform-[rotate(1.5deg)]"
            src={indexImage}
            alt="Photo of myself, presented in a polaroid frame"
          />
        </div>
      </div>
      <Footer></Footer>
    </Layout>
  );
}

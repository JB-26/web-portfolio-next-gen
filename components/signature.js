import styles from "./signature.module.css";
import Image from "next/image";
import Photo from "../public/images/profile.webp";
import Link from "next/link";
import utilStyles from "../styles/utils.module.css";

export default function Signature() {
  return (
    <div className={styles.signature}>
      <hr className={styles.line} />
      <div className={styles.format}>
        <div className={styles.image}>
          <Image alt="A photo of me!" className={styles.image} src={Photo} />
        </div>
        <div>
          <p className={styles.info}>
            I&apos;m Joshua Blewitt, I&apos;m passionate about product, a
            technology advocate, customer champion, curious mind and writer.
            I&apos;ve worked for companies such as Rightmove, Domino&apos;s
            Pizza and IQVIA. Currently looking for my next opportunity.
          </p>
          <a href="mailto:joshblewitt@protonmail.com" className={styles.link}>
            Let me know your thoughts!
          </a>
          <br />
          <Link href="/about/" className={styles.link}>
            More about me
          </Link>
        </div>
      </div>
      <hr className={styles.line} />
      <p>
        Want to get the latest posts in your inbox? Why not subscribe? It&apos;s
        free!
      </p>
      <form
        action="https://buttondown.email/api/emails/embed-subscribe/JoshBl"
        method="post"
        target="popupwindow"
        onsubmit="window.open('https://buttondown.email/JoshBl', 'popupwindow')"
        className={`${styles.embeddableButtondownForm}`}
      >
        <input type="email" name="email" id="bd-email" placeholder="Enter your email" />

        <input type="submit" value="Subscribe" />
        <p>
          <a href="https://buttondown.email/refer/JoshBl" target="_blank">
            Powered by Buttondown.
          </a>
        </p>
      </form>
    </div>
  );
}

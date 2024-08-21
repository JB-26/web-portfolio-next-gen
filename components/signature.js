import styles from "./signature.module.css";
import Image from "next/image";
import Photo from "../public/images/new_2024.png";
import Link from "next/link";

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
            Pizza and IQVIA.
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
    </div>
  );
}

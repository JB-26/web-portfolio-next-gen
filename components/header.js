import styles from "./header.module.css";
import Link from "next/link";
import Icon from "../public/icon.webp";
import Image from "next/image";

export default function Header() {
  return (
    <header data-testid="header-component" className={styles.header}>
      <div className={styles.headerItem}>
        <Link href="/about/" className={styles.blog}>
          About
        </Link>
      </div>
      <div className={styles.headerItem}>
        <Link href="/links/" className={styles.blog}>
          Links
        </Link>
      </div>
      <div className={styles.icon}>
        <Link href="/" className={styles.blog}>
          <Image
            priority
            src={Icon}
            alt={"My initials - which is also the favicon"}
            className={styles.logo}
          />
        </Link>
      </div>
      <div className={styles.headerItem}>
        <Link href="/uses/" className={styles.blog}>
          Uses
        </Link>
      </div>
      <div className={styles.headerItem}>
        <Link href="/blog/" className={styles.blog}>
          Blog
        </Link>
      </div>
    </header>
  );
}

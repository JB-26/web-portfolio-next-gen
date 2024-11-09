import styles from "./header.module.css";
import Link from "next/link";
import Icon from "../public/icon.webp";
import Image from "next/image";

export default function Header() {
  return (
    <>
      <Link href="/" className={styles.blog}>
        <h1 className={styles.headerTitle}>Joshua Blewitt</h1>
      </Link>
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
    </>
  );
}

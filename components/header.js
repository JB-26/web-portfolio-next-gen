import styles from "./header.module.css";
import Link from "next/link";
import Icon from "../public/icon.webp";
import Image from "next/image";

export default function Header() {
  return (
    <>
      <header data-testid="header-component" className={styles.header}>
        <div className={styles.wrapper}>
          <div className={styles.headerItem}>
            <Link href="/" className={styles.blogTitle}>
              JB
            </Link>
          </div>
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
        </div>
      </header>
    </>
  );
}

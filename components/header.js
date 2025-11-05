import styles from "./header.module.css";
import Link from "next/link";

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
            <Link href="/blog/" className={styles.blog}>
              Blog
            </Link>
          </div>
          <div className={styles.headerItem}>
            <Link href="/resume/" className={styles.blog}>
              Resume
            </Link>
          </div>
          <div className={styles.headerItem}>
            <Link href="/uses/" className={styles.blog}>
              Uses
            </Link>
          </div>
          <div className={styles.headerItem}>
            <Link href="/contact/" className={styles.blog}>
              Contact
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

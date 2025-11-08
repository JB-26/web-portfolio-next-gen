import styles from "./header.module.css";
import Link from "next/link";

export default function Header() {
  return (
    <>
      <header data-testid="header-component" className={styles.header}>
        <div className="flex items-center flex-row justify-between h-min p-0 w-full max-w-[1150px] m-0-auto">
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
            <Link href="/contact/" className={styles.blog}>
              Contact
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

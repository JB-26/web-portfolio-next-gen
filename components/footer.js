import styles from "./footer.module.css";

export default function Footer() {
  return (
    <footer data-testid="footer-component">
      <ul className={styles.footer}>
        <li className={styles.blog}>
          <a
            href="https://github.com/JB-26"
            rel="noopener noreferrer"
            target="_blank"
          >
            <i className="fa-brands fa-github"></i>
          </a>
        </li>
        <li className={styles.blog}>
          <a
            className={styles.blog}
            href="https://www.linkedin.com/in/jblewitt/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <i className="fa-brands fa-linkedin"></i>
          </a>
        </li>
        <li className={styles.blog}>
          <a
            className={styles.blog}
            href="https://www.threads.net/intent/follow?username=jblw1tt"
            rel="noopener noreferrer me"
            target="_blank"
          >
            <i className="fa-brands fa-threads"></i>
          </a>
        </li>
        <li className={styles.blog}>
          <a
            className={styles.blog}
            href="/rss.xml"
            rel="noopener noreferrer"
            target="_blank"
          >
            <i className="fa-solid fa-square-rss"></i>
          </a>
        </li>
      </ul>
    </footer>
  );
}

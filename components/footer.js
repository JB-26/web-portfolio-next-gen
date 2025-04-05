import styles from "./footer.module.css";

export default function Footer() {
  return (
    <footer data-testid="footer-component">
      <ul className={styles.footer}>
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
            href="https://bsky.app/profile/joshblewitt.dev"
            rel="noopener noreferrer"
            target="_blank"
          >
            <i class="fa-brands fa-bluesky"></i>
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
      <p className={styles.copyright}>© 2025</p>
    </footer>
  );
}

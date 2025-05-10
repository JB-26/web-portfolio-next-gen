import Image from "next/image";
import styles from "./footer.module.css";
import linkedIn from "../public/icons/linkedin.svg";
import bluesky from "../public/icons/bluesky.svg";
import rss from "../public/icons/rss.svg";

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
            <Image priority className={styles.icon} src={linkedIn} />
          </a>
        </li>
        <li className={styles.blog}>
          <a
            className={styles.blog}
            href="https://bsky.app/profile/joshblewitt.dev"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image priority className={styles.icon} src={bluesky} />
          </a>
        </li>
        <li className={styles.blog}>
          <a
            className={styles.blog}
            href="/rss.xml"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image priority className={styles.icon} src={rss} />
          </a>
        </li>
      </ul>
      <p className={styles.copyright}>© 2025</p>
    </footer>
  );
}

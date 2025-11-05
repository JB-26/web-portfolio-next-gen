import Image from "next/image";
import styles from "./footer.module.css";
import linkedIn from "../public/icons/linkedin.svg";
import bluesky from "../public/icons/bluesky.svg";
import rss from "../public/icons/rss.svg";

export default function Footer() {
  return (
    <footer data-testid="footer-component">
      <ul className="p-0 list-none text-center text-4xl">
        <li className="inline text-center pl-4">
          <a
            className="inline text-center pl-4"
            href="https://www.linkedin.com/in/jblewitt/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image priority className={styles.icon} src={linkedIn} />
          </a>
        </li>
        <li className="inline text-center pl-4">
          <a
            className="inline text-center pl-4"
            href="https://bsky.app/profile/joshblewitt.dev"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image priority className={styles.icon} src={bluesky} />
          </a>
        </li>
        <li className="inline text-center pl-4">
          <a
            className="inline text-center pl-4"
            href="/rss.xml"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image priority className={styles.icon} src={rss} />
          </a>
        </li>
      </ul>
      <p className="text-center">© {new Date().getFullYear()}</p>
    </footer>
  );
}

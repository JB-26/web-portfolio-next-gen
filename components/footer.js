import Image from "next/image";
import styles from "./footer.module.css";
import linkedIn from "../public/icons/linkedin.svg";
import bluesky from "../public/icons/bluesky.svg";
import rss from "../public/icons/rss.svg";
import github from "../public/icons/github.svg";
import youtube from "../public/icons/youtube.svg";
import instagram from "../public/icons/instagram.svg";

export default function Footer() {
  return (
    <footer data-testid="footer-component">
      <ul className="p-0 list-none text-center text-4xl">
        <li className="inline text-center">
          <a
            className="inline text-center pl-4"
            href="https://www.linkedin.com/in/jblewitt/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image
              priority
              className={styles.icon}
              src={linkedIn}
              alt="LinkedIn Footer"
            />
          </a>
        </li>
        <li className="inline text-center">
          <a
            className="inline text-center pl-4"
            href="https://github.com/JB-26"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image
              priority
              className={styles.icon}
              src={github}
              alt="GitHub Footer"
            />
          </a>
        </li>
        <li className="inline text-center">
          <a
            className="inline text-center pl-4"
            href="https://bsky.app/profile/joshblewitt.dev"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image
              priority
              className={styles.icon}
              src={bluesky}
              alt="Bluesky Footer"
            />
          </a>
        </li>
        <li className="inline text-center">
          <a
            className="inline text-center pl-4"
            href="https://www.youtube.com/@joshuablewitt6022"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image
              priority
              className={styles.icon}
              src={youtube}
              alt="YouTube Footer"
            />
          </a>
        </li>
        <li className="inline text-center">
          <a
            className="inline text-center pl-4"
            href="https://www.instagram.com/jblw1tt/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image
              priority
              className={styles.icon}
              src={instagram}
              alt="Instagram Footer"
            />
          </a>
        </li>
        <li className="inline text-center">
          <a
            className="inline text-center pl-4"
            href="/rss.xml"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image
              priority
              className={styles.icon}
              src={rss}
              alt="RSS Footer"
            />
          </a>
        </li>
      </ul>
      <p className="text-center mt-4">© {new Date().getFullYear()}</p>
    </footer>
  );
}

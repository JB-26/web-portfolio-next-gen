import Layout, { siteTitle } from "../components/layout";
import Head from "next/head";
import Image from "next/image";
import email from "../public/icons/email.svg";
import linkedin from "../public/icons/linkedin.svg";
import youtube from "../public/icons/youtube.svg";
import instagram from "../public/icons/instagram.svg";
import bluesky from "../public/icons/bluesky.svg";
import rss from "../public/icons/rss.svg";

export default function Contact() {
  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
        <meta
          charSet="utf-8"
          name="The personal website of IT Professional, Joshua Blewitt"
        />
      </Head>
      <section>
        <h1
          data-testid="heading1"
          className="text-2xl/9 font-extrabold tracking-tighter mb-3.5 md:text-3xl/9"
        >
          Contact
        </h1>
        <p className="mb-4 text-lg">
          Drop me a line on the platform of your choice or follow me. No spam,
          please.
        </p>
        <div className="grid grid-cols-2 gap-5 mb-3.5">
          <a
            className="flex items-center space-x-3 p-3 rounded-lg border border-black dark:border-slate-600 shadow-[10px_10px_black] dark:shadow-[10px_10px_rgba(148,163,184,0.25)] origin-center transition-all duration-150 hover:scale-100 hover:-translate-y-[3px] hover:shadow-[15px_15px_0_0_rgba(0,0,0,1)] dark:hover:shadow-[15px_15px_0_0_rgba(148,163,184,0.35)] active:shadow-[5px_5px_0_0_rgba(0,0,0,1)] dark:active:shadow-[5px_5px_0_0_rgba(148,163,184,0.35)] active:scale-[0.99] active:translate-y-px no-underline hover:no-underline"
            style={{ textDecoration: "none" }}
            href="mailto:joshblewitt@protonmail.com"
          >
            <div className="flex-0">
              <Image
                className="max-w-6! max-h-6! dark:invert"
                src={email}
                alt="Email Contact Icon"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-black dark:text-slate-100 text-sm">Email</p>
              <p className="text-gray-600 dark:text-slate-400 text-xs truncate">
                joshblewitt@protonmail.com
              </p>
            </div>
          </a>
          <a
            className="flex items-center space-x-3 p-3 rounded-lg border border-black dark:border-slate-600 shadow-[10px_10px_black] dark:shadow-[10px_10px_rgba(148,163,184,0.25)] origin-center transition-all duration-150 hover:scale-100 hover:-translate-y-[3px] hover:shadow-[15px_15px_0_0_rgba(0,0,0,1)] dark:hover:shadow-[15px_15px_0_0_rgba(148,163,184,0.35)] active:shadow-[5px_5px_0_0_rgba(0,0,0,1)] dark:active:shadow-[5px_5px_0_0_rgba(148,163,184,0.35)] active:scale-[0.99] active:translate-y-px no-underline hover:no-underline"
            style={{ textDecoration: "none" }}
            href="https://www.linkedin.com/in/jblewitt/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="flex-0">
              <Image
                className="max-w-6! max-h-6! dark:invert"
                src={linkedin}
                alt="LinkedIn Contact Icon"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-black dark:text-slate-100 text-sm">LinkedIn</p>
              <p className="text-gray-600 dark:text-slate-400 text-xs truncate">jblewitt</p>
            </div>
          </a>
          <a
            className="flex items-center space-x-3 p-3 rounded-lg border border-black dark:border-slate-600 shadow-[10px_10px_black] dark:shadow-[10px_10px_rgba(148,163,184,0.25)] origin-center transition-all duration-150 hover:scale-100 hover:-translate-y-[3px] hover:shadow-[15px_15px_0_0_rgba(0,0,0,1)] dark:hover:shadow-[15px_15px_0_0_rgba(148,163,184,0.35)] active:shadow-[5px_5px_0_0_rgba(0,0,0,1)] dark:active:shadow-[5px_5px_0_0_rgba(148,163,184,0.35)] active:scale-[0.99] active:translate-y-px no-underline hover:no-underline"
            style={{ textDecoration: "none" }}
            href="https://www.youtube.com/@joshuablewitt6022"
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="flex-0">
              <Image
                className="max-w-6! max-h-6! dark:invert"
                src={youtube}
                alt="YouTube Contact Icon"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-black dark:text-slate-100 text-sm">YouTube</p>
              <p className="text-gray-600 dark:text-slate-400 text-xs truncate">
                @joshuablewitt6022
              </p>
            </div>
          </a>
          <a
            className="flex items-center space-x-3 p-3 rounded-lg border border-black dark:border-slate-600 shadow-[10px_10px_black] dark:shadow-[10px_10px_rgba(148,163,184,0.25)] origin-center transition-all duration-150 hover:scale-100 hover:-translate-y-[3px] hover:shadow-[15px_15px_0_0_rgba(0,0,0,1)] dark:hover:shadow-[15px_15px_0_0_rgba(148,163,184,0.35)] active:shadow-[5px_5px_0_0_rgba(0,0,0,1)] dark:active:shadow-[5px_5px_0_0_rgba(148,163,184,0.35)] active:scale-[0.99] active:translate-y-px no-underline hover:no-underline"
            style={{ textDecoration: "none" }}
            href="https://www.instagram.com/jblw1tt/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="flex-0">
              <Image
                className="max-w-6! max-h-6! dark:invert"
                src={instagram}
                alt="Instagram Contact Icon"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-black dark:text-slate-100 text-sm">Instagram</p>
              <p className="text-gray-600 dark:text-slate-400 text-xs truncate">jblw1tt</p>
            </div>
          </a>
          <a
            className="flex items-center space-x-3 p-3 rounded-lg border border-black dark:border-slate-600 shadow-[10px_10px_black] dark:shadow-[10px_10px_rgba(148,163,184,0.25)] origin-center transition-all duration-150 hover:scale-100 hover:-translate-y-[3px] hover:shadow-[15px_15px_0_0_rgba(0,0,0,1)] dark:hover:shadow-[15px_15px_0_0_rgba(148,163,184,0.35)] active:shadow-[5px_5px_0_0_rgba(0,0,0,1)] dark:active:shadow-[5px_5px_0_0_rgba(148,163,184,0.35)] active:scale-[0.99] active:translate-y-px no-underline hover:no-underline"
            style={{ textDecoration: "none" }}
            href="https://bsky.app/profile/joshblewitt.dev"
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="flex-0">
              <Image
                className="max-w-6! max-h-6! dark:invert"
                src={bluesky}
                alt="Bluesky Contact Icon"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-black dark:text-slate-100 text-sm">Bluesky</p>
              <p className="text-gray-600 dark:text-slate-400 text-xs truncate">@joshblewitt.dev</p>
            </div>
          </a>
          <a
            className="flex items-center space-x-3 p-3 rounded-lg border border-black dark:border-slate-600 shadow-[10px_10px_black] dark:shadow-[10px_10px_rgba(148,163,184,0.25)] origin-center transition-all duration-150 hover:scale-100 hover:-translate-y-[3px] hover:shadow-[15px_15px_0_0_rgba(0,0,0,1)] dark:hover:shadow-[15px_15px_0_0_rgba(148,163,184,0.35)] active:shadow-[5px_5px_0_0_rgba(0,0,0,1)] dark:active:shadow-[5px_5px_0_0_rgba(148,163,184,0.35)] active:scale-[0.99] active:translate-y-px no-underline hover:no-underline"
            style={{ textDecoration: "none" }}
            href="/rss.xml"
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="flex-0">
              <Image
                className="max-w-6! max-h-6! dark:invert"
                src={rss}
                alt="RSS Feed Icon"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-black dark:text-slate-100 text-sm">RSS</p>
              <p className="text-gray-600 dark:text-slate-400 text-xs truncate">
                Add to your favourite reader
              </p>
            </div>
          </a>
        </div>
      </section>
    </Layout>
  );
}

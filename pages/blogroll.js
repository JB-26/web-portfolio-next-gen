import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";

export default function Blogroll() {
  return (
    <Layout>
      <Head>
        <title>{`Blogroll · ${siteTitle}`}</title>
        <meta
          name="description"
          content="A curated list of blogs that I follow"
        />
      </Head>
      <header className="max-w-[720px] pt-10 pb-2">
        <h1
          data-testid="blogroll"
          className="m-0 mb-2.5 text-[clamp(30px,4vw,38px)] font-bold tracking-[-0.03em] text-ink"
        >
          Blogroll
        </h1>
        <p className="m-0 text-[16.5px] leading-[1.6] text-muted">
          Some blogs that I follow, in no particular order.
        </p>
      </header>
      <ul
        data-testid="blogroll-list"
        className="mt-4 max-w-[720px] list-disc space-y-1 pl-5 text-[16.5px] leading-[1.6]"
      >
        <li>
          <a
            href="https://www.gyford.com/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Phil Gyford
          </a>{" "}
          – a blog about a (former) freelance web designer and developer
        </li>
        <li>
          Jim Grey – two blogs, kept separate:
          <ul className="mt-1 list-[circle] space-y-1 pl-5">
            <li>
              <a
                href="https://dev.jimgrey.net/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Software management
              </a>
            </li>
            <li>
              <a
                href="https://blog.jimgrey.net/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Photography
              </a>
            </li>
          </ul>
        </li>
        <li>
          <a
            href="https://robinrendle.com/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Robin Rendle
          </a>{" "}
          – software designer who currently works at Apple
        </li>
        <li>
          <a
            href="https://joshcrain.io/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Josh Crain
          </a>{" "}
          – a web developer who enjoys running and art
        </li>
        <li>
          <a
            href="https://shumer.dev/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Matt Shumer
          </a>{" "}
          – founder and CEO who wrote a popular piece on AI (&quot;Something big
          is happening&quot;)
        </li>
        <li>
          <a
            href="https://craigmod.com/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Craig Mod
          </a>{" "}
          – essays on walking and publishing
        </li>
        <li>
          <a
            href="https://snarfed.org/about"
            rel="noopener noreferrer"
            target="_blank"
          >
            Ryan Barrett
          </a>{" "}
          – developer of Bridgy Fed
        </li>
        <li>
          <a
            href="https://matt.blwt.io/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Matt Blewitt
          </a>{" "}
          – my brother
        </li>
        <li>
          <a
            href="https://blog.codinghorror.com/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Jeff Atwood
          </a>{" "}
          – founder of Stack Overflow
        </li>
      </ul>
    </Layout>
  );
}

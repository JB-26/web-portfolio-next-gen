import Layout, { siteTitle } from "../components/layout";
import Footer from "../components/footer";
import Script from "next/script";
import Head from "next/head";
import Link from "next/link";
import utilStyles from "../styles/utils.module.css";

export default function Uses() {
  return (
    <Layout home>
      <Script
        src="https://kit.fontawesome.com/af67ca5a39.js"
        crossOrigin="anonymous"
        async
      ></Script>
      <Head>
        <title>{siteTitle}</title>
        <meta
          charSet="utf-8"
          name="The personal website of IT Professional, Joshua Blewitt"
        />
      </Head>
      <section className={utilStyles.headingMd}>
        <h1 data-testid="heading1" className={utilStyles.headingXl}>
          Uses
        </h1>
      </section>
      <section data-testid="content" className={`${utilStyles.headingMd}`}>
        <p>
          If you’re wondering what I’m using on a daily basis for hardware and
          software, this page will answer your questions.
        </p>
        <h1 data-testid="heading" className={utilStyles.headingX}>
          Hardware
        </h1>
        <p>
          My main criteria when it comes to hardware is quality and efficiency.
          I believe that a product that I’m using should be built to last and
          should have acceptable performance to keep up with my workflow.
        </p>
        <h2 data-testid="heading" className={utilStyles.headingLg}>
          Computer
        </h2>
        <p>
          I currently use an{" "}
          <Link
            href="https://www.macrumors.com/roundup/mac-mini/"
            target="_blank"
            rel="noopener noreferrer"
          >
            M2 Mac mini
          </Link>
          . It’s my first Mac which uses an ARM based system on a chip and I’m
          blown away by the performance of this thing. The compact design is
          also appealing, it sits nicely on my desk and looks great. Only regret
          is not getting 16GB of RAM.
        </p>
        <h2 data-testid="heading" className={utilStyles.headingLg}>
          Keyboard and mouse
        </h2>
        <p>
          I currently use a{" "}
          <Link
            href="https://www.logitech.com/en-gb/products/mice/mx-master-3s-mac-bluetooth-mouse.910-006572.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Logitech MX Master 3S
          </Link>{" "}
          for my mouse and a{" "}
          <Link
            href="https://www.logitech.com/en-gb/products/keyboards/mx-mechanical-mini-mac.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Logitech MX Mechanical Mini
          </Link>{" "}
          for my keyboard. Both are excellent products to use. Out of the two
          though, I like the mouse the most.
        </p>
        <h2 data-testid="heading" className={utilStyles.headingLg}>
          Monitor
        </h2>
        <p>
          I use a 24 inch LG Ultra HD monitor (I wish I knew the model number).
          It’s a nice monitor. Just wish it was slightly taller.
        </p>
        <h2 data-testid="heading" className={utilStyles.headingLg}>
          Phone
        </h2>
        <p>
          I use an{" "}
          <Link
            href="https://www.macrumors.com/roundup/iphone-xs/"
            target="_blank"
            rel="noopener noreferrer"
          >
            iPhone XS
          </Link>
          . Yes, even in 2024. This was my first iPhone after being an Android
          user for nearly ten years. The performance still holds up for the most
          part but the battery life is awful now. The max capacity of the
          battery is roughly 70% so I’m very much considering upgrading to a new
          phone soon.
        </p>
        <h2 data-testid="heading" className={utilStyles.headingLg}>
          Gaming
        </h2>
        <p>
          I use a{" "}
          <Link
            href="https://store.steampowered.com/steamdeck"
            target="_blank"
            rel="noopener noreferrer"
          >
            Steam Deck
          </Link>{" "}
          as my main gaming device. Fantastic performance for a great price.
          I’ve taken the Deck on plane trips, used it to play games on a TV at
          my parents home over the holiday season, played it in hotel rooms and
          more. It plays my Steam library and retro games extremely well.
          Curious to see how the handheld PC market evolves over time as the
          technology improves.
        </p>
        <h1 data-testid="heading" className={utilStyles.headingXl}>
          Software
        </h1>
        <p>
          My main criteria when it comes to software is performance and value.{" "}
        </p>
        <h2 data-testid="heading" className={utilStyles.headingLg}>
          Text Editor
        </h2>
        <p>
          For my IDE/text editor, I use{" "}
          <Link
            href="https://zed.dev/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {" "}
            Zed
          </Link>
          . It’s incredibly quick, looks good and offers a decent (and growing)
          range of extensions. It’s free to use which is a plus. I will also
          give a shout-out to{" "}
          <Link
            href="https://www.sublimetext.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sublime Text
          </Link>
          .
          <p>
            The font I use in my text editor is{" "}
            <Link
              href="https://www.jetbrains.com/lp/mono/"
              target="_blank"
              rel="noopener noreferrer"
            >
              JetBrains Mono
            </Link>
            .
          </p>
        </p>
        <h2 data-testid="heading" className={utilStyles.headingLg}>
          Photo Editor
        </h2>
        <p>
          For photo editing, I use{" "}
          <Link
            href="https://www.pixelmator.com/pro/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pixelmator Pro
          </Link>
          . With an attractive one time cost, plenty of great features and
          updates, it’s something to consider. Shame it’s only available for
          Mac, otherwise I’d suggest{" "}
          <Link
            href="https://affinity.serif.com/en-gb/photo/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Affinity Photo
          </Link>
          .
        </p>
        <h2 data-testid="heading" className={utilStyles.headingLg}>
          Web Browser
        </h2>
        <p>
          My web browser of choice at the moment is{" "}
          <Link
            href="https://arc.net/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Arc
          </Link>
          . It’s an interesting take on the web browser, so I’m giving it a
          spin. The mobile version of Arc is quite good as well.{" "}
        </p>
        <h2 data-testid="heading" className={utilStyles.headingLg}>
          Note taking
        </h2>
        <p>
          For note taking, I use{" "}
          <Link
            href="https://www.notion.so/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Notion
          </Link>
          . It’s free, offers great features, a handy mobile application and
          it’s very easy to use. I did think about using{" "}
          <Link
            href="https://obsidian.md/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Obsidian
          </Link>
          , but Notion syncs across my devices for free.
        </p>
        <h2 data-testid="heading" className={utilStyles.headingLg}>
          Version Control
        </h2>
        <p>
          For working with Git, I use{" "}
          <Link
            href="https://www.gitkraken.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Git Kraken
          </Link>
          . Offers a lot of good features but I do sometimes go back to using{" "}
          <Link
            href="https://fork.dev/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Fork
          </Link>{" "}
          as its design is more appealing.{" "}
        </p>
        <h2 data-testid="heading" className={utilStyles.headingLg}>
          Travel
        </h2>
        <p>
          For travelling internationally (which happens at least once a year), I
          use{" "}
          <Link
            href="https://www.flightyapp.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Flighty
          </Link>
          . A fantastic application that gives you so much information about
          your flight. The live activity is incredibly useful when walking
          through an airport and you need to check your flight quickly.
        </p>
      </section>
      <Footer></Footer>
    </Layout>
  );
}

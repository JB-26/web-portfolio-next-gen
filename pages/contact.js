import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import ContactCard from "../components/ContactCard";

// The six channels from the handoff, in its order. Email opens the mail client
// rather than a new tab; everything else is an outbound link.
const CHANNELS = [
  {
    name: "Email",
    handle: "joshblewitt@protonmail.com",
    href: "mailto:joshblewitt@protonmail.com",
  },
  {
    name: "LinkedIn",
    handle: "jblewitt",
    href: "https://www.linkedin.com/in/jblewitt/",
    external: true,
  },
  {
    name: "YouTube",
    handle: "@joshuablewitt6022",
    href: "https://www.youtube.com/@joshuablewitt6022",
    external: true,
  },
  {
    name: "Instagram",
    handle: "jblw1tt",
    href: "https://www.instagram.com/jblw1tt/",
    external: true,
  },
  {
    name: "Bluesky",
    handle: "@joshblewitt.dev",
    href: "https://bsky.app/profile/joshblewitt.dev",
    external: true,
  },
  {
    name: "RSS",
    handle: "Add to your favourite reader",
    href: "/rss.xml",
    external: true,
  },
];

export default function Contact() {
  return (
    <Layout>
      <Head>
        <title>{`Contact · ${siteTitle}`}</title>
        <meta
          name="description"
          content="Get in touch with Joshua Blewitt — email, social links and the best ways to reach me."
        />
      </Head>

      <header className="max-w-[720px] pt-10 pb-2">
        <h1
          data-testid="heading1"
          className="m-0 mb-2.5 text-[clamp(30px,4vw,38px)] font-bold tracking-[-0.03em] text-ink"
        >
          Contact
        </h1>
        <p className="m-0 text-[16.5px] leading-[1.6] text-muted">
          Drop me a line on the platform of your choice or follow me. No spam,
          please.
        </p>
      </header>

      {/* auto-fit + minmax collapses to one column on narrow viewports without
          needing a breakpoint. */}
      <div className="mt-8 grid max-w-[800px] grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
        {CHANNELS.map((channel) => (
          <ContactCard key={channel.name} {...channel} />
        ))}
      </div>
    </Layout>
  );
}

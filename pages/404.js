import Head from "next/head";
import Link from "next/link";
import Layout, { siteTitle } from "../components/layout";

export default function Custom404() {
  return (
    <Layout>
      <Head>
        <title>{`Page not found · ${siteTitle}`}</title>
        <meta
          name="description"
          content="That page doesn't exist. Head back to the blog to find what you were looking for."
        />
        <meta name="robots" content="noindex" />
      </Head>
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        {/* Decorative — the heading below carries the meaning. */}
        <span aria-hidden="true" className="text-4xl">
          ⁉️
        </span>
        <h1
          data-testid="error-heading"
          className="m-0 text-[clamp(30px,4vw,38px)] font-bold leading-[1.12] tracking-[-0.03em] text-ink"
        >
          You&apos;ve found the error page!
        </h1>
        <p className="m-0 text-[16.5px] leading-[1.6] text-muted">
          Why not press this <Link href="/">link</Link> to return to the home
          page
        </p>
      </div>
    </Layout>
  );
}

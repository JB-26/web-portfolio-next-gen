import Head from "next/head";
import Header from "./header";
import Footer from "./footer";

export const siteTitle = "Joshua Blewitt";

// Chrome is now unconditional. Previously Layout rendered Signature +
// "← Back to blog" + Footer only when `home` was falsy, and the seven pages
// that passed `home` each rendered their own <Footer/> a second time — so the
// footer was universal via two different code paths. Signature is retired
// here; its bio content returns as the post-page AuthorCard in Phase 4, and
// "← Back to blog" moves to the top of the article where the design puts it.
export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="The website of IT Professional, Joshua Blewitt"
        />
        <meta
          property="og:image"
          content="https://www.joshblewitt.dev/public/images/opengraph-image.png"
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Header />
      <main className="mx-auto w-full max-w-[1040px] flex-1 px-6 pb-[72px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}

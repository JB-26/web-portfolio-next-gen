import Header from "../components/header";
import Footer from "../components/footer";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { siteTitle } from "../components/layout";

export default function Custom404() {
  const router = useRouter();

  return (
    <div>
      <Head>
        <title>{siteTitle}</title>
        <meta
          charSet="utf-8"
          name="The personal website of IT Professional, Joshua Blewitt"
        />
      </Head>
      <Header></Header>
      <div className="flex flex-col text-center mt-12 mb-5">
        <h2 className="text-2xl/9 font-extrabold tracking-tighter mb-3.5 md:text-3xl/9">
          {" "}
          <span role="img" aria-label="string">
            ⁉️
          </span>
        </h2>
        <h2 data-testid="error-heading">You&apos;ve found the error page!</h2>
        <h2>
          Why not press this <Link href="/">link</Link> to return to the home
          page
        </h2>
      </div>
      <Footer></Footer>
    </div>
  );
}

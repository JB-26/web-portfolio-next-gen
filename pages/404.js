import Header from "../components/header";
import Footer from "../components/footer";
import Search from "../components/search"
import Script from 'next/script'
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { siteTitle } from "../components/layout";
import styles from '../styles/error.module.css';
import utilStyles from '../styles/utils.module.css';

export default function Custom404() {

  const router = useRouter();

  const handleSearch = async (query) => {
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      console.log('Search results:', data.results);

      // Store results in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('searchResults', JSON.stringify(data.results));
        router.push('/search-results');
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  return (
    <div>
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
      <Header></Header>
      <div className={styles.errorMessage}>
        <h2 className={utilStyles.heading2Xl}>
          {" "}
          <span role="img" aria-label="string">
            ⁉️
          </span>
        </h2>
        <h2 data-testid="error-heading">You&apos;ve found the error page!</h2>
          <h2>Why not press this <Link href="/">link</Link> to return to the home page</h2>
        <h2>Or, why not try and search for the post that you were trying to find?</h2>
        <Search onSearch={handleSearch} />
      </div>
      <Footer></Footer>
    </div>
  );
}

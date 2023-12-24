import Layout from "../components/layout";
import Footer from "../components/footer";
import Head from "next/head";
import Link from 'next/link';

export default function SearchResults({ results }) {
  return (
      <Layout home>
          <Head>
              <title>Search Results</title>
          </Head>
          <div>
              <h2 data-testid="search-heading">Search Results</h2>
              <ul>
                  {results.map(({ id, title }) => {
                      console.log('Result:', { id, title }); // Log the details
                      return (
                          <li key={id}>
                              {/* Use Link component for navigation */}
                              <Link legacyBehavior href={`/posts/${id}`}>
                                  <a>{title}</a>
                                  
                              </Link>
                              
                          </li>
                          );
                  })}
              </ul>
          </div>
          <Footer></Footer>
      </Layout>
      );
}
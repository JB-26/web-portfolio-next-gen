import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import SearchResults from '../components/searchResults';

const SearchResultsPage = () => {
  const router = useRouter();
  const { results, query } = router.query;
  const parsedResults = results ? JSON.parse(results) : [];

  useEffect(() => {
    // Retrieve results from localStorage and do something with them if needed
    const storedResults = typeof window !== 'undefined' ? localStorage.getItem('searchResults') : null;

    try {
      const localStorageParsedResults = storedResults ? JSON.parse(storedResults) : [];
      console.log('Parsed Results:', localStorageParsedResults);
    } catch (error) {
      console.error('Error parsing stored results:', error);
    }
  }, []); // Empty dependency array means this effect runs once, similar to componentDidMount

  return (
    <>
    <SearchResults results={parsedResults} query={query} />
    </>
    );
};

export default SearchResultsPage;

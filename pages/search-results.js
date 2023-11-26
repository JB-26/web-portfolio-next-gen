import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import SearchResults from '../components/SearchResults';

const SearchResultsPage = () => {
  const router = useRouter();
  const [parsedResults, setParsedResults] = useState([]);

  useEffect(() => {
    // Retrieve results from localStorage
    const storedResults =
      typeof window !== 'undefined' ? localStorage.getItem('searchResults') : null;

    console.log('Stored Results:', storedResults);

    // Check if storedResults is not undefined and not an empty string before parsing
    const parsedResults = storedResults !== null && storedResults.trim() !== '' ? JSON.parse(storedResults) : [];

    // Update the state with the parsed results
    setParsedResults(parsedResults);
    }, []); // Empty dependency array means this effect runs once, similar to componentDidMount

  return <SearchResults results={parsedResults} />;
};

export default SearchResultsPage;
import { useState } from 'react';
import styles from './search.module.css';
import { useRouter } from 'next/router';

export default function Search({ onSearch }) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = async (query) => {
  try {
    const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error(`Error fetching search results. Status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Expected JSON response, but received an unexpected content type.');
    }

    const data = await response.json();
    console.log('Raw Search results:', data); // Log the raw data

    // Check if we're on the client side before using router.push
    if (typeof window !== 'undefined') {
      router.push({
        pathname: '/search-results',
        query: { results: data.results },
      });
    }
  } catch (error) {
    console.error('Error fetching search results:', error);
  }
  };


  return (
    <div>
        <input
            className={styles.searchBox}
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
        />
        <button className={styles.searchButton} onClick={handleSearch}>Search</button>
    </div>
    );
}
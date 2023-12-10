import { useState } from 'react';
import styles from './search.module.css';
import { useRouter } from 'next/router';

export default function Search({ onSearch }) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = async (query) => {
    try {
      // Check if the query is not empty before triggering the search
      if (query.trim() !== '') {
        onSearch(query);
      } else {
        // Optionally provide user feedback for an empty search
        alert('Please enter a non-empty search query.');
      }
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error(`Error fetching search results. Status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Expected JSON response, but received an unexpected content type.');
      }

      const data = await response.json();
      console.log('Raw Search results:', data);

      // Use router.push to navigate without modifying the URL
      if (typeof window !== 'undefined') {
        router.push({
          pathname: '/search-results',
          query: { results: JSON.stringify(data.results), query: encodeURIComponent(query) },
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
      {/* Call the handleSearch function on button click */}
      <button className={styles.searchButton} onClick={() => handleSearch(query)}>
        Search
      </button>
    </div>
    );
}


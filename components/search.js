import { useState } from 'react';
import styles from './search.module.css';

export default function Search({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    // Check if the query is not empty before triggering the search
    if (query.trim() !== '') {
      onSearch(query);
    } else {
      // Optionally provide user feedback for an empty search
      alert('Please enter a non-empty search query.');
    }
  };

  return (
    <div>
        <input
            className={styles.searchBox}
            data-testid="search"
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
        />
      <button data-testid="button" className={styles.searchButton} onClick={handleSearch}>Search</button>
    </div>
    );
}
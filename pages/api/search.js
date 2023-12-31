import { getSortedPostsData } from '../../lib/posts';

export default async function handler(req, res) {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    const allPostsData = getSortedPostsData();

    // Perform search logic, e.g., filter posts based on the query
    const searchResults = allPostsData.filter((post) =>
    post.title.toLowerCase().includes(query.toLowerCase())
    );

    res.status(200).json({ results: searchResults });
}

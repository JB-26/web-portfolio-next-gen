import RSS from "rss";
import { metadata } from "../../components/siteMetadata";
import { getSortedPostsData } from "../../lib/posts";

const posts = getSortedPostsData();

export async function generateRssFeed() {
  const baseUrl = metadata.siteUrl; 
  const feed = new RSS({
    title: metadata.title,
    description: metadata.description,
    feed_url: `${baseUrl}/rss.xml`,
    site_url: baseUrl,
    image_url: `${baseUrl}/favicon.ico`,
    author: metadata.author,
    language: metadata.language,
  });

  // Your code for generating the RSS feed items here...
  posts.forEach((post) => {
    const url = `${baseUrl}/posts/${post.id}`;
    feed.item({
      title: post.title,
      description: post.excerpt,
      url,
      guid: post.id,
      date: new Date(post.date),
    });
  });
  // Return the XML string for the RSS feed
  return feed.xml();
}

export default async function handler(req, res) {
  const feedXml = await generateRssFeed();
  res.setHeader("Content-Type", "text/xml");
  res.write(feedXml);
  res.end();
}

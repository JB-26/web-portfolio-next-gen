// api/rss.js

import RSS from "rss";
import { metadata } from "../../components/siteMetadata";
import { getSortedPostsData, getPostDataRss } from "../../lib/posts";

export async function generateRssFeed() {
  const posts = await Promise.all(await getSortedPostsData());
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

  // Create a separate array to store post content
  const postContentArray = [];

  // Retrieve post content and populate the postContentArray
  await Promise.all(posts.map(async (post) => {
    const postContent = await getPostDataRss(post.id);
    postContentArray.push({
      id: post.id,
      title: postContent.title, // Add this line to include the title field
      contentHtml: postContent.contentHtml,
      date: postContent.date
    });
  }));


  // Generate the RSS feed items
 postContentArray.forEach((post) => {
  const url = `${baseUrl}/posts/${post.id}`;
  feed.item({
    title: post.title, // Make sure post.title is populated correctly
    custom_elements: [{ "content:encoded": post.contentHtml }],
    url,
    guid: post.id,
    date: post.date
  });
 });

  return feed.xml();
}

export default async function handler(req, res) {
  const feedXml = await generateRssFeed();
  res.setHeader("Content-Type", "text/xml");
  res.write(feedXml);
  res.end();
}

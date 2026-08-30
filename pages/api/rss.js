// api/rss.js
//
// Served at /rss.xml via the rewrite in next.config.js.

import RSS from "rss";
import { metadata } from "../../components/siteMetadata";
import { getSortedPostsData, getPostDataRss } from "../../lib/posts";

// The feed used to carry all 148 posts, re-reading and re-parsing every
// markdown file on the disk twice on every request. Readers only ever show
// recent items, so cap it: the cap is what makes the handler cheap, because
// only these posts get their body rendered.
export const RSS_ITEM_LIMIT = 20;

export async function generateRssFeed() {
  const baseUrl = metadata.siteUrl;
  const posts = getSortedPostsData().slice(0, RSS_ITEM_LIMIT);

  const feed = new RSS({
    title: metadata.title,
    description: metadata.description,
    feed_url: `${baseUrl}/rss.xml`,
    site_url: baseUrl,
    // Was favicon.ico. Feed readers that show a channel image want a real
    // raster image, not an icon container.
    image_url: `${baseUrl}/images/opengraph-image.png`,
    author: metadata.author,
    language: metadata.language,
  });

  // Rendered in parallel but collected by index: the previous version pushed
  // into a shared array from inside Promise.all, so item order depended on
  // which file finished parsing first rather than on publication date.
  const items = await Promise.all(
    posts.map(async (post) => {
      const content = await getPostDataRss(post.id);
      return {
        id: post.id,
        title: content.title,
        description: content.description,
        contentHtml: content.contentHtml,
        date: content.date,
      };
    }),
  );

  items.forEach((post) => {
    const url = `${baseUrl}/posts/${post.id}`;
    feed.item({
      title: post.title,
      // Readers show this in the item list before the body is opened. Without
      // it the feed rendered as a wall of untitled bodies. 71 posts have no
      // description in frontmatter, so fall back rather than emit "undefined".
      description: post.description || post.title,
      custom_elements: [{ "content:encoded": post.contentHtml }],
      url,
      // guid was the bare slug, which is not globally unique and is not
      // resolvable. The permalink is both.
      guid: url,
      date: post.date,
    });
  });

  return feed.xml();
}

export default async function handler(req, res) {
  const feedXml = await generateRssFeed();
  // text/xml rather than the stricter application/rss+xml: no browser ships a
  // feed viewer any more, and application/rss+xml is a type they have no
  // handler for, so clicking the footer's RSS link downloads the file instead
  // of showing it. text/xml gets the built-in XML tree view back. Feed readers
  // accept either, and discovery is handled by the <link rel="alternate"> tag
  // in components/layout.js.
  res.setHeader("Content-Type", "text/xml; charset=utf-8");
  // The feed changes only when a post is added, so serve it from the edge
  // cache and let it go stale rather than re-parsing markdown per request.
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400",
  );
  res.status(200).send(feedXml);
}

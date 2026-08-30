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
    // Was favicon.ico, which is an icon container rather than an image feed
    // readers can render. The Open Graph banner is the other extreme: RSS 2.0
    // caps the channel image at 144x400, and that file is 1200x630 / 601 KB.
    // favicon-32x32.png is a real PNG and inside the cap.
    image_url: `${baseUrl}/favicon-32x32.png`,
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
        description: content.description || content.excerpt,
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
      // description in frontmatter, so getPostDataRss supplies an excerpt
      // derived from the opening prose; the title is the last resort.
      description: post.description || post.title,
      custom_elements: [{ "content:encoded": post.contentHtml }],
      url,
      // No explicit `guid`. The rss library derives it from `url` and, because
      // it was not set by hand, marks it isPermaLink="true" -- setting it
      // explicitly produced isPermaLink="false", telling readers not to treat
      // the permalink as a URL. The value is identical either way.
      //
      // Note this still differs from the old bare-slug guid, so on the first
      // fetch after deploy every reader sees 20 unfamiliar identifiers and
      // marks those posts unread once. That is a deliberate one-off.
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

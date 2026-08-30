// api/sitemap.js
//
// Served at /sitemap.xml via the rewrite in next.config.js, mirroring how
// /rss.xml is wired to /api/rss.
//
// What is included: the static pages, /blog, every post, and every tag page.
// What is deliberately left out:
//   - /page/N — thin duplicates of /blog's content, and pointing crawlers at
//     30 near-identical listings is the opposite of what a sitemap is for.
//   - /404, /admin and /owner/* — not indexable content.
//
// Entries come straight from whatever is in /posts, so a local-only file such
// as the gitignored template.md shows up when you build locally. It is not
// committed, so it never reaches a deployed sitemap.

import { metadata } from "../../components/siteMetadata";
import { getSortedPostsData, getAllTags, getPostsByTag } from "../../lib/posts";

// Static routes and how strongly to weight them relative to posts.
const STATIC_ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/blog", changefreq: "weekly", priority: "0.9" },
  { path: "/resume", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "yearly", priority: "0.5" },
];

// & < > " ' are the five characters that are not legal raw inside XML text.
// Tag names reach the URL path, so an ampersand in a tag would otherwise
// produce a malformed document.
function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// <lastmod> wants W3C datetime. Post frontmatter dates are already YYYY-MM-DD,
// but a malformed or missing date must not emit an invalid element.
function lastmod(date) {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function urlEntry({ loc, lastModified, changefreq, priority }) {
  return [
    "  <url>",
    `    <loc>${escapeXml(loc)}</loc>`,
    lastModified ? `    <lastmod>${lastModified}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

export function generateSitemap() {
  const baseUrl = metadata.siteUrl;
  const posts = getSortedPostsData();

  // getSortedPostsData() returns newest-first, so posts[0] is the most recent
  // thing on the site — the right <lastmod> for the listing pages.
  const newestDate = lastmod(posts[0]?.date);

  const entries = [
    ...STATIC_ROUTES.map((route) =>
      urlEntry({
        loc: `${baseUrl}${route.path}`,
        lastModified: route.path === "/" || route.path === "/blog" ? newestDate : null,
        changefreq: route.changefreq,
        priority: route.priority,
      }),
    ),
    ...posts.map((post) =>
      urlEntry({
        loc: `${baseUrl}/posts/${encodeURIComponent(post.id)}`,
        lastModified: lastmod(post.date),
        changefreq: "yearly",
        priority: "0.8",
      }),
    ),
    ...getAllTags().map((tag) => {
      // lastmod means "when this URL last changed", so a tag page changes when
      // its newest post was published -- not when the site last changed.
      // getPostsByTag is newest-first, like getSortedPostsData.
      const newestTagged = getPostsByTag(tag)[0];
      return urlEntry({
        loc: `${baseUrl}/tags/${encodeURIComponent(tag)}`,
        lastModified: lastmod(newestTagged?.date),
        changefreq: "weekly",
        priority: "0.4",
      });
    }),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`;
}

export default function handler(req, res) {
  const xml = generateSitemap();
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  // Rebuilt on demand from the markdown on disk; an hour of edge cache with a
  // day of stale-while-revalidate keeps crawler traffic off the function.
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400",
  );
  res.status(200).send(xml);
}

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server at localhost:3000
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run playwright # Run Playwright end-to-end tests (requires dev or prod server running on port 3000)
```

To run a single Playwright test file:
```bash
npx playwright test tests/blog.spec.js
```

## Architecture

This is a **Next.js Pages Router** personal portfolio and blog site deployed to Vercel.

### Data Layer (`lib/posts.js`)

All blog content comes from Markdown files in `/posts/`. The `lib/posts.js` module is the central data layer:
- `getSortedPostsData()` — reads all posts and returns metadata sorted by date (newest first)
- `getPostData(id)` — fetches a single post's content (used for static generation)
- `getPostDataByName(name)` — same as above but by filename (used for the pinned post)
- `getPostsByTag(tag)` — filters posts by tag

Posts use gray-matter for frontmatter parsing and remark/react-markdown for rendering.

### Blog Post Frontmatter

Every post in `/posts/` must have:
```yaml
---
title: "Post Title"
date: "YYYY-MM-DD"
description: "Short description"
tags: ["tag1", "tag2"]
---
```

The `tags` field is optional (defaults to empty array). Post filenames become URL slugs (e.g., `2024-01-15-my-post.md` → `/posts/2024-01-15-my-post`).

### Pages

| Route | File | Notes |
|---|---|---|
| `/` | `pages/index.js` | Homepage |
| `/blog` | `pages/blog.js` | Blog listing, first page |
| `/page/[pageNumber]` | `pages/page/[pageNumber].js` | Paginated blog (5 posts/page) |
| `/posts/[id]` | `pages/posts/[id].js` | Individual post |
| `/tags/[tag]` | `pages/tags/[tag].js` | Posts filtered by tag |
| `/resume` | `pages/resume.js` | Resume/CV page |
| `/contact` | `pages/contact.js` | Contact page |
| `/rss.xml` | `pages/api/rss.js` (via rewrite) | RSS feed |

### Pinned Post

Pinning is driven by front matter. Add `pinned: true` to the post you want
pinned on the blog listing:

```yaml
pinned: true
```

Pin at most one post. `getPinnedPost()` in `lib/posts.js` returns `null` when
nothing is pinned (the card simply doesn't render), and if several posts are
flagged it uses the most recent and logs a build-time warning naming the
others rather than failing the build.

The pinned post is **excluded** from the paginated list so it never appears
twice — `getUnpinnedPosts()` is the source for both the page slices and the
"N posts · page X of Y" counter.

### Key Components

- `components/layout.js` — main page wrapper (exports `siteTitle`)
- `components/siteMetadata.js` — site-wide metadata (title, URL, author); update this when personalising the site
- `components/header.js` / `components/footer.js` — nav and footer
- `components/date.js` — formats dates using date-fns

### Styling

Tailwind CSS v4 is used throughout. A few pages have CSS modules (`styles/*.module.css`) for component-specific styles. Global styles are in `styles/global.css`.

### RSS Feed

Available at `/rss.xml` (rewritten from `/api/rss` in `next.config.js`). Feed metadata comes from `components/siteMetadata.js`.

### Testing

Playwright end-to-end tests live in `/tests/`. Tests hit `http://localhost:3000` directly — the dev server must be running before executing tests. Tests use `data-testid` attributes to locate elements.

### Vercel Analytics

`@vercel/analytics` and `@vercel/speed-insights` are included in `pages/_app.js` and only activate when deployed to Vercel.

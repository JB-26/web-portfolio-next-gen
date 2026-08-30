import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';


const postsDirectory = path.join(process.cwd(), 'posts');

// `template.md` is the scaffolding for a new post, not a post. It is
// gitignored so it never reaches production, but it is present locally, where
// it otherwise renders as /posts/template with an empty body and turns up in
// the blog listing, the sitemap and the RSS feed. Excluded by name rather than
// by a date-prefix rule, because several real posts (new-website.md,
// tic-tac-toe-python-07-11-2020.md among them) are not date-prefixed.
const TEMPLATE_FILE = 'template.md';

const isPost = (fileName) =>
    fileName.endsWith('.md') && fileName !== TEMPLATE_FILE;

// Rehype plugin that reproduces the custom <a>/<img> renderers the post page
// used to pass to <ReactMarkdown>. Keeping this identical is what lets us move
// markdown -> HTML to build time (see getPostData) without changing the
// rendered output:
//   - every <a> gets target="_blank" rel="noopener noreferrer"
//   - every <img> gets loading="lazy" decoding="async" and alt defaults to ""
// Precedence and attribute order mirror the old JSX exactly. The old renderers
// spread the element's existing props LAST (`<a href={href} target=... rel=...
// {...props}>` and `<img alt={alt||""} loading=... decoding=... {...props}>`),
// so a raw-HTML anchor/image that already declared target/rel/loading/decoding
// kept its own value. Destructuring href/alt out and re-adding them first
// reproduces both that precedence and the resulting attribute order.
function rehypePostAnchorsAndImages() {
    return (tree) => {
        visit(tree, 'element', (node) => {
            if (node.tagName === 'a') {
                const { href, ...rest } = node.properties || {};
                node.properties = {
                    href,
                    target: '_blank',
                    rel: ['noopener', 'noreferrer'],
                    ...rest,
                };
            } else if (node.tagName === 'img') {
                const { alt, ...rest } = node.properties || {};
                node.properties = {
                    alt: alt || '',
                    loading: 'lazy',
                    decoding: 'async',
                    ...rest,
                };
            }
        });
    };
}

// Build-time markdown -> HTML pipeline for individual posts. Mirrors the
// <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSlug]} components={{a, img}}>
// renderer this route used to run on the CLIENT, so the output is unchanged
// while react-markdown/rehype-raw/rehype-slug leave the route's client bundle.
// remark-parse is CommonMark (no GFM), matching react-markdown's default, and
// allowDangerousHtml lets rehype-raw pass author-embedded raw HTML through.
// rehype-slug runs after rehype-raw so headings inside raw HTML are also
// slugged (TableOfContents reads those ids from the DOM after mount). The
// processor is stateless across runs — rehype-slug uses a fresh slugger per
// tree — so it is safe to reuse this frozen instance for every post.
const postProcessor = unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypePostAnchorsAndImages)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .freeze();

// 71 of the 148 posts have no `description` in frontmatter. Layout used to
// paper over that with a single site-wide description; now that each page
// supplies its own, those posts need a real fallback or they ship with none at
// all. Deriving one from the opening prose beats emitting nothing, and beats a
// boilerplate string repeated 71 times.
export function buildExcerpt(content, maxLength = 155) {
    const text = content
        .replace(/```[\s\S]*?```/g, ' ')          // fenced code blocks
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')      // images
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')    // links -> their text
        .replace(/<[^>]+>/g, ' ')                  // raw HTML tags
        .replace(/^\s{0,3}#{1,6}\s+/gm, '')        // headings
        .replace(/^\s{0,3}>\s?/gm, '')             // blockquotes
        .replace(/^\s{0,3}[-*+]\s+/gm, '')         // list bullets
        .replace(/[*_`~]/g, '')                    // emphasis and inline code
        .replace(/\s+/g, ' ')
        .trim();

    if (text.length <= maxLength) return text;

    // Cut on a word boundary so the excerpt does not end mid-word.
    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return `${truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength).trimEnd()}…`;
}

function calculateReadingTime(content) {
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
}

export function getSortedPostsData() {
    // Get file names under /posts. readdirSync returns every entry in the
    // directory, so filter to markdown: a stray .DS_Store or editor swap file
    // otherwise becomes a post id, and /rss.xml and /sitemap.xml then 500 when
    // readFileSync is handed "<name>.md".
    const fileNames = fs.readdirSync(postsDirectory).filter(isPost);
    const allPostsData = fileNames.map((fileName) => {
        // Remove ".md" from file name to get id
        const id = fileName.replace(/\.md$/, '');

        // Read markdown file as string
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        // Use gray-matter to parse the post metadata section
        const matterResult = matter(fileContents);

        // Ensure that the 'tags' field exists, or provide an empty array as a default value
        const tags = matterResult.data.tags || [];

        const readingTime = calculateReadingTime(matterResult.content);

        // Combine the data with the id
        return {
            id,
            tags, // Include tags in the data
            readingTime,
            ...matterResult.data,
        };
    });
    // Sort posts by date
    return allPostsData.sort((a, b) => {
        if (a.date < b.date) {
            return 1;
        } else {
            return -1;
        }
    });
}

export function getAllPostIds() {
    const fileNames = fs.readdirSync(postsDirectory).filter(isPost);

    // Returns an array that looks like this:
    // [
    //   {
    //     params: {
    //       id: 'ssg-ssr'
    //     }
    //   },
    //   {
    //     params: {
    //       id: 'pre-rendering'
    //     }
    //   }
    // ]
    return fileNames.map((fileName) => {
        return {
            params: {
                id: fileName.replace(/\.md$/, ''),
            },
        };
    });
}


export async function getPostData(id) {
    const fullPath = path.join(postsDirectory, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Convert markdown to a real HTML string at build time via postProcessor
    // (defined above), which mirrors the old client-side <ReactMarkdown>
    // pipeline for this route.
    const processedContent = await postProcessor.process(matterResult.content);
    const contentHtml = String(processedContent);

    // Ensure that the 'tags' field exists, or provide an empty array as a default value
    const tags = matterResult.data.tags || [];

    const readingTime = calculateReadingTime(matterResult.content);
    const excerpt = buildExcerpt(matterResult.content);

    // Combine the data with the id and contentHtml
    return {
        id,
        contentHtml,
        tags,
        readingTime,
        excerpt,
        ...matterResult.data,
    };
}

export async function getPostDataRss(id) {
    const fullPath = path.join(postsDirectory, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Use the same build-time pipeline as the post page. The previous
    // `remark().use(html)` call had no allowDangerousHtml, so raw HTML embedded
    // in a post was silently dropped from the feed -- 2019-08-10-sega-saturn is
    // almost entirely raw HTML and arrived in readers nearly empty.
    const processedContent = await postProcessor.process(matterResult.content);
    const contentHtml = String(processedContent);

    // Ensure that the 'tags' field exists, or provide an empty array as a default value
    const tags = matterResult.data.tags || [];

    // Combine the data with the id and contentHtml
    return {
        id,
        contentHtml,
        tags,
        excerpt: buildExcerpt(matterResult.content),
        ...matterResult.data,
    };
}

export async function getPostDataByName(name) {
    const fullPath = path.join(postsDirectory, `${name}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Use remark to convert markdown into HTML string
    const processedContent = await remark()
        .use(html)
        .process(matterResult.content);
    const contentHtml = processedContent.toString();

    const readingTime = calculateReadingTime(matterResult.content);

    // Combine the data with the name (or id) and contentHtml
    return {
        name, // Change this to name if you're using the post name instead of id
        contentHtml,
        readingTime,
        ...matterResult.data,
    };
}

export function getPostsByTag(tag) {
    // getSortedPostsData() already reads and parses every post's frontmatter
    // (title, date, description, tags, readingTime) in a single pass. The tag
    // listing page only renders that metadata — not the rendered HTML body —
    // so re-reading each matched file from disk a second time was pure waste.
    const allPostsData = getSortedPostsData();
    return allPostsData.filter((post) => post.tags.includes(tag));
}

export function getAllTags() {
    const allPostsData = getSortedPostsData();
    const tagSet = new Set();
    allPostsData.forEach((post) => {
        post.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
}

// --- Pinned post selection -------------------------------------------------
// The pinned post used to be a hardcoded filename in pages/blog.js. It is now
// driven by `pinned: true` in a post's front matter.
//
// selectPinnedPost/selectUnpinnedPosts are pure so their edge cases can be
// unit-tested without a filesystem; the exported getters are thin wrappers.

export function selectPinnedPost(posts) {
    const pinned = posts.filter((post) => post.pinned === true);

    if (pinned.length === 0) return null;

    if (pinned.length > 1) {
        // A content mistake should be loud in the build log, but must never
        // fail the build — bad front matter shouldn't be able to take the
        // whole site down at deploy time.
        console.warn(
            `[posts] ${pinned.length} posts are marked "pinned: true" (${pinned
                .map((p) => p.id)
                .join(', ')}). Using the most recent; pin only one.`,
        );
    }

    // `posts` arrives newest-first, so the first match is the most recent.
    return pinned[0];
}

export function selectUnpinnedPosts(posts) {
    return posts.filter((post) => post.pinned !== true);
}

export function getPinnedPost() {
    return selectPinnedPost(getSortedPostsData());
}

export function getUnpinnedPosts() {
    return selectUnpinnedPosts(getSortedPostsData());
}

export function getRelatedPosts(currentId, tags, limit = 3) {
    if (!tags || tags.length === 0) return [];

    const allPosts = getSortedPostsData();

    const scored = allPosts
        .filter((post) => post.id !== currentId)
        .map((post) => {
            const sharedTags = post.tags.filter((tag) => tags.includes(tag)).length;
            return { ...post, sharedTags };
        })
        .filter((post) => post.sharedTags > 0)
        .sort((a, b) => b.sharedTags - a.sharedTags);

    return scored.slice(0, limit).map(({ sharedTags, ...post }) => post);
}

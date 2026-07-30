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

function calculateReadingTime(content) {
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
}

export function getSortedPostsData() {
    // Get file names under /posts
    const fileNames = fs.readdirSync(postsDirectory);
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
    const fileNames = fs.readdirSync(postsDirectory);

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

    // Combine the data with the id and contentHtml
    return {
        id,
        contentHtml,
        tags,
        readingTime,
        ...matterResult.data,
    };
}

export async function getPostDataRss(id) {
    const fullPath = path.join(postsDirectory, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Use remark to convert markdown into HTML string
    const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
    const contentHtml = processedContent.toString();

    // Ensure that the 'tags' field exists, or provide an empty array as a default value
    const tags = matterResult.data.tags || [];

    // Combine the data with the id and contentHtml
    return {
        id,
        contentHtml,
        tags,
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

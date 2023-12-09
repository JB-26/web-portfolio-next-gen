import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import fsPromises from 'fs/promises';


const postsDirectory = path.join(process.cwd(), 'posts');

export async function getSortedPostsData() {
    try {
        const fileNames = fs.readdirSync(postsDirectory);

        const allPostsData = [];

        for (const fileName of fileNames) {
            const id = fileName.replace(/\.md$/, '');
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const matterResult = matter(fileContents);
            const processedContent = await remark().use(html).process(matterResult.content);
            const contentHtml = processedContent.toString();
            const tags = matterResult.data.tags || [];

            allPostsData.push({
                id,
                tags,
                contentHtml,
                ...matterResult.data,
            });
        }

        const sortedPostsData = allPostsData.sort((a, b) => {
            if (a.date < b.date) {
                return 1;
            } else {
                return -1;
            }
        });

        return sortedPostsData;
    } catch (error) {
        console.error('Error in getSortedPostsData:', error);
        throw new Error('Error in getSortedPostsData. Check the server logs for details.');
    }
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

    // Combine the data with the name (or id) and contentHtml
    return {
        name, // Change this to name if you're using the post name instead of id
        contentHtml,
        ...matterResult.data,
    };
}

export async function getPostsByTag(tag) {
    const allPostsData = await getSortedPostsData(); // await the promise

    const postsWithTag = allPostsData.filter((post) => post.tags.includes(tag));

    const results = await Promise.all(postsWithTag.map(async (post) => {
        const fullPath = path.join(postsDirectory, `${post.id}.md`);
        const fileContents = await fsPromises.readFile(fullPath, 'utf8');
        const matterResult = matter(fileContents);

        const processedContent = remark().use(html).processSync(matterResult.content);
        const contentHtml = processedContent.toString();

        return {
            id: post.id,
            contentHtml,
            ...matterResult.data,
        };
    }));

    return results;
}


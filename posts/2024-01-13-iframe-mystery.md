---
title: "The mystery of trying to get iframes to be rendered"
date: "2024-01-11" #YYYY-MM-DD
tags: ["Blog"]
---

Recently, I’ve been trying to make posts that allow the use of rendering iframes on the page. But it turns out this is trickier than I thought.

What the behaviour I was seeing was that the iframe were not being rendered at all.

Why do I want iframes? I want to be able to embed interactive elements such as YouTube videos, code from CodePen, and even podcast players.

These changes will also go into the Super Blog Starter project as well, which will happen in the near future.

So, in this post, I’m going to share my crazy journey of how I solved this problem.

# Maybe it’s MDX?

My blog uses markdown files, which are converted to HTML via several packages. And at first I thought the issue lied with using markdown files themselves.

I ended up investigating supporting MDX files.

For those who don’t know, MDX files allow you to use JSX in the markdown content. So you can import components, like charts for example. MDX also supports a few other features from JavaScript, like expressions in braces.

I ended up thinking that this could be the answer.

But after bringing support to my blog for the format, iframes were not rendering still. But my time with it had shown that iframes were being stripped out of both markdown and MDX files.

On the plus side, I had something that supported both MDX and markdown, which is pretty cool. I may need to revisit that someday.

So, I knew for a fact that the issue wasn’t with the file format - but something else.

But *what*?

I thought about the problem for a few days until an idea popped into my head as I was getting ready for bed…

# Maybe it’s how I’m converting markdown to HTML?

I use a package called remark to help with converting markdown to an HTML string.

Here’s the function in question:

```jsx
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
```

My thoughts went to the line on how the constant of ‘contentHtml’ was being created.

Is this what is stripping out the iframe in a markdown file? Is it because of the remark package I was using?

I went ahead and investigated that train of thought.

I’m not the best programmer in the world, and I’m terrified of the stackoverflow community, so I turned a resource that was welcoming and friendly.

*ChatGPT.*

Yes, I turned to AI to help fix this problem. As this was something I had no experience in.

At first, ChatGPT suggested packages that didn’t exist. Not a great start. After recording the question, I ended up going round in circles. But, my question to it at first was giving the code snippet and the problem I was facing. I didn’t share my thoughts on what the problem could be.

After a few days, I returned to ChatGPT with more detail on what I was thinking, and how I thought the issue was with remark.

This time, the answer I got from ChatGPT was different. And it was tailored at focusing on the creation of the ‘contentHtml’ constant.

Progress! Maybe I had arrived at the answer I was looking for.

After a lot of hours going around in circles, I had another lightbulb moment.

I decided to run some logs to the console to see if I could find where the iframe was being ripped out.

And it was here:

```jsx
// Use remark to convert markdown into HTML string
const processedContent = await remark()
.use(html)
.process(matterResult.content);
const contentHtml = processedContent.toString();
```

Or more specifically, the use of `remark-html` was the cause of the problem.

To get around this, I removed the used of remark-html and used react markdown on the page for rendering posts.

Like this:

```jsx
export default function Post({ postData }) {
  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{postData.title}</h1>
        <div className={utilStyles.lightText}>
          <Date dateString={postData.date} />
        </div>
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{postData.contentHtml}</ReactMarkdown>
      </article>
      <div className={utilStyles.tags}>
        <h1 className={utilStyles.headingLg}>Tags:{" "}</h1>
        {postData.tags.map((tag) => (
          <Link key={tag} href={`/tags/${tag}`} className={utilStyles.tag}>
            {tag}
          </Link>
          ))}
      </div>
    </Layout>
    );
}
```

The problem was fixed!

See?

<iframe width="1280" height="720" src="https://www.youtube.com/embed/c9pQYOGIWM8" title="4K Tropical Rain Sounds & Relaxing Nature Video - Sleep/ Relax/ Study/ Meditate - Ultra HD" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

And I made a small CSS change to ensure that iframes display correctly on mobile devices:
```css
iframe {
    width: 100%;
}
```

But there was another problem, the RSS feed.

Instead of displaying the HTML, it displays the markdown. Which isn’t great for RSS readers.

So, since I knew that the original function worked, I decided to copy the original and make a new function for the RSS feed:

```jsx
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
```

This won’t render the iframes in an RSS reader, but readers can view the website if they want to see the iframes.

And that’s the mystery of the iframes solved!

What started out as an estimated small fix turned into something much larger. 

I’ll have to revisit adding MDX support in the future, as being able to use JSX in a markdown file could be quite useful.

Until next time 👋
---
title: "Version 5"
date: "2025-11-29" #YYYY-MM-DD
tags: ["Blog", "Code"]
ogImage: "public/images/opengraph-image.png"
description: The latest and greatest.
---
It’s been sometime since I made a new version of this website. In fact, the last time I wrote about changes to this website was [August 2023](https://www.joshblewitt.dev/posts/2023-08-05-version-4).

Recently, I felt that changes were needed on this website. Remove some pages, add some new ones, change the font size etc. I was seeing some other personal websites and I felt that my website needed an improved focus. I felt that this website should serve as my digital business card and a space for my writing. And today, version five is now live.

So, what’s new?

## Tailwind CSS

[Tailwind CSS](https://tailwindcss.com/) is a popular CSS framework that gives developers access to CSS classes, so that websites can be styled without having to leave HTML. Sure, it doesn’t look nice in an editor as it’s essentially styling via inline CSS, but it does speed up the process.

I decided to give it a spin and try to use it as much as possible across my website. I do see the benefits of using Tailwind, but I definitely understand why some don’t like how messy it looks in a code editor.

Tailwind is now being used across all pages across this website, it was a lot of work (especially when trying to find classes that matched what you want), but I felt I learnt more about Tailwind as a result.

I’m also using Tailwind Typography on the blog posts now to make the posts easier to read. 

## New pages

I’ve removed the uses, links and the about pages. These have been replaced with the all new contact and resume pages. I felt that the information on this website needed to be more focused on key facts about me, rather than information that didn’t bring much value. 

The resume page gives a brief overview of my work experience, my projects, certifications and hobbies. This page serves key information about my professional history with a personal touch at the end about my hobbies. There’s a slight difference in the photos used when viewing the page on a mobile or a desktop screen, the mobile view only shows two photos, while larger views show three photos. Having three photos on a mobile view just felt unworkable so I reduced it to two photos. Plus, there’s a fun animation when you mouse over the photos on a desktop.

The contact page gives a selection of buttons that lead to various platforms where I have a presence on. Nothing special, it reuses the button I had on the homepage so it has the smooth effect when hovering over, which shows the button being ‘lifted’ up.

## Improved index page

The button to contact me has been removed, the link to my digital resume on Notion has been removed, and the wording has been redone. I feel that the new paragraph gives a better introduction to myself, and includes several links that highlight key words that describe me. And, there a new animation if you hover over the photo while on a desktop view. It’s the same animation used on the resume page, I just think it looks nice.

## Improved CSS styling on all views

I noticed that the font sizing on the mobile view just didn’t feel right, some of the headings could’ve had a larger font, and the blog could’ve had smaller font. So in version five I decided to revisit this. I think it looks much better and is more readable now.

## New icons

You might notice in the footer and on the contact page there are a few new icons that point to my YouTube, GitHub and Instagram accounts. Feel free to follow me on those accounts as well as on Bluesky and LinkedIn (despite the fact that [I don’t like LinkedIn](https://www.joshblewitt.dev/posts/2025-09-28-linkedin)).

## Custom component when rendering blog posts

I noticed that despite that majority of the links on this website have security attributes and open in a new window, the links included in blog posts did not have this. I figured it was important to have this improved, but how? This blog renders markdown files, and I can’t add security attributes to a markdown file.

What I could do however was add a custom component like so:

```tsx
<div className={`${postStyle.dropCap} prose text-black max-w-none`}>
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            components={{
              a: ({ node, href, children, ...props }) => {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  >
                    {children}
                  </a>
                );
              },
            }}
          >
            {postData.contentHtml}
          </ReactMarkdown>
        </div>
```

This component applied the security attributes to each `a` tag in the HTML of the blog post. Now everything on this website will have security attributes!

## Wrap up

And that’s the big changes included in version five of this website. There have been some smaller changes and clean up as well, but those changes aren’t worth mentioning.

If you have any thoughts or feedback, let me know.

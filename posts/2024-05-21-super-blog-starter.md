---
title: "What’s going on with Super Blog Starter?"
date: "2024-05-21" #YYYY-MM-DD
tags: ["Super Blog Starter"]
ogImage: "public/images/opengraph-image.png"
---

It’s been sometime since I last talked about my small project, [Super Blog Starter](https://github.com/JB-26/super-blog-starter). In fact, I last talked about this project when I released v0.1.0. Although I’ve been busy, I’ve been able to maintain the project and make small improvements to it.

In case this is your first time hearing of Super Blog Starter, it’s a starter template that allows anyone to have their own blog quickly and easily. It’s also what this website is based on!

What’s included in Super Blog Starter? Well…

- Homepage
- About page
- Blog page
    - Pagination included (and customisable)
    - Pinned Post feature
    - Links to blog posts
    - Ordered by newest post first
    - Tag your posts with a category that readers can find related posts
    - Search bar
- Blog posts
    - Signature at the bottom (that you can customise!)
    - Code formatting
    - Quote formatting
    - Embed iframes into posts
- Responsive design
- Header and Footer (that you can customise!)
- Customisable 404 page
    - Search bar
- RSS feed (that you can customise!)
- ESLint

So in this short post, I wanted to share what’s been going on with this, as I’ve just released v0.5.0 🎉

# The changes

- A small selection of automated tests using Playwright have been included. These will run automatically via GitHub actions.
- iframes can now be included in blog posts! Just add the iframe to the markdown post and you’ll see it rendered on the page! However, these iframes won’t be rendered in the RSS feed.
- Updated documentation
- Package updates; NextJS is now running version 14.2.2. This includes several build and production improvements from build memory usage, to CSS optimisations. It’s worth an upgrade.

# Give it a spin!

If you haven’t tried it yet, please do! I’m curious to hear what people think of it. It should be fairly easy to get going with the starter.

# The future

I intend to keep the project going, and I plan to make several new updates to it including adding more playwright tests and keeping the packages updated.

Until next time 👋
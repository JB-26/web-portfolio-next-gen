---
title: "What’s new on Super Blog Starter in version 0.1.0?"
date: "2023-12-02" #YYYY-MM-DD
tags: ["Super Blog Starter"]
---

It’s been a while since I last talked about my ongoing project, [Super Blog Starter](https://github.com/JB-26/super-blog-starter). The project where anyone can get a blog up and running in minutes.

So what’s new?

# Package updates

The packages used in the project have been updated. I’m aware that there are newer versions available so I’ll update them again in the near future (especially since a new version of NextJS is now out).

# Performance of fetching posts associated with a tag

The performance of fetching posts was a little slow, so I’ve made some improvements which should make it slightly faster.

# Fix on Safari desktop

Fixed a weird issue where Safari on desktop wasn’t displaying the homepage correctly.

# Search Bar functionality

And finally, a search bar! This will now allow you to search for posts directly on the blog. The search bar is on the blog page and the 404 error page.

I created this function as the analytics from Vercel showed that search engines are still using the old URL for posts. The original url would be ‘blog/post-name’ but the new url is ‘posts/post-name’. So, when a user reaches the error page or decides to visit the blog page, they can search for the post directly.

Give it a try and find a post!

# What’s next?

I want to have a series of automated tests using PlayWright in the future. I think it’s important for this project to have a series of tests that check for quality. I don’t think I’ll get the tests done by the end of the year, I’m planning on getting that done next year.

# Give the project a spin

If you want to have a blog of your own, give this project a spin and let me know what you think!
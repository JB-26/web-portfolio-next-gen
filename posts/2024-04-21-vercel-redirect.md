---
title: "Vercel and redirections"
date: "2024-04-21" #YYYY-MM-DD
tags: ["Blog"]
ogImage: "public/images/opengraph-image.png"
---

There’s been something that has been slowly bugging me since I did the rewrite of this website (going from Gatsby to NextJS) - and that’s the fact that I changed the directory of where my blog posts are stored.

Originally, it used to be `/blog/` and now it’s `/posts/`  - which turns out has caused some issues with search engines showing links to my posts.

The problem is that the search engines will display the link to older posts with the old directory, not the new one. So when a user would click on a link from a search engine, they would be greeted by a 404 page. Not a great experience for the user.

I’ve got several years worth of content and it would be great if users can easily access my content if they find it on a search engine.

Looking through the analytics on Vercel, some of my older posts were still being viewed, with the referrer being Google or Bing.

In fact, one of my more popular posts is about the [Ruby package called httparty](https://www.joshblewitt.dev/posts/2021-04-05-ruby-httparty). It was a post I wrote in 2021 and to this day, it remains one of my most popular posts ever.

At first I thought this problem would go away, that maybe the search engines would update their results to show the correct URL to my post. But it didn’t. And the number of views on my old posts would continue, each user seeing the 404 page.

At first, I updated the 404 page to include a search bar, hoping that people would search for the post that they were looking for, but nobody seemed to use it.

So very recently, I decided to tackle this issue and in the short post, I’m going to explain how I solved it.

# Introducing redirects in Vercel

There are two ways of doing a redirect with NextJS and Vercel:

- [A dynamic or static redirect](https://vercel.com/docs/edge-network/redirects)
- [Configuring with a vercel.json file](https://vercel.com/docs/projects/project-configuration#redirects)

I’ll be using the `vercel.json` file for this, as I’m only doing one redirect.

Let’s take a look at what I did:

```json
{
    "redirects": [
        {
            "source": "/blog/:path*",
            "destination": "/posts/:path*",
            "permanent": true
        }
    ]
}
```

And to explain what this does:

- The source is the `blog` directory, using the wildcard path matching to redirect to any path.
- The destination is the `posts` directory, using the wildcard path matching to redirect to any path.
- The `permanent` flag means that the user will receive a status code of [301 Moved Permanently](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/301)

The file sits at the root directory of the project.

And with that, the redirect is now complete!

I put this into production a few weeks ago, and so far it’s working well. People have been redirected correctly and I haven’t seen anyone being directed to the old file directory.

And that wraps up this short post, I’ve got some other posts in the pipeline which I'll upload in the future.
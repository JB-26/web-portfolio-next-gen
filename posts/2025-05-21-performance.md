---
title: "Performance improvements"
date: "2025-05-21" #YYYY-MM-DD
tags: ["Blog"]
ogImage: "public/images/opengraph-image.png"
description: "Small changes, big impact."
---

Over the past month or so, I’ve been looking at how I can improve the performance of this website. Vercel analytics has given me an insight that although most of the visitors to this site have no performance issues, there are some that do and that drags the overall performance score down.

Don’t get be wrong, the website does well generally, but there were just pockets of small issues that degraded the experience for some.

In Steve Krug’s book, “Don’t make me think”, there’s a part that mentions how users can have a well that describes how they feel about using a website. You don’t want the well to run dry if you offer a bad experience.

If you haven’t read “Don’t make me think”, you should read it. I view it as essential reading if you work with software (if you’re a developer, QA, product, business analysis, etc).

I decided to make it a personal mission recently to do what I can to improve the performance of this website. And today, I believe this is the most performant my blog has *ever* been. Over the years, I’ve moved away from something being stylish to focusing on something that’s readable. For those who don’t remember the website I had built with Gatsby, it was filled with custom fonts, animations and packages to make it work. Now this website, using the NextJS framework, *just* works.

There were several areas that I wanted to talk about in this short post about the changes I made to improve the performance.

## Packages

After running my favourite command:

```
npm outdated
```

I saw that all of my packages were extremely outdated, so each one has been updated to the newest version.

NextJS was one major versions behind, along with React. Plus, the packages I use to render these markdown posts were also one version behind.

I used a package called ‘[ncu](https://www.npmjs.com/package/npm-check-updates)’ to help with updating my packages. I really should keep on top of maintaining the packages that I use.

## Removing the search function

I used to have a search function on the blog page, but nobody used it. So I removed it. Having less to load is always a plus. If there’s a need for it, I’ll add it back in at a later date.

I’m still keeping the tags at the end of each post. I genuinely believe that it adds value and improves post discoverability. Maybe it’s something that I can improve in the future.

## Smaller images

The images I use on the home page and the about page were a little over 1MB each, which is pretty big. So I used Pixelmator Pro to compress the images to make them even smaller in size. Each image is now roughly over 300KB each - much better than being over 1MB.

The smaller images have been loading much quicker which helps make the all important good first impression to visitors.

## Removing custom fonts

As part of this drive to improve performance, I reviewed the number of fonts I was using. I had roughly twenty custom fonts which is a little bit too much. I ended up removing all the custom fonts and instead using a font stack that is tailored to a native font on the user’s operating system.

```css
body {
font-family:`

`-apple-system,
BlinkMacSystemFont,
Segoe UI,
Roboto,
Oxygen,
Ubuntu,
Cantarell,
Fira Sans,
Droid Sans,
Helvetica Neue,
sans-serif;`

`}
```

This provides a consistent sans-serif look across all operating systems that looks modern.

## Local icons

Across this website, I use several icons that can be found on the footer and the home page. And after doing the performance changes mentioned above, I noticed that there was one final thing that was bothering me.

The icons were loading seconds after everything else. It just didn’t look right and begun to bother me. So I decided to do something about it.

The icons were originally being called from FontAwesome, which involved running a script to fetch them. The icons themselves are free to use, and FontAwesome offered the icons to download as an SVG file. I decided to switch to the SVG files and remove calling the script to FontAwesome.

Switching to these files has made them load much faster, and now there isn’t an awkward delay between the images and icons loading.

## Wrap up

I’ve been seeing that the performance is now more frequently either 100 or 99 on Vercel after these changes were introduced, so it’s good that more visitors are having a better experience.

It’s great knowing that this is the most performant my website has ever been. I shudder thinking about how many packages, fonts and large images I had back when this was built with Gatsby.

I’m sure that there are other ways of how this website could improve in terms of performance. But right now, it offers a consistent experience across different platforms.

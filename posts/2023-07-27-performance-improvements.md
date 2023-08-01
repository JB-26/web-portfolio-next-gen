---
title: "Making performance improvements on the blog"
date: "2023-07-27" #YYYY-MM-DD
description: "Better than ever!"
image: https://images.unsplash.com/photo-1508962914676-134849a727f0?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=4800
---

A while back, I enabled Lighthouse reports on Netlify to get a better understanding of how I can improve this website.

Turns out that performance was a *major* problem. My most recent deploy to production had a performance score of 59 out of 100.

*Yikes.*

Lighthouse found that

- The first contentful paint took 4.8 seconds
- Time to interactive took 6.5 seconds
- Speed index took 4.8 seconds
- Total blocking time took 10 milliseconds (that’s good)
- Largest contentful paint took 9.8 seconds (that’s **not** good)

So overall this website was very slow, especially to new users loading the website. There’s clearly room for improvement. And thankfully, lighthouse has recommendations on how to improve the performance.

This blog post goes into detail about the performance improvements I made and the new and improved score from Lighthouse!

# Images

So it turns out that the images I were using were not using a next-gen format such as WebP which offer better compression than PNG and JPEG (which means faster downloads and less data consumption) and the images I were using were not properly sized. This was one of the biggest factors for slow performance.

So I’ve changed the format to WebP for the images, and I’ve resized them!

Speaking of images, the icon used in the header didn’t have an explicit height and width defined, this has been fixed as well. The main benefit of having a set height and width is that this reduces layout shifts and improve CLS.

# Text remaining visible during webfont load

Lighthouse suggested that if I use the [font-display](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display) feature, this will ensure that text is user-visible while webfonts are loading. So now each font will look something like this:

```css
@font-face {
    font-family: "DM Sans-Bold";
    src: url("../fonts/DMSans-Bold.ttf");
    font-display: swap;
}
```

# Preconnect to required origins

Lighthouse found an opportunity to establish early connections to improve third party origins by using preconnect or dns-prefetch. The third party in question is the service I used for the icons - Fontawesome.

So now the following event listener is added to each page:

```html
<link rel="preload" href="https://ka-f.fontawesome.com/"/>
```

Lighthouse gave an estimated saving of 0.16 seconds.

# Package updates

I’ve been keeping on top of updating packages that are used by this website. The most notable updates are:

- postcss
- typography

I’ve also updated the version of Node that’s used from version 19.6.1 to 20.3.1.

# Other updates

I’ve also fixed some issues found from [ESLint](https://eslint.org/), I forgot to update the syntax used when using classes (updated from class to className).

Also, I’ve added a meta description to improve search engine optimisation.

# The final scores…

The performance improvements I’ve made have had a *huge* impact on the website, and now Lighthouse reports that:

- The first contentful paint took 3.5 seconds
- Time to interactive took 3.8 seconds
- Speed index took 3.5 seconds
- Total blocking time took 10 milliseconds
- Largest contentful paint took 5.4 seconds (that’s **much** better)

With a final performance score of 71 - which is a better score!

# The road ahead

One of the next big pieces of improvement is to convert the use of markdown to [MDX](https://mdxjs.com/). I’d like to do this before the end of the year.

I’ve also been thinking doing a slight redesign on the blog page as well.

# Wrap up!

And those are the improvements that I’ve made to this website. Hopefully you’ll find that the performance is much improved!

And maybe you’ve found some ideas how you can improve the performance of your website!
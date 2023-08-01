---
title: "What I’ve learnt about Cypress this month (as a newcomer) 🤖 "
date: "2022-02-06"
description: "From creating environment variables to a mystery restart."
image: https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80
---

![Web browser](https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80)

Recently at work, I had the task of automating a journey of performing an action on one domain and verifying the result on another domain.

Turns out this was more challenging than I previously thought.

I don’t have too much experience with Cypress so this gave me an excellent opportunity to dive in and learn more about it.

So for this blog post, I wanted to share what I’ve learnt about Cypress this month.

## Yielding with ‘then’
So here’s an interesting one to start with. As described above, I needed to verify an action done on one domain (X) on another (Y). To do this, I needed to login to website Y by using a value in a cookie from website X. Turns out this was a good learning experience in understanding the limitations and trade offs of using Cypress.

My original plan was to just use the [get cookie](https://example.cypress.io/commands/cookies#getCookie) command, get the value from the header and assign it to a variable so I can use it in a visit command. Should be straightforward right? 

Not so much due to several reasons. One of them being that the Cypress API is [asynchronous](https://docs.cypress.io/guides/core-concepts/variables-and-aliases#Return-Values). You can’t use the return values of Cypress commands or assign them to a variable.

This is annoying at first, and a bit confusing to get your head around. But if you think about it, modern web applications aren’t synchronous.

To get around this, I decided to take a look at yielding Cypress commands with the ‘then’ statement, like so:

```
cy.getCookies().then((cookies) => {
	cy.log(cookies[0]['thing']
	cy.visit('www.whatever.com/' + cookies[0]['thing']
})
```

In theory, this should access the value held within the cookie and concatenate it to to the end of the visit command.

But this lead to another issue that had me and my colleague scratching our heads for a bit…

## The mystery restart
Whenever Cypress would reach the visit command inside the ‘then’ statement, Cypress would restart itself. There would be no error printed to the console of the browser which made things a little difficult to find out what was going on.

It wouldn’t restart the _whole_ test, only the current ‘it’ statement. It sounds crazy, but I assure you, it’s true! One of my colleagues saw it happen as well. So we decided to investigate.

At first we looked at the possibility that the cookie value needed to be encoded properly to be used in a URL. So we decided to use the JavaScript function [encodeURI](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI) to see if that made a difference. Sadly it didn’t, Cypress would still restart itself.

My colleague found a [GitHub](https://github.com/cypress-io/cypress/issues/3454) issue about the same behaviour of Cypress restarting. This was opened in 2019 and the last comment was a year ago, so it’s an issue that is still affecting Cypress today.

So we decided to have a rethink and we were able to make some progress but we soon hit another problem; Cypress doesn’t support navigating to different domains within the same test.

This is described in the Cypress [documentation](https://docs.cypress.io/guides/references/trade-offs#Same-origin) as a trade off. So if you had a test that was visiting `abc.com` you _cannot_ change to `xyz.com`.

In the end, the test was then split into two different tests to get around it. Now we know for next time!

## DIY environment toggles
One thing I learnt is making your own toggles that affect your tests in Cypress.

I saw that the console was printing out a _ton_ of XHR requests in a test and it made reading what was going on in the test difficult. So I decided to do some research of how I could turn off logging this information.

After doing a quick [search](https://gist.github.com/simenbrekken/3d2248f9e50c1143bf9dbe02e67f5399), you can! But if you wanted to enable this logging again, you’d have to remove the code, which I felt wasn’t great. I decided to take a look at making this into a toggle of some sorts.

Turns out you can! This lead me down the road of [environment variables](https://docs.cypress.io/guides/guides/environment-variables#Setting) in Cypress. With this in mind, I decided to create an environment variable for hiding XHR requests.

So, here is the code that lives in the `index.js` file (under the support folder):

```
if (Cypress.config('hideXHR')) {
  const app = window.top;

  if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
    const style = app.document.createElement('style');
    style.innerHTML =
      '.command-name-request, .command-name-xhr { display: none }';
    style.setAttribute('data-hide-command-log-request', '');

    app.document.head.appendChild(style);
  }
}
```

And here is the code for the `cypress.json` file:
```
{
	"hideXHR": true
}
```

Now you can simply toggle it to either true or false depending if you want to see XHR logging or not! (And it turns out someone had the same [thought](https://dev.to/samelawrence/muting-noisy-xhr-logs-in-cypress-4495) as I did!)

I also decided to create an environment variable for ignoring uncaught exceptions (as the application I was working with would throw an uncaught exception and not provide a stack trace).

This was done by taking the code in the Cypress [documentation](https://docs.cypress.io/api/events/catalog-of-events#Uncaught-Exceptions), wrapping it in an if statement and updating the `cypress.json` file.

## Wrestling with Wait (and timeouts)
Cypress is quite clever that it will wait until the DOM has been loaded before looking for elements. It’s part of the [retry-ability](https://docs.cypress.io/guides/core-concepts/retry-ability) of Cypress.

However, in the application that I was working with, Cypress assumed that the DOM had been fully loaded. So in some cases, the test would fail because the element didn’t exist _yet_.

At first, I would use the [wait](https://docs.cypress.io/api/commands/wait#Syntax) but my colleague showed me something else, changing the timeout value.

Initially, Cypress has a default timeout of 4 seconds, but this value can be changed, like so:

```
cy.get('.css-class', { timeout: 10000 })
```

This command now has a timeout of 10 seconds. I find this to be better than using wait commands.

## Cypress Studio is useful in capturing tricky elements 
There was an element I was having trouble accessing, where it could disappear if you click away from it. So trying to access the element with the development tools or Cypress itself wasn’t possible.

So I turned to [Cypress Studio](https://docs.cypress.io/guides/core-concepts/cypress-studio#Overview) so I could record the steps of capturing this particular element.

And Cypress Studio caught _exactly_ what I needed. It’s quite powerful of how it will write the steps of what was recorded to your JavaScript file so you can take a look at what was done.

Although it’s an experimental feature, it’s still worth giving it a spin if you’re struggling with an element which has a behaviour that works against you.

You can enable it by updating your `cypress.json` file with the following:
```
{
  "experimentalStudio": true
}
```

## Having patience with Jenkins
A problem that I didn’t think that I’d encounter is with [Jenkins](https://www.jenkins.io/). My cypress tests would work fine locally but wouldn’t work when a Jenkins job would run them.

Curious, I looked at the screenshots that were captured and found that the reason for the test failing is because it couldn’t find the element, and it seemed that part of the page was still loading (this was mentioned before as Cypress thought that the DOM had loaded)

As an experiment, I decided to increase the timeout value to 50 seconds and sure enough, it passed. So I had to extend all the existing timeouts to much larger values.

Maybe the cause of this was due to the VM that Jenkins uses is significantly slower than my work machine.

## Code reviews are helpful in finding areas where you can improve
I’ve never really ben part of code reviews before, as I previously worked as a manual software tester. So this was a good way for me to learn from others and gain confidence in writing better tests next time.

## Until next time…
Hope you enjoyed reading this post about Cypress! Who knows, maybe I’ll do a follow up post next month about more things I’ve learnt about Cypress.

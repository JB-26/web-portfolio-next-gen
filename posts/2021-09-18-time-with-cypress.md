---
title: "Spending time with Cypress 🤖"
date: "2021-09-23"
description: "Taking a look at some web automation with Cypress"
image: https://images.unsplash.com/photo-1516110833967-0b5716ca1387?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1400&q=80
---

When it comes to testing, I've had plenty of experience (I mean, seven years of experience) and if there's one thing I stand by it's my view on automation. Automation, in many ways, is the future of testing. Automation helps free time for QA Engineers to explore issues and other work. Plus, the journey to automate your application provides a great opportunity to advance your career. Plus, with applications continuing to grow in size and complexity, automation is key in tackling applications which would normally take a long time to manually test during each regression check. 

Web automation isn't new, there are other solutions to this problem such as [selenium](https://www.selenium.dev/) - but I've found selenium troublesome to use. From configuring web drivers to wrestling with syntax, waiting for pages to load, selenium might not be the best automation tool out there. So, [Cypress](https://www.cypress.io/) has changed that. With features such as time travel, automatic waiting and being able to configure different viewports really easily - Cypress is quickly becoming a popular tool for web automation.

With it's easy to use API, good documentation (seriously, the [kitchen sink](https://example.cypress.io/) is a really good source to practice cypress), getting started with Cypress is really easy. And it comes with support for different browsers out of the box! Tests for Cypress are written in JavaScript and having some knowledge of the language can be quite useful (as I'll go into detail).

A hidden benefit of using Cypress is that since the tests are written in JS, you can use your favourite IDE to write the tests. I prefer to use Visual Studio Code myself as I can the terminal integrated into the IDE and have Cypress running from it.

One thing I have noticed about Cypress is just how _fast_ it is to set up and go. Installing Cypress is done via NPM and be installed anywhere on your machine and it's quite fast on starting up. Plus, if you make a change to a test you're working on, Cypress will automatically reload!

Let's talk about writing tests for Cypress. Something that you'll be doing most of your time while using Cypress. As Cypress is built on top of Mocha and Chai, writing tests supports the use of BDD and TDD (but I prefer BDD) so organising your tests is relatively easy. I've got a working example of a Cypress test looking at the kitchen sink [here](https://github.com/JB-26/cypress-practice) if you want to take a look.

Let's jump in!

```
//create array of viewports for test
const sizes = ["iphone-xr", "ipad-2", "macbook-13"];

//generate a random number between 1 and 10
let randInt = Math.floor((Math.random() * 10) + 1);
//print to console
console.log(randInt);
```

Cypress has a [viewport](https://docs.cypress.io/api/commands/viewport) command that allows you to adjust the height and width of the browser window. You could enter your own values or use a set of preselected ones. In this case, I created an array and stored the string values of the stored pre-sets.

Oh, and I wanted to generate a random number so I can use it later.

So when we come to run the tests...

```
sizes.forEach((size) => {
```

Cypress will iterate through the array, looping over each viewport for the test. Which is quite handy if you want to check multiple views for a test.

So let's breakdown a test:

```
describe("Navigate to my site!", () => {
  sizes.forEach((size) => {
    //using string interpolation to display the name of device
    it(`Go to kitchen sink and visit "type" section on ${size}`, () => {
      //set viewport
      cy.viewport(size);
      //visit website
      //cy.pause();
      cy.visit("");

      //click the link
      //cy.pause();
      cy.contains("type").click();

      //get an input and check if its empty
      cy.get(".action-email").should("be.empty");

      //get an input and type into it (then verify)
      cy.get(".action-email")
        .type("fake@email.com")
        .should("have.value", "fake@email.com");

      //check if disabled text area is disabled
      cy.get(".action-disabled").should("be.disabled");
    });
```

We __describe__ first of what the test will involve, and then use __it__ to breakdown each step. In the example above, Cypress will perform the following:
- Set the viewport from the sizes array.
- Visit a website (which is configured in the cypress.json file - under the 'baseURL' property)
- Click on a link which contains the text "type"
- Get the input using a class called '.action-email' and check that the form is empty.
- Get the input (same class) and type "fake@email.com". Check to make sure the value of the field is "fake@email.com"
- Check if the field using the class ".action-disabled" and ensure it is disabled.

This test is executed in the Cypress test runner - which has a number of great features:
- Screenshot and video recording
- Time travel (view previous states in the test runner)
- Before and after screenshots

It's all pretty great at how Cypress provides a great level of detail for the tests that are being run.

On top of that, writing the tests themselves is easy to do (if you are familiar with JS). The fact that the actions almost read like a sentence helps with readability.

So what else can you do with Cypress?

Well...

```
    it(`Go to the kitchen sink and visit the navigation section on ${size}`, () => {
      cy.viewport(size);

      cy.visit("");

      cy.contains("reload")
        .click();

      //check the location of the pathname
      cy.location('pathname').should('include', 'navigation');

      //go back one page
      cy.go('back');

      //check the location of the pathname again
      cy.location('pathname').should('not.include', 'navigation');

      cy.contains('title')
        .click();
      
      //check the title of the page
      cy.title().should('include', 'Kitchen Sink')
      cy.title().should('not.include', 'test')
    });
```

What this test does is:
- Visit the website
- Click on the reload link
- Check the pathname in the URL to include navigation
- Go back one page
- Make sure that the pathname does not include navigation
- Make sure the title includes Kitchen Sink and not test.

So you can not only check what's on the page, but the metadata as well.

But this is only a small example of what you can do with Cypress. The [documentation](https://docs.cypress.io/guides/references/assertions#Chai) has some great examples of what you can do with Cypress.

Remember the random integer I mentioned above? I decided to use that just to see the random number being entered!

```
cy.viewport(size);

      cy.visit("");

      //click the link
      //cy.pause();
      cy.contains("type").click();

      //get an input and check if its empty
      cy.get(".action-email").should("be.empty");

      //get an input and type into it (then verify)
      cy.get(".action-email")
        //use the random integer
        .type(`${randInt}`)
        .should("have.value", `${randInt}`);
```

And also, I use string interpolation on the title of the test so the user can see what viwport is being used.

```
it(`Go to the kitchen sink and visit the navigation section on ${size}`
```

It's pretty amazing of just how much JS you can use to enhance your Cypress tests.

It's not just automating testing of sites, it can also make [requests](https://docs.cypress.io/api/commands/request) as well (but I think [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/) would be better suited for the task of testing APIs etc.)

But if you're looking for a tool for web automation, be sure to check out Cypress. They have a strong community on [GitHub](https://github.com/cypress-io/cypress) and also have a [roadmap](https://docs.cypress.io/guides/references/roadmap) of upcoming features.

Thanks for reading! 👍
---
title: "Cool Colour Combos #1 Ocean blue"
date: "2023-04-01" #YYYY-MM-DD
description: "Alliteration is always cool "
image: https://images.unsplash.com/photo-1505909182942-e2f09aee3e89?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=7200
---

Hey! Welcome to a new series all about _cool colour combos_ I’ve found online.

But, why should I care about colours on a website? Well, good design should invoke an emotional response.

And getting the right selection of colours is also important as well.

Here are a few notes that I’ve taken about colour theory:

## Combining colours

Choose an analogous colour.

- Adjacent colour
- Creates designs that are harmonious and easy to look at.

## Choosing a complimentary colour

- A colour that’s opposite of another
- Create designs that grab your attention and stand out
- Good for logo design or screenshots

## Choosing a split colour

- Take a colour, look at it’s complimentary colour and then look at it’s analogous colours
- Good for application icon design

So, let’s take a look at this first set of colours that I found on [Colour Hunt](https://colorhunt.co/palette/f9f7f7dbe2ef3f72af112d4e). The colours featured here are blues and whites. The blues could give the mood of stability, trust and serenity.

I've created this CodePen that shows the colours on some buttons, a square and a table.

<iframe height="600" style="width: 100%;" scrolling="no" title="Cool Colour Combo" src="https://codepen.io/JayBl/embed/vYzqRom?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/JayBl/pen/vYzqRom">
  Cool Colour Combo</a> by Joshua Blewitt (<a href="https://codepen.io/JayBl">@JayBl</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

Let's talk about some of these components in more detail.

## The table

Let's talk about the table first (that's all the way down the page.)

Here's the CSS for that:

```
table {
  background-color: #112d4e;
  border-radius: 11px;
  margin: 25px;
  border-style: solid;
  border-color: #dbe2ef;
  border-width: 2px;
  border-style: solid;
  box-shadow: 8px 8px #dbe2ef;
  text-align: center;
  width: 90%;
}

th {
  color: #f9f7f7;
  font-size: 24px;
}

td {
  color: #dbe2ef;
  font-size: 21px;
}
```

You can see that the table header uses a bright font (#f9f7f7), to make it stand out. While the table row uses a more subtle colour (#dbe2ef). To be fair, the font size also helps in grabbing the user's attention.

We can also see that the box shadow uses a lighter shade of blue.

## The button(s)

You might recognise these buttons, I use them on the homepage! Let's look at the CSS:

**Card 1**

```
.card {
  background-color: #3f72af;
  background-size: 4px 4px;
  display: flex;
  flex-direction: column;
  width: 300px;
  height: 60px;
  border-color: #112d4e;
  border-width: 2px;
  border-style: solid;
  box-shadow: 10px 10px #112d4e;
  word-wrap: break-word;
  text-align: center;
  text-decoration: none;
  font-size: 29px;
  padding-bottom: 25px;
  /* allows for smoother animation */
  transform-origin: center;
  transition-duration: 150ms;
}

.card:hover {
  /* raise the button up */
  transform: scale(1) translateY(-3px);
  box-shadow: 15px 15px #112d4e;
  animation-duration: 7000ms;
}

.card:active {
  /* lower the button down */
  box-shadow: 5px 5px #112d4e;
  transform: scale(0.99) translateY(-1px);
}
```

**Card 2**

```
.card2 {
  background-color: #112d4e;
  background-size: 4px 4px;
  display: flex;
  flex-direction: column;
  width: 300px;
  height: 60px;
  border-color: #3f72af;
  border-width: 2px;
  border-style: solid;
  box-shadow: 10px 10px #3f72af;
  word-wrap: break-word;
  text-align: center;
  text-decoration: none;
  font-size: 29px;
  padding-bottom: 25px;
  /* allows for smoother animation */
  transform-origin: center;
  transition-duration: 150ms;
}

.card2:hover {
  /* raise the button up */
  transform: scale(1) translateY(-3px);
  box-shadow: 15px 15px #3f72af;
  animation-duration: 7000ms;
}

.card2:active {
  /* lower the button down */
  box-shadow: 5px 5px #3f72af;
  transform: scale(0.99) translateY(-1px);
}
```

So they're both the same apart from the colour (the colours are essentially swapped). Personally, I like the first button more than the second button. The drop shadow with a lighter colour doesn't work as well as I initially thought.

## The boxes

And finally, the we have the boxes. Let's look at the CSS:

```
.box {
  background-color: #dbe2ef;
  height: 250px;
  width: 250px;
}

.box h2 {
  color: #112d4e;
}

.box p {
  color: #3f72af;
}

.box2 {
  background-color: #3f72af;
  height: 250px;
  width: 250px;
}

.box2 h2 {
  color: #f9f7f7;
}

.box2 p {
  color: #dbe2ef;
}

.box3 {
  background-color: #112d4e;
  height: 250px;
  width: 250px;
}

.box3 h2 {
  color: #dbe2ef;
}

.box3 p {
  color: #f9f7f7;
}

```

Nothing special here. But how each box looks is important. I find that (in my view, anyway) that the first two boxes are the most eye catching. I would view box three as the default background colour and font colour, with the first two boxes on top of it.

## Wrap up

And that's the first _cool colour combo_!

Be sure to view the CodePen and edit it however you want! You may just find a theme that you were looking for!

_Until next time..._

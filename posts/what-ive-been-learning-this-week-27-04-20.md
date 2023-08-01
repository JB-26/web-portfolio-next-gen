---
title: "What I've been learning this week 📖 Regular Expressions in JavaScript"
date: "2020-04-27"
---

Welcome to the first post in a new series called 'What I've been learning this week'! Or as I call it WIBLTW, for short. These posts will go into detail what I've been learning with several examples and a explanation of what's happening etc. So let's jump in!

#Regular Expressions in JavaScript

Most recently I've been learning about Regular Expressions (or shortened to RegEx) for JavaScript. I've heard of RegEx before, but it kind of scared me a little. I always thought of it as being complex. It turns out, it's quite structured. It can become complex, if you let it become complex in the first place. I've been using the tutorials over at [freeCodeCamp](https://www.freecodecamp.org/) - which offers a great tutorial and more reading on the subject of Regular Expressions.

RegEx is used when you match parts of a string, you create patterns to achieve this. It's important to note the RegEx in JavaScript are objects.

If you want to take a look at some RegEx working in JavaScript, check out the CodePen below!

<iframe height="265" style="width: 100%;" scrolling="no" title="What I've been learning this week - 26th April - Regex!" src="https://codepen.io/JayBl/embed/NWGjXRJ?height=265&theme-id=dark&default-tab=js,result" frameborder="no" allowtransparency="true" allowfullscreen="true" loading="lazy">
  See the Pen <a href='https://codepen.io/JayBl/pen/NWGjXRJ'>What I've been learning this week - 26th April - Regex!</a> by Joshua Blewitt
  (<a href='https://codepen.io/JayBl'>@JayBl</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

##The test method

The first method is the test method. This will search for a match between the RegEx, and a string. The test method will return either true or false. Fairly simple!

But the RegEx I've defined in the CodePen is searching for 'Hello', it will return false if it finds 'hello' or 'HELLO' and so on.

You can use the OR operator (the pipe character - |) to search for multiple patterns.

##The match method

So the test method only returns either true or false. The match method extracts the string we define in the RegEx and returns an array with the pattern we defined. You can assign this result to a variable (which I have done in the CodePen example).

##Flags

It is possible to add additional flags onto the end of a RegEx pattern. Some of them are:

<ul>g; global search</ul>
<ul>i; case-insensitive search</ul>

If you see the CodePen, you'll see an example of where I've used two flags so that the RegEx is a global search and is a case-insensitive search. So it will find multiple instances of the word 'The' regardless if it's uppercase or lowercase.

##Matching letters

If for instance there are a range of patterns you need to check for similarly spelt words, you'd think you need to write a lot of RegEx patters but thankfully, there is an easier way! We can define a range of characters to check using square brackets and a hyphen to set the range of characters we want to check. You can use to iterate through the alphabet! Check the CodePen for examples on how this works!

##Matching more than one character

In the CodePen, you'll see I defined a string holding the value of 'Mississippi' - and I created a pattern to find the letter 's'. However, this will return only one, 's'. There are four 's' characters in the word Mississippi. So how do we find all the matching characters? Using the '+' character we can do this along with the global flag. This will return an array holding two elements, 'ss'. As the RegEx found the character 's' and another matching 's' next to it! 

##Zero or more instance

You can find where a pattern happens zero or more times with the '*' character. Similar result to using the '+' character.

##Matching at the beginning

What if though we are looking for a specific pattern that is only at the beginning? We can do that by using the '^' character behind the pattern.

##Matching at the end

You can search for a pattern at the end of the string by using the '$' character in front of the pattern.

##All letters and numbers

If you are happy with any letters and numbers in your pattern, you can specify that by using '\w' in your pattern.

##Match anything but letters and numbers

You can search for special characters on your pattern (useful for validating phone numbers to ensure no special characters were entered etc) by using '\W'.

##Conclusion

Regular Expressions can be very useful on web forms. So when a customer is entering their email or phone number and you want to make sure that it's valid, then Regular Expressions are a great way to do this.

I hope you've enjoyed this first post in the WIBLTW series, check back next week for the next post!

Thanks for reading! 👋




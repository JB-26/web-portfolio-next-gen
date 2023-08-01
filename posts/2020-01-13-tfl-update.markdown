---
title:  "An update to the TfL application. 🚄"
date:   '2020-01-13'
---

So a few weeks back I posted about a Transport for London (TfL) application I wrote in Python (read it [here](https://joshbl_.gitlab.io/blog/jekyll/update/2020/01/01/tfl-python.html)) and the response was amazing! As of this time of writing, the post I shared on LinkedIn has; over 1400 views and 11 reactions. It probably has been my post popular post yet! 🎉🎉🎉 Thank you to everyone who viewed the post and left a reaction to it! 👍

Since then, I noticed there was a problem with writing it in Python, people couldn't easily use it in it's current state. If you wanted to use it, you'd need your own API Keys from TfL and be able to run Python applications on your machine. It wasn't user friendly and I wanted people to use the application and provide me with feedback and suggestions.

So I thought of a way to try and get this application to a state where anyone could use it.

And the answer to that question, was to rewrite the application in a different language.

I've decided to rewrite and shift development of the application to the Go language! 💻

![Go logo](https://i.postimg.cc/T3gRCQkp/Go-Logo-Blue.png)

Now, some might be thinking, <i>why Go?</i> 🤔

Well...

- Go focuses on simplicity
- Go focuses on speed
- Go makes it easy to distribute software (this is one of the biggest reasons why I chose Go!)
- Any unused memory is freed automatically
- Fast growing community
- A popular language

So going forward, all updates made to the application will now be made in the Go version. The Python version will no longer be supported.

But if I'm going to try and get this application out in the hands of users who travel around London, it needs a name.

Obviously I'm staying away from the word 'Oyster' - I don't want to get in trouble with TfL! 😂

But what can be associated with Oyster? Fishing? Catching? Food? 🤔

I decided to settle on the name of <b>Ocean</b> 🌊

(And they both begin with the letter 'O')

So, how is the rewrite going? Very well, it's almost in a state of where I can share the executable file! 🎉 In terms of which operating systems are supported - I plan to support Windows, Linux and Mac OSX 🙌

The main thing I need to do is a lot of refactoring, clean up and adding comments to the code. I'm planning on making Ocean open source so anyone can take a look at the code, see how it works and make their own version of it if they wish.

Learning Go and building this application has been quite the challenge, but I have to say that the langauge has been growing on me. Except the mascot, I'm not a fan of the mascot I have to admit.

The main core of the application works really well, but I've had a bit of a learning curve coming from languages such as Python and Ruby. Especially with storing JSON responses in structs and interfaces (and other Go syntax).

In the future, I do plan on making a web application version and host it on Heroku, so anyone can use it! 👍

In the meantime, if you want to take a look at the code as it stands at the moment, you can find the code (so far) on my [Gitlab](https://gitlab.com/JoshBl_/go/blob/master/TfL%20App/tfl-app.go). I won't be posting the code on this blog post like I normally do, it's nearly 500 lines of code!

<b>NOTE:</b> The API keys won't be posted on the code, they will be added when I build the executable but you won't be able to see the key being used.  

Apart from this being a rewrite, Ocean does have some new features as well!

<h4>Pricing for a journey</h4>
Now when the program displays a journey you'll see the price for the journey if you took it right now and the peak and off peak prices!

![Pricing](https://i.postimg.cc/x8Q8x1FB/New-feature-1.jpg)

<h4>Detailed step description</h4>
Although being told to walk to a certain place is great, it doesn't exactly go into detail on <i>how</i> to get there. Well, it does now!

![Detailed step](https://i.postimg.cc/DybpdyK7/New-feature-2.jpg)

You can now see which direction you need to go and the distance! 🏃‍♂️

Great, now the user has more information! 👍

I know this is a short blog post, but I'm busy working on the first version of Ocean! 🌊

Check back here next week on details on how to give the first version of Ocean a spin! 👀

Thanks for reading!
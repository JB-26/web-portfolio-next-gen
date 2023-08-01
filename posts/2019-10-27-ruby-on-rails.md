---
title:  "Ruby on Rails Part 1 - Routes, Views and Controllers!"
date:   '2019-10-27'
---

So, this has been a long time coming - but yes here is my long awaited Ruby on Rails post! 🎉

The reason why this has been delayed for so long is simply that installing Rails on Windows is a challenge. In the end, I just created a VM on Amazon Web Services which runs Ubuntu.

![Ruby on Rails AWS](https://i.imgur.com/fQVmiN6.jpg)

And it is much better to manage, everything installs and works the way it should! 

Let's get started! For reference, [here](https://gitlab.com/JoshBl_/ruby_on_rails_sample_app) is the GitLab repo we are looking at today. As a guide, I used the Learn Enough course on [Rails](https://www.learnenough.com/ruby-on-rails-6th-edition).

So, as I previously mentioned, this is running on AWS [cloud9](https://aws.amazon.com/cloud9/). Free to use and sign up which is handy as I was having so much trouble getting Rails to work on Windows. Plus, I can still commit to GitLab from the VM which is great!

Before, we look at building a Rails application - let's take a step back and understand what is going on here. Let's look at the request/response cycle:

![The request/response cycle](https://i.imgur.com/eNCFtwq.jpg)

So after installing Rails on the VM (along with Yarn) - it's time to build our Rails app!

```
rails _6.0.0_ new sample_app
```

This command allows us to create a new application called 'sample_app' and we have specified the Rails version to be version 6.0.0. This will now create our Rails application.

![Our Rails app built!](https://i.imgur.com/2w9w8Eo.jpg)

At the moment though, it doesn't do very much. Let's change that!

First things first, we need to install the Gems listed in the gemfile.

```
bundle install --without production
```

This uses a flag to ensure that we are not using any production gems.

For this application, this will hold some static pages. This will make explaining Ruby on Rails easy. So - lets generate a controller with paramters of home and help.

```
rails generate controller StaticPages home help
```

With the command above; the two parameters allow us to create a controller called StaticPages with two parameters which we have defined as home and help. This controller will now have 2 actions called home and help. Which will look like this:

```
class StaticPagesController < ApplicationController
  def home
  end

  def help
  end
end
```

Wait a minute - those look like empty Ruby methods! They won't do anything! Well, looking at the request/response cycle, the Routes files will map the URL to the correct controller and action.

So lets take a look at the Routes file then.

```
Rails.application.routes.draw do
  get 'static_pages/home'
  get 'static_pages/help'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  root 'application#hello'
end
```

Ah! So, when the user enters static_pages/home (at the end of the address) as a URL address then it goes to the StaticPagesController which finds the View - which would be here:

![views for static pages](https://i.imgur.com/Q2pRsMb.jpg)

So, let take a look at the home view in a browser while Rails is running locally:

![Home for static pages](https://i.imgur.com/opO5vne.jpg)

And here is the HTML for the view:

```
<h1>Sample App</h1>
<p>
  This is the home page for the
  <a href="https://www.railstutorial.org/">Ruby on Rails Tutorial</a>
  sample application.
</p>
```

So after the view has rendered the page in HTML, this is then sent back to the controller to be sent to the browser!

Well, that makes much more sense.

But I want to see the static pages home page when the user accesses the application - but how do we do that? 🤔

To do that - we need to configure the 'root' like so:

```
Rails.application.routes.draw do
  get 'static_pages/home'
  get 'static_pages/help'
  get 'static_pages/about'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  #application#hello
  root 'static_pages#home'
end
```

So now by default, whenever someone visits the application they will see the static page home page! 👏

It's great seeing this run locally and all - but what about seeing it run in a production environment?

I've got good news, this application runs in [Heroku](https://quiet-wave-28852.herokuapp.com/)! 🎉

So if you want to see this live Rails application, click the link above!

Why not visit some of the other pages? Such as:

- static_pages/about
- static_pages/help

These are other examples of routes in action for Ruby on Rails!

![Heroku](https://i.imgur.com/un4lpm4.jpg)

Well, that's it for part 1. I hope you've enjoyed this quick look at Ruby on Rails covering the basics of the request/response cycle.

Part 2 will be up next week! 👍

Thanks for reading!
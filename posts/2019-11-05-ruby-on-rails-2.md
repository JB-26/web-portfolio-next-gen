---
title:  "Ruby on Rails Part 2 - Ah, CRUD!"
date:   '2019-11-05'
---
So, last [week](https://joshbl_.gitlab.io/blog/jekyll/update/2019/10/27/ruby-on-rails.html) was part one of Ruby on Rails (go read it before you read this part!) which explored Routes, Views and Controllers. This week, we'll take a look at CRUD - which stands for;
- <b>C</b>reate
- <b>R</b>ead
- <b>U</b>pdate
- <b>D</b>estroy

We'll be looking at a different Ruby on Rails application today. This [one](https://gitlab.com/JoshBl_/ruby_on_rails_blog) to be exact. If you want to interact with this application, you can view it hosted on Heroku [here](https://mysterious-badlands-72628.herokuapp.com/)!

This Ruby on Rails application is a simple blog - you can create, read, update and destroy articles.

So, lets jump in!

<h1>Create</h1>

First things first, we need a resource. Once we have a resource, we can start applying CRUD operations to items of a resource! Let's define a resource in the routes file.

```
Rails.application.routes.draw do
  get 'welcome/index'
  get 'articles/new'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html


  resources :articles
  
  root 'welcome#index'
end
```

Great, now we lets have a controller created called articles

```
rails generate controller Articles
```

This will generate articles_controller.rb - this is where the actions for CRUD will be defined.

Okay, lets look at creating a new article.

```
def new
end

def create
  render plain: params[:article].inspect
end
```

In these actions, we have two actions called new and create. Although the 'new' action is blank, the create action uses a method called render. This method take a hash called plain with a value of params - which is a method of its own. This is the object that represents the parameters (or fields to make things easier) coming in from the form. 

But we're not done yet - nothing is being done with the parameters themselves (article - in this case).

We need to create a model for Article and run database migration. Thankfully, Rails makes this easy to do so:

```
rails generate model Article title:string text:text
```

So, we've specified two attributes here; title with a type of string and text with a type of text. These attibutes are automatically added to the Articles database and mapped to the Article model. 

Once this command has been run, it also creates us a handy database migration file. This file is responsible for creating the database structure and once the migration has been run - it will create an articles table with a string and text column (plus a timestamp field for creation and update times).

Now lets run the migration!

```
rails db:migrate
```

So we've got a table, now let's actually save data in the controller:

```
def create
  @article = Article.new(params[:article])
 
  @article.save
  redirect_to @article
end
```

So, we're calling the save method to save the model to the database. Then, we redirect the user to a different action. This action will be called show.

<b>BUT WAIT</b>

We can't exactly save articles to the databse at the moment, why? We're not saying which parameters are allowed in the controller actions. Thankfully, if you didn't specify parameters, Rails would prevent you from saving anything to the databse. If you didn't specify any parameters, somebody could add additional fields to the request - this is called 'mass assigning'. So we need to add some parameters into the create action.

```
def create
  @article = Article.new(params.require(:article).permit(:title, :text))
 
  @article.save
  redirect_to @article
end
```

Of course though, we need a form for all of this to work:

```
<%= form_with model: @article, local: true do |form| %>
<% if @article.errors.any? %>
  <div id="error_explanation">
    <h2>
      <%= pluralize(@article.errors.count, "error") %> prohibited this article from being saved:
    </h2>
    <ul>
      <% @article.errors.full_messages.each do |msg| %>
      <li><%= msg %></li>
      <% end %>
    </ul>
  </div>
<% end %>
<p>
    <%= form.label :title %><br>
    <%= form.text_field :title %>
  </p>
 
  <p>
    <%= form.label :text %><br>
    <%= form.text_area :text %>
  </p>
 
  <p>
    <%= form.submit %>
  </p>
<% end %>

<%= link_to 'Back', articles_path %>
```

We refer to ':article' as a symbol - which tells the form builder what the form is for. This will create two labels, two text fields and a button.

With this in place, you can now create articles and save them to the database! 🎉

<h1>Read</h1>
So we can create articles, but we can't show them. Let's fix that!

In the articles controller, let's add some new actions!

```
def index
  @articles = Article.all
end
  
def show
  @article = Article.find(params[:id])
end
```

So, let's talk about the index action; this is used in the index HTML page:

```
<h1>Listing articles</h1>
 
<%= link_to 'New article', new_article_path %>
 
<table>
  <tr>
    <th>Title</th>
    <th>Text</th>
    <th></th>
  </tr>
 
  <% @articles.each do |article| %>
    <tr>
      <td><%= article.title %></td>
      <td><%= article.text %></td>
      <td><%= link_to 'Show', article_path(article) %></td>
      <td><%= link_to 'Edit', edit_article_path(article) %></td>
      <!--we pass the named route as the second argument, then the options as another argument -->
      <td><%= link_to 'Destroy', article_path(article),
              method: :delete,
              data: { confirm: 'Are you sure?' } %></td>
    </tr>
  <% end %>
</table>
```

So there is an each statement which will show the title, text and links for actions (such as Show, Edit, Destroy).

And then there is the show action; this is used in the show HTML page:

```
<h1>Show Articles</h1>
<p>
  <strong>Title:</strong>
  <%= @article.title %>
</p>
 
<p>
  <strong>Text:</strong>
  <%= @article.text %>
</p>

<%= link_to 'Edit', edit_article_path(@article) %> |
<%= link_to 'Back', articles_path %>
```

This will show a specific article, which is found from the show action where the article ID is used as an instance variable to hold a reference to the article object (where Rails will pass all instance variables to the view)

And with that, we can now view articles that are saved to our database! 🎉

<h1>Update</h1>

Now we move onto Updating articles! First, we need an edit action in the articles controller:

```
def edit
  @article = Article.find(params[:id])
end
```

So this is the same as the show action, it finds a specific article based on the ID.

Then, we need an edit view:

```
<%= form_with model: @article, local: true do |form| %>
<% if @article.errors.any? %>
  <div id="error_explanation">
    <h2>
      <%= pluralize(@article.errors.count, "error") %> prohibited this article from being saved:
    </h2>
    <ul>
      <% @article.errors.full_messages.each do |msg| %>
      <li><%= msg %></li>
      <% end %>
    </ul>
  </div>
<% end %>
<p>
    <%= form.label :title %><br>
    <%= form.text_field :title %>
  </p>
 
  <p>
    <%= form.label :text %><br>
    <%= form.text_area :text %>
  </p>
 
  <p>
    <%= form.submit %>
  </p>
<% end %>

<%= link_to 'Back', articles_path %>
```

This is the same form as we used in the create view.

Next, we need an update action. This is needed for when we need to update an article that exists:

```
def update
  @article = Article.find(params[:id])
  
  if @article.update(article_params)
    redirect_to @article
  else
    render 'edit'
  end
end
```

This action will find the article based on the ID and then we have an if statement; if the article has been updated - we'll redirect the user to viewing the article iteslf. If not, then we render the edit view to the user.

<h1>Delete</h1>

And finally, we have delete. As always, we need an action to delete:

```
def destroy
  @article = Article.find(params[:id])
  @article.destroy

  redirect_to articles_path
end
```

However, we don't need a view for this action! This is because we are redirecting to the index action. Plus, we can call destroy on Actice Record objects when we want to delete them from the database.

You can see where we link to the destroy on the index view:

```
<td><%= link_to 'Destroy', article_path(article),
method: :delete,
data: { confirm: 'Are you sure?' } %></td>
```

This will create a button called destroy, where the user can delete an article!

And that wraps up this blog entry on Ruby on Rails! I hope you enjoyed this two part series on Ruby on Rails, don't forget to visit the live application [here][here] to see the Ruby on Rails application running!

Next time, I revist TypeScript!

Thanks for reading! 👋
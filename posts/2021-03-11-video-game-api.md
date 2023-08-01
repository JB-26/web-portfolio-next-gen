---
title: "Building the Video Game API in Python and hosting it on Heroku 👨‍💻"
date: "2021-03-11"
---

##Introduction

So recently I've been learning about [Flask](https://flask.palletsprojects.com/en/1.1.x/), the web framework for Python and I decided I'd take a stab at building my own RESTful API. And as an extra challenge, I decided to see if I could host it on Heroku!

So for the API I developed 'The Video Game API'.

A free to use API where anyone can add games to a database, view games, update games, search for games and delete games from the database.

So, how can we achieve this?

Well, by using [Flask RESTful](https://flask-restful.readthedocs.io/en/latest/) we can do just that!

If you want to see the API in action, you can see it running live on [Heroku!](https://mighty-cliffs-81365.herokuapp.com/) Or if you want to take a look at the code and run it locally, you can visit the repo on GitHub [here.](https://github.com/JB-26/video-game-api) (The API might be slightly slow to respond at first, the application will go to sleep mode after a period of time)

And with that, let's get started!

##Authorisation

Most APIs will use a form of authorisation and for this, I went with [JWT](https://jwt.io/) - a compact and self contained way for transmitting data between parties as a JSON object.

There is a package for this called Flask-JWT, but the last time it was updated was in 2015. The [GitHub](https://github.com/mattupstate/flask-jwt) page for this shows that are there 30 open pull requests and 42 open issues! So not exactly the best library to use.

Thankfully, there is a package available that is up to date and maintained - [Flask-JWT-Extended](https://pypi.org/project/Flask-JWT-Extended/)

This has some good documentation to get you started and the [GitHub](https://github.com/vimalloc/flask-jwt-extended) page is active with pull requests and discussions on issues.

So we have a way to authorise our users!

##Building with Flask

Now we have a way to authorise and build a RESTful API, let's get started with building ourselves the API.

First, let's import what we need.

```
#Flask
from flask import Flask, render_template, jsonify, request

#JWT
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager

#RESTful
from flask_restful import Api

#Database
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os
```

Okay, now we can get to work.

Let's setup the Flask application and JWT

```
#creating new Flask app
app = Flask(__name__)
api = Api(app)

#set up JWT
app.config['JWT_SECRET_KEY'] = 'super-secret-key'
jwt = JWTManager(app)
```

Obviously if I was planning on this API being used more widely I'd change the secret key to something else!

Moving on we need to set up the database. The database in this project will be using [Flask SQL Alchemy](https://flask-sqlalchemy.palletsprojects.com/en/2.x/#).

```
#create database
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///'+os.path.join(basedir, 'data.sqlite')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
Migrate(app, db)
```

So we have our database, now we need to actually give the database a table.

```
#Table in DB
class VideoGame(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text)
    platform = db.Column(db.Text)
    publisher = db.Column(db.Text)
    genre = db.Column(db.Text)
    year = db.Column(db.Integer)

    #initialise object
    def __init__(self, name, platform, publisher, genre, year):
        self.name = name
        self.platform = platform
        self.publisher = publisher
        self.genre = genre
        self.year = year
    
    def __repr__(self):
        return f'Game name: {self.name}\nPlatform: {self.platform}\nPublisher: {self.publisher}\nGenre: {self.genre}\nYear: {self.year}'
    
    #returns individual game as a dictionary/json
    def json(self):
        return {'Game':{'ID: ':self.id, 'Name: ' : self.name, 'Platform: ': self.platform, 'Publisher: ': self.publisher, 'Genre: ': self.genre, 'Year': self.year}}
```

We create several columns (and if it's a text or integer) for the database and then we create an initialise method. This will allow us to create new objects and then add them to the table. Plus, there's an additional method called 'json' which returns the object in a dictionary format which will be useful when returning the result in a JSON format.

But before we begin adding and retrieving data, we still need to sort out using JWT to authorise users.

For us to authorise users, I decided to do the following:
* A user is an object of a User class
* There is a function that will check to see if the username and password match
* The users are stored in a dictionary

Let's see this in action

```
class User():
    def __init__(self, id, username, password):
        self.id = id
        self.username = username
        self.password = password
    
    def __str__(self):
        return f"User ID: {self.id}"
```

Here's our User class, nothing too special.

Let's build some users!

```
users = [User(1, 'Josh', 'mypass'), User(2, 'Lex', 'mypass')]

username_table = {u.username: u for u in users}
userid_table = {u.id: u for u in users}
```

So the users are stored in a list. Then the username and ID parameter are stored in separate dictionaries.
(Now if this was going to be an actual application, then I would store the login information in a database and use a form of encryption on the password)

Then, we have the authenticate function itself.

```
def authenticate(username, password):
    user = username_table.get(username, None)

    if user and password == user.password:
        return user
```

If there is a user and the password provided matches the password for the user, then we return the user object.

Okay, let's use this in the login endpoint!

```
@app.route("/login", methods=["POST"])
def login():
    try:
        username = request.json.get("username", None)
        password = request.json.get("password", None)

        user = authenticate(username=username, password=password)
        if user == None:
            return jsonify({"Login failed": "Bad username or password"}), 401

        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token)
    except:
        return {"Your request is invalid, are you using the correct format?": {"Format": {"username": "username", "password": "password"}}}, 400
```

If you're unfamiliar with Flask, then the route to the login endpoint is defined by using a decorator. The method is provided as well (in this case, it's POST).

So, let me break down what happens when the user submits a request to this endpoint:
* The username and password variables are populated from the JSON request
* The user object is created by using the authenticate function (which takes in the username and password as arguments)
* If the user object is None then we return a 401 with a message.
* If the user is valid, then the access token is created and returned.
* If the request isn't correct, then the API returns a 400

Good, we can now authorise a user and return a token!

Now we have that, we can start building some endpoints that require the token.

##Building endpoints

Let's start with adding a game to the database. I mean, there would be nothing in the database at the moment so we need a way for a user to add something before we can retrieve the data!

```
@app.route("/addGame", methods=["POST"])
@jwt_required()
def addGame():
    # Access the identity of the current user with get_jwt_identity
    current_user = get_jwt_identity()
    try:
        #get fields from JSON request
        name = request.json.get("name", None)
        platform = request.json.get("platform", None)
        publisher = request.json.get("publisher", None)
        genre = request.json.get("genre", None)
        year = request.json.get("year", None)

        if type(year) != int:
            return {"You have entered an invalid year, please enter a number.": {"Value entered for year": year}}, 400
    
        if name == "" or platform == "" or publisher == "" or genre == "" or year == "" or name == None or platform == None or publisher == None or genre == None or year == None:
            return {"Your request includes empty values, please try again": None}, 400

        #use values from JSON to create new object
        game = VideoGame(name=name, platform=platform, publisher=publisher, genre=genre, year=year)

        #add new object to DB
        db.session.add(game)
        db.session.commit()

        return {"The following game has been added":game.json()}, 201
    except:
        return {"Your request is invalid, are you using the correct format?": {"Format": {"name": "Game name", "platform": "Platform for game", "publisher": "Name of company", "genre": "Game genre", "year": 2000}}}, 400
```

You'll notice that we have another decoator for this function. This decorator checks to see if the user is authenticated. If the user isn't authenticated, then it returns a 401.

So first, we get the fields from the JSON request and do some checks to make sure if the year provided is an integer and if any of the values are empty or None. If any of these checks return false, then a 400 is returned.

If everything looks good, we can now create a new VideoGame object! Once we have the new object, we can add this to the database and commit the changes.

Once that's done, we return a 201 and call the 'json' method on the VideoGame object to display what game has been added to the database.

Great! Now let's look at displaying items from the database with our next endpoint.

```
@app.route("/displayGames", methods=["GET"])
@jwt_required()
def showGames():
    # Access the identity of the current user with get_jwt_identity
    current_user = get_jwt_identity()
    games = VideoGame.query.all()
    games_list = []
    for game in games:
        games_list.append(game.json())
    return jsonify({"Games": games_list})
```

So not exactly the most exciting function, but what we do is query the table and store everything in a new variables called games. Then, each game in the games variable is added to a list, called 'games_list'. You'll notice that when adding the item to the list we call the json method on the individual game. This is used so when we return a JSON response, each game can be displayed correctly.

So we can add and display, what's next? We should probably look at deleting a game from the database, so let's do that.

```
@app.route("/deleteGame", methods=["DELETE"])
@jwt_required()
def deleteGame():
    try:
        # Access the identity of the current user with get_jwt_identity
        current_user = get_jwt_identity()
        id = request.json.get("id", None)

        if type(id) != int:
            return {"You have entered an invalid id, please enter a number.": {"Value entered for id": id}}, 400

        game = VideoGame.query.filter_by(id=id).first()
        if game:
            db.session.delete(game)
            db.session.commit()
            return {'The following has been deleted': game.json()}
        else: 
            return {'No game found': None}, 404
    except:
        return {"Your request is invalid, are you using the correct format?": {"Format": {"id": 1}}}, 400
```

This is a similar approach to adding a game where there are checks to make sure the ID from the request is a integer. If it is, we can move on. If not, it returns a 400 status code.

This is where we use more of SQL Alchemy to filter the database by specifying the column and the value we want to filter by. In this case, we know that each game added is going to have a unique ID, so we'll get the first result and assign the response to a new object called game.

Using this, we hit an if statement that makes sure if the game object actually has a value. If it's None, then we'll return a 404 as the API couldn't find anything. If the object has a value, then we'll delete the entry from the database and return the details of what was deleted.

Looking good so far!

But what if we didn't want to delete a game? What if we wanted to make an edit because we made a mistake. Let's implement that!

```
@app.route("/updateGame", methods=['PUT'])
@jwt_required()
def updateGame():
    try:
        # Access the identity of the current user with get_jwt_identity
        current_user = get_jwt_identity()
        id = request.json.get("id", None)
        field = request.json.get("field", None)
        value = request.json.get("value", None)

        if id == None or field == None or field == "" or value == None or value == "":
            return {"Your request includes empty values, please try again": None}, 400
        
        if type(id) != int:
            return {"You have entered an invalid id, please enter a number.": {"Value entered for id": id}}, 400
        
        if field == "name":
            game = VideoGame.query.get(id)
            if game == None:
                return {'No game found': None}, 404
            game.name = value
            db.session.add(game)
            db.session.commit()
            return {"Game updated:": game.json(), "Value updated": field}, 200
        
        elif field == "platform":
            game = VideoGame.query.get(id)
            if game == None:
                return {'No game found': None}, 404
            game.platform = value
            db.session.add(game)
            db.session.commit()
            return {"Game updated:": game.json(), "Value updated": field}, 200

        elif field == "publisher":
            game = VideoGame.query.get(id)
            if game == None:
                return {'No game found': None}, 404
            game.publisher = value
            db.session.add(game)
            db.session.commit()
            return {"Game updated:": game.json(), "Value updated": field}, 200

        elif field == "genre":
            game = VideoGame.query.get(id)
            if game == None:
                return {'No game found': None}, 404
            game.genre = value
            db.session.add(game)
            db.session.commit()
            return {"Game updated:": game.json(), "Value updated": field}, 200
        
        elif field == "year":
            game = VideoGame.query.get(id)
            if game == None:
                return {'No game found': None}, 404
            game.year = value
            db.session.add(game)
            db.session.commit()
            return {"Game updated:": game.json(), "Value updated": field}, 200
        
        else:
            return {"Invalid field entered": field}, 400
    except:
        return {"Your request is invalid, are you using the correct format?": {"Format": {"id": 1, "field": "name", "value": "Super Mario 64"}}}, 400
```

So this looks like a big function! But thankfully, it's not too hard to understand.

Similar to what we've done before, we check the request to make sure everything is correct. Then we move onto the if/else statement.

This statement checks if the value entered for the field parameter in the JSON request is correct. We do this to make sure that the API updates the correct parameter on the specified game. If there is a match, it takes the value against the appropriate column and updates it. If the specified field was incorrect, then a 400 is returned.

There is one last problem. Although we can display ALL games in the database, what if there are hundreds or thousands of games in the database? The JSON response would be huge and it isn't helpful if you're looking for a single game. That's not good for a user!

So let's make a new endpoint for searching games in the database.

```
@app.route("/findGame", methods=["GET"])
@jwt_required()
def findGame():
    try:
        # Access the identity of the current user with get_jwt_identity
        current_user = get_jwt_identity()
        name = request.json.get("name", None)
        if name == None or name == "":
            return {"Your request includes empty values, please try again": None}, 400
        #creating search query with wild card each side
        search = "%{}%".format(name)
        games = VideoGame.query.filter(VideoGame.name.like(search)).all()
        games_list = []
        for game in games:
                games_list.append(game.json())
        if len(games_list) > 0:
            return jsonify({"Games": games_list})
        else:
            return {"No games were found for the search term": name},404
    except:
        return {"Your request is invalid, are you using the correct format?": {"Format": {"name": "Game name"}}}, 400
```

Okay, so this is where things get a little *tricky.*

Originally, I spent time trying to find a way of using the 'like' clause from SQL. Even then, whatever I put in didn't return anything unless I entered the exact game name I was looking for. This isn't great if a user only entered part of a game name.

That's where I saw on [StackOverflow](https://stackoverflow.com/questions/3325467/sqlalchemy-equivalent-to-sql-like-statement) a solution to the problem.

We create a new variable called search and format it with '%' around it. Forming a wild card statement. So, using this and the 'like' statement brings back multiple games that partially match the query from the user!

Great! Looks like the API is done!

One last thing to do is to build a webpage for it with instructions on how to use the API.

```
@app.route('/')
def index():
    return render_template('index.html')
```

I won't go into too much detail on the HTML page here, but it uses [Bootstrap](https://getbootstrap.com/) for the front end.

Before we can spin it up and try it out we need to build the database itself. We do this by using the following commands in the terminal (while in the root directory of the application).

```
flask db init
flask db migrate -m 'First migrate'
flask db upgrade
```

With these commands, the SQL database will be created!

Now we can try it out! To test the API, I used [Postman](https://www.postman.com/) to build requests and send them to the API.

Everything looks good so far. Now we need to deploy it Heroku!

##Deploying to Heroku

This is the final step! We can now deploy to [Heroku](https://www.heroku.com/home), a cloud application platform. We can host applications for free so we'll host the application here.

Before we begin the deployment process, we need to add a Procfile with the following:

```
web: gunicorn app:app
```
So what's happening here?

We're specifying that our Python application will use [gunicorn](https://gunicorn.org/) - a HTTP server which can run any Python application concurrently. Heroku suggests using this.

Next we need to export the packages installed on our Python environment with the following:

```
pip freeze > requirements.txt
```

With this, our application will know which packages to install.

Now we're ready to deploy! We'll use the Heroku CLI to create and deploy with the following steps (while in the root directory of the application):

```
heroku create
git push heroku master
```

The first command creates the application that we'll deploy to (if you have git repo already you'll notice that a new remote will be added) and the second command pushes the code to the application at Heroku.

Once everything's all done, we can now see our application running!

I sent some requests over to it with Postman to verify if everything was working and the application works as intended - and it does!

And that's it! That's our application in Heroku!

##The future?

I plan on developing this a bit more and add some more functionality. But maybe possibly having this launch as an actual API where people can sign up for an account and start adding games is something I could look at in the near future.

Thanks for reading! 👏
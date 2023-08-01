---
title: "Partying with HTTParty in Ruby 💎"
date: "2021-04-05"
---

##Introduction

Last month, I talked about creating the [Video Game API](https://joshblewitt.dev/blog/2021-03-11-video-game-api/) which is hosted on Heroku. This time, I decided to create a CLI application written in Ruby to communicate to it!

You can find the code hosted on GitHub [here](https://github.com/JB-26/ruby-HTTParty-video-game-api).

But first let's take a look at how making a HTTP request would look like using Ruby. This is for logging in:

```
url = URI("https://mighty-cliffs-81365.herokuapp.com//login")

https = Net::HTTP.new(url.host, url.port)
https.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Content-Type"] = "application/json"
request.body = "{\r\n    \"username\": \"Josh\",\r\n    \"password\": \"mypass\"\r\n}"

response = https.request(request)
puts response.read_body
```

And then for displaying all the games in the database:

```
url = URI("https://mighty-cliffs-81365.herokuapp.com//displayGames")

https = Net::HTTP.new(url.host, url.port)
https.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Authorization"] = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTYxNzU1OTE5OSwianRpIjoiYWQ3MDQ3OWEtNWQxOC00MWYxLWI3M2MtZDQ1NGRjMjZkMzFiIiwibmJmIjoxNjE3NTU5MTk5LCJ0eXBlIjoiYWNjZXNzIiwic3ViIjoiSm9zaCIsImV4cCI6MTYxNzU2MDA5OX0.zkQFBFSRnh2eU04D26AUhlWZXjggztZI9_Nri89eOTk"

response = https.request(request)
puts response.read_body
```

This is already a lot of work and this is just two endpoints! Trying to manage this for five different endpoints is going to be a pain.

What if there was another way?

Thankfully, there is!

There is the Ruby Gem, [HTTParty](https://rubygems.org/gems/httparty).

HTTParty is described as:

> Makes http fun again! Ain't no party like a httparty, because a httparty don't stop.

Let's take a look at the requirements for using this Gem!

> - Ruby 2.0.0 or higher<br>
> - multi_xml<br>
> - You like to party!

###Time to partayyyyyy

There are two ways to approach the task of creating a CLI application with HTTParty. I could either create a variable and use class methods from HTTParty to get the job done or create my own class.

As the Video Game API has multiple endpoints and authorisation via a Bearer token, I decided to create my own class.

As part of the initialise method for the class, I decided it would be good to go ahead and call the login endpoint and store the token in a class variable (as we'll be needing this to actually make requests to other endpoints)

```
def initialize(username, password)
    @login = {username: username, password: password}.to_json
    #parse response into a hash
    @token = self.class.post('https://mighty-cliffs-81365.herokuapp.com/login', body: @login, :headers => {'Content-Type' => 'application/json'}).parsed_response
    puts "Logged in! Token is: #{@token['access_token']}"
end
```
I've also included a small message displaying the key once the authentication is done.

The token itself is stored as a hash, as I'm using the built in method from HTTParty called 'parsed_response'.

With the token stored, we can now begin acessing the rest of the API. We'll start with displaying games.

###Displaying games

Alright, let's define another method in the class for displaying games!

```
def displayGames
    #parse response into a hash
    gamesList = self.class.get("https://mighty-cliffs-81365.herokuapp.com/displayGames", :headers => {'Authorization' => "Bearer #{@token['access_token']}"}).parsed_response
    #check if the hash is empty
    if gamesList.empty?
        puts "There are no games in the database!"
    else
        #print each game
        for game in gamesList['Games'] do
            puts "Name: #{game['Game']['Name: ']}\nGenre: #{game['Game']['Genre: ']}\nPlatform: #{game['Game']['Platform: ']}\nPublisher: #{game['Game']['Publisher: ']}\nYear: #{game['Game']['Year']}\n\n"
        end
    end
end
```

This is where HTTParty really begins to shine. Remember how I demonstrated above by making a request using the built in Ruby methods? With HTTParty, the response is stored and parsed into a hash on a single line which calls the API. With the response stored as a variable, we can iterate through it and display the games to the user!

I put a small check to ensure that the hash isn't empty, makes the experience better for the user. If the hash is populated, a for loop is used to iterate through each game.

Okay, onto the next endpoint!

###Finding a game

Next up, we have finding a game. This relies on a user entering a serch term and see if there are any matches!

Let's take a look at how this method looks

```
def findAGame
    puts "Please enter a search term"
    search = gets.chomp
    puts "You have entered #{search}"

    request = {name: search}.to_json

    response = self.class.get("https://mighty-cliffs-81365.herokuapp.com/findGame", :headers => {'Authorization' => "Bearer #{@token['access_token']}", 'Content-Type' => 'application/json'}, body: request)
    #parse response into a hash
    responseHash = response.parsed_response

    #check if the response is empty
    if response.code == 200
        puts "Search results:"
        for game in responseHash['Games'] do
            puts "Name: #{game['Game']['Name: ']}\nGenre: #{game['Game']['Genre: ']}\nPlatform: #{game['Game']['Platform: ']}\nPublisher: #{game['Game']['Publisher: ']}\nYear: #{game['Game']['Year']}\n\n"
        end
    else
        puts "Couldn't find a game with the term of #{search}!"
    end
end
```

This is where things get slightly more complex with the request (and slightly tripped me up!)

At first, I was having some trouble with getting this request to work. Everytime I sent a request, it bounced back with an error message from the API. But why? Everything seemed okay, the request was in the correct format. So running the API locally and firing the request I soon discovered what was wrong; the content type wasn't in the correct format.

So after reading through the documentation and examples, I discovered that I needed to add the content-type to the request.

At this stage, I knew that if the search term couldn't find anything, it would return a 404. So I decided to store the response (as a hash) in a separate variable and leave the response variable alone so I could access the status code. This status code is used in an if statement to make sure that if the code is 200, then it will iterate through the results in the hash and display them. If not, then a message telling the user that no games could be be found is displayed.

Looking good!

###Updating a game

Next up, we have being able to update something in the database:

```
def updateGane
    puts "Enter the ID of the game you want to update"
    id = gets.chomp.to_i
    puts "Enter the field you wish to update (i.e. name, genre)"
    field = gets.chomp.downcase
    puts "Enter the value"
    value = gets.chomp
    puts "You have entered...\nID: #{id}\nField #{field}\nValue: #{value}"

    request = {id: id, field: field, value: value}.to_json

    response = self.class.put("https://mighty-cliffs-81365.herokuapp.com/updateGame", :headers => {'Authorization' => "Bearer #{@token['access_token']}", 'Content-Type' => 'application/json'}, body: request)

    if response.code == 200
        puts "Updated the following:\nName: #{response['Game updated:']['Game']['Name: ']}\nGenre: #{response['Game updated:']['Game']['Genre: ']}\nPlatform: #{response['Game updated:']['Game']['Platform: ']}\nPublisher: #{response['Game updated:']['Game']['Publisher: ']}\nYear: #{response['Game updated:']['Game']['Year']}"
    else
        puts "Failed to update game"
    end
end
```

Similar to finding a game, the response code is used to determine the response from the if statement. If it was 200 then the details of the updated game are returned, else a message saying that the game could not be updated is displayed.

One thing that did trip me up *slightly* is referring to the field from the response. In my first attempt, I wasn't adding a space after the name of the field - turns out that it was needed as I defined it to have a space, do'h! 🤦‍♂️

Moving on...

###Deleting a game

Next we have the functionality of deleting a game.

Let's take a look!

```
def deleteGame
    puts "Enter the ID of the game you want to delete"
    id = gets.chomp.to_i

    request = {id:id}.to_json

    #parse response into a hash
    response = self.class.delete("https://mighty-cliffs-81365.herokuapp.com/deleteGame", :headers => {'Authorization' => "Bearer #{@token['access_token']}", 'Content-Type' => 'application/json'}, body: request)
    parsedResponse = response.parsed_response
        
    #check if the response is empty
    if response.code == 200
        puts "The following game has been deleted:\nName: #{parsedResponse['The following has been deleted']['Game']['Name: ']}\nGenre: #{parsedResponse['The following has been deleted']['Game']['Genre: ']}\nPlatform: #{parsedResponse['The following has been deleted']['Game']['Platform: ']}\nPublisher: #{parsedResponse['The following has been deleted']['Game']['Publisher: ']}\nYear: #{parsedResponse['The following has been deleted']['Game']['Year']}"
    else
        puts "No game was found with the ID of #{id}!"
    end
end
```

This is very similar to updating a game; if there is a game that can be deleted - return the details of the deleted game. If not, return a message that no game of the specified ID could be found.

Next up, we have the last endpoint!

###Add a game

Finally, we have the functionality of adding a game to the database.

Let's take a look!

```
def addGame
    puts "Enter the name of the game you want to add"
    name = gets.chomp
    puts "Enter the platform"
    platform = gets.chomp
    puts "Enter the publisher"
    publisher = gets.chomp
    puts "Enter the genre"
    genre = gets.chomp
    puts "Enter the year of release"
    year = gets.chomp.to_i

    request = {name: name, platform: platform, publisher: publisher, genre:genre, year:year}.to_json

    response = self.class.post("https://mighty-cliffs-81365.herokuapp.com/addGame", :headers => {'Authorization' => "Bearer #{@token['access_token']}", 'Content-Type' => 'application/json'}, body: request)

    if response.code == 201
        puts "Game added!"
    else
        puts "Failed to add a game to the database!"
    end
end
```

One of the longer methods for this class, mostly because it asks for a lot of input from the user.

Once we've built the request, we send a post request!

If the response is a 201, then a message is displayed that the game was added to the database. Else, a message is displayed that the game could not be added to the database.

###The main method

This is a CLI so there needs to be a way for the user to interact with it! This is where the main method comes into play.

Let's take a look!

```
def main(videoGameApi)
    while true
        puts "Welcome to the Video Game API CLI tool in Ruby! Please choose an option!"
        puts "1) Display Games\n2) Find a game\n3) Update a game\n4) Delete a game\n5) Add a game\n6) Quit"
        choice = gets.chomp.to_i

        case choice
        when 1
            videoGameApi.displayGames
        when 2
            videoGameApi.findAGame
        when 3
            videoGameApi.updateGane
        when 4
            videoGameApi.deleteGame
        when 5
            videoGameApi.addGame
        when 6
            puts "Goodbye!"
            break
        else
            puts "I don't understand that! Please try again!"
        end
    end
end
```

Probably not the most exciting method ever but it gets the job done by using a case statement in a while loop.

And now to run the program!

```
puts "Now logging in, please wait...."
puts "NOTE: This application is hosted on Heroku. If this is the first call, it might take some time to retrieve a response."
#create object
videoGameApi = VideoGameAPI.new("Josh", "mypass")
#run main
main(videoGameApi)
```

And that's it! We have our CLI tool to communicate with the Video Game API in Ruby using the HTTParty Gem!

As always, be sure to check out the code on GitHub! I've included a Gemfile for the HTTParty Gem so you can use Bundler against it.

Thanks for reading! 👏
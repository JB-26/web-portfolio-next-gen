---
title:  "Using the Twitter API on Ruby with a Ruby Gem!"
date:   '2019-09-16'
---
So recently I've been expanding on my Ruby knowledge and there are two areas I've been wanting to focus on.
- Gems
- Making HTTP Requests

And today, I'll be (partially) achieving both of those goals today, as this post will be about calling the Twitter API using a Ruby Gem! 🎉

So, after my Twitter developer account got approved (I still think that writing at least 200 words just to get approved is silly), I created my application, generated my keys and got to work researching ways to make HTTP requests in Ruby. My research initially lead me to the documentation for [NET:HTTP](https://ruby-doc.org/stdlib-2.6.4/libdoc/net/http/rdoc/Net/HTTP.html). But sadly, calling the Twitter API was going to be a bit more complex then I originally thought. I needed to create a client that used the API keys generated on my application on Twitter's devleoper site.

After doing more research into using Ruby to call the Twitter API specifically, I discovered a Ruby Gem called [twitter](https://rubygems.org/gems/twitter). After looking at the [documentation](https://rdoc.info/gems/twitter), this seemed like the perfect solution!

Of course, the code for this project can be found [here](https://gitlab.com/JoshBl_/twitter-on-ruby). (<b>Note:</b> you may notice that the keys are missing from the solution, you'll need to add your own if you want the application to work!)

So, let's get to work.

First things first, lets import the twitter ruby gem.

```
#require specific gems
require 'twitter'
```

And then configure our client with our API keys from Twitter:

```
#configuring twitter api
client = Twitter::REST::Client.new do |config|
config.consumer_key = ''
config.consumer_secret = ''
end
```

Let's make a working proof of concept first, just to make sure that the client has been configured properly.

```
puts "\nLet's take a look at some recent tweets from a user!"
tweets = client.user_timeline('_ItsJayB_', count: 10)
puts tweets
```

Cool, so this should print the last 10 tweets from my twitter account!

Right?

```
Let's take a look at some recent tweets from a user!
#<Twitter::Tweet:0x0000000006697458>
#<Twitter::Tweet:0x0000000006697430>
#<Twitter::Tweet:0x0000000006697408>
#<Twitter::Tweet:0x00000000066973e0>
#<Twitter::Tweet:0x00000000066973b8>
#<Twitter::Tweet:0x0000000006697390>
#<Twitter::Tweet:0x0000000006697368>
#<Twitter::Tweet:0x0000000006697340>
#<Twitter::Tweet:0x0000000006697318>
#<Twitter::Tweet:0x00000000066972f0>
```

Well, that doesn't look right. At least it's pulling data though!

But why is it displaying a key value pair and not the actual context of each tweet? 🐱‍💻

Well, we need to look at the methods included with this gem. More specifically, the 'each' method.

So after looking into the 'tweet' identity in the documentation (and for 'full_text') and some research online, we need to iterate through each tweet.

Like so:

```
tweets.each { |tweet| puts tweet.full_text }
```

Which would then give us...

```
Let's take a look at some recent tweets from a user!
RT @ColorPrinter_: Jeff Gerstmann tells you you're wrong for 22 seconds https://t.co/PBE7SO8ehO
RT @BBCArchive: #OnThisDay 1995: Windows 95 was released. https://t.co/AZWcK9p40Y
Been spending some time developing a small currency conversion application. Now, I've reworked it to call an API! F… https://t.co/7sHCIUL9aI
Glad that the @harrys code from the @CAGcast worked in the UK! Thanks @CheapyD, @NewWombat and @Shipwreck! �👏
Pretty amazed that I've made my own website - and hosted it too! �👏 https://t.co/CpUEzLatyr
Hey @UNIQLO_UK - are there any plans to open a store in Milton Keynes? �🤔
@polymegaHQ Thanks! �👏
Any updates on this @polymegaHQ ? https://t.co/uCTlXJUEMY
I've gone live On Twitch and Mixer with @MTG_Arena - come hang out! The London Mulligan!
https://t.co/ROpqyHWJSU… https://t.co/pEB0UE472s
@mashd @Twitch @wizards_magic @MTG_Arena That’s Magic!
```

Great - we're getting somewhere!

Viewing tweets for a user is great and all, but what about seeing tweets using a specific phrase being sent to the account from other twitter users?

Well, turns out - there's something for that too.

```
client.search("to:#{twitterAccount} #{phrase}", :count => 1, :result_type => "recent").take(5).each do |tweet|
puts tweet.text
```

So, we specify the account and the phrase. Then, using 'count' we state how many tweets per page we want to display (the max value is 100), then state what type of search results we want with 'result_type' (set to recent) and finally, we have a take method. The take method returns a specified number of elements (or tweets in this case) from an array. In this case, for each tweet it finds, it prints it to the screen.

Here's an example of what we would see in the console:

```
@NintendoUK Nope! But I can’t wait to finally play through a classic Zelda game that I have somehow missed over the… https://t.co/32ynOfpkGh
@NintendoUK I cannot wait 3 days away untill this game comes out for the switch looks amazing I will be behind my Z… https://t.co/nArzhmn3Eh
@NintendoUK If only there was something to speed the time up with Zelda links 
awekening
@NintendoUK Tbh, zelda BOTW was my favourite game on the switch, wonder if this will take its place? �🤔
@NintendoUK Isn’t there a song of Times or something like that from zelda. ��
https://t.co/yhhSvQaWJI
```

Finally, we move onto something that I wanted to try and do - streaming tweets in real time.

Thankfully, there was some documetation for streaming tweets using the Ruby Gem.

First of all, we need to create a new client. This client however will be a Streaming client as opposed to a REST client

```
client = Twitter::Streaming::Client.new do |config|
        config.consumer_key        = ''
        config.consumer_secret     = ''
        config.access_token        = ''
        config.access_token_secret = ''
        end
```

After we have a client, let's pick a topic and stream in relation to the specified topic

```
puts "Please enter a topic you wish to stream tweets about. Please note that this will stream tweets in real time!"
#get user choice for topic
topic = gets.chomp
client.filter(track: topic) do |object|
puts object.text if object.is_a?(Twitter::Tweet)
end
```

So after the user states what topic they want to see tweets for, this is passed to the track options hash which is part of the filter class. Then it prints to the screen every tweet it finds.

Alright, lets put all this into an application which somebody could use!

First, let's define a class which will store all the methods we need for this. (I'll update my C# currency application with classes and methods I promise!)

```
#require specific gems
require 'twitter'

#define class - remember, the class name should always start with a capital letter
class TwitterConfig
    #attribute reader
    attr_reader :twitterAccount
    #initialise class - used for configuring 
    def initialize (twitterAccount)
        @twitterAccount = twitterAccount
    end
    
    public
    def printName
        #confirming the name of the twitter account set to
        puts "Account set to - #{twitterAccount}"
    end

    public
    def viewTweets
        puts "How many tweets from the user - #{twitterAccount} - do you want to view?"
        number = gets.chomp
        #configuring twitter config
        client = Twitter::REST::Client.new do |config|
        config.consumer_key = ''
        config.consumer_secret = ''
        end
        puts "\nLet's take a look at some recent tweets from a user!"
        #uses the user_timeline method to find the account, count is returning the number of tweets
        tweets = client.user_timeline(twitterAccount, count: number)
        tweets.each { |tweet| puts tweet.full_text }
    end

    public
    def phraseTweets
        puts "Please enter the phrase you want to see tweets for from users!"
        phrase = gets.chomp
        puts "How many tweets do you want to see?"
        num = gets.chomp.to_i
        #configuring twitter config
        client = Twitter::REST::Client.new do |config|
        config.consumer_key = ''
        config.consumer_secret = ''
        end
        #searching tweets from a user with a specific phrase most recent displayed
        #for each tweet it finds, display it to the screen
        #count is returning the number of tweets per page - max is 100
        #result type specifies what type of search results you want
        #the take method returns specified number of elements (tweets in this case) from an array
        #And finally, there is an each method to print every tweet it finds
        client.search("to:#{twitterAccount} #{phrase}", :count => 1, :result_type => "recent").take(num).each do |tweet|
        puts tweet.text
        end
    end

    public
    def streamTweets
        #configuring a new streaming client with relevant keys
        client = Twitter::Streaming::Client.new do |config|
        config.consumer_key        = ''
        config.consumer_secret     = ''
        config.access_token        = ''
        config.access_token_secret = ''
        end
        puts "Please enter a topic you wish to stream tweets about. Please note that this will stream tweets in real time!"
        #get user choice for topic
        topic = gets.chomp
        #for every tweet it finds, print to the screen
        #pass the topic variable to the track options hash (part of the filter method)
        client.filter(track: topic) do |object|
        #prints the tweet if the object is a tweet (from the Twitter class)
        puts object.text if object.is_a?(Twitter::Tweet)
        end
    end
end
```

Okay good, we've got public methods so they can be accessed outside of the class.

Now let's make an instance of this class.

```
puts "Welcome to Twitter on Ruby!"
puts "Please state the twitter user name you wish to view tweets for. Make sure that the account name is correct!"
userName = gets.chomp
#creates a new instance of the TwitterConfig class
twitterSet = TwitterConfig.new(userName)
#calls the method to print the username the user chose
twitterSet.printName
```

So after we declare a new instance of the class, I call the method 'printName' - just to make sure that the username was set.

So, once again - it's time to do another while loop with a boolean variable...

```
#boolean declared - set to true
check = true

#while loop to ensure that the program loops.
while check == true
    puts "Please pick a menu choice by typing the letter in brackets!"
    puts "(V)iew tweets from a user"
    puts "(F)ind tweets with a specific phrase"
    puts "(S)tream Tweets"
    puts "(Q)uit"
    #get user choice and convert it to upper case
    userChoice = gets.chomp.upcase
    case userChoice
    when 'V'
        twitterSet.viewTweets
    when 'F'
        twitterSet.phraseTweets
    when 'S'
        twitterSet.streamTweets
    when 'Q'
        puts "Quit"
        #sets the boolean value to false and exits the program
        check = false
    #if a user enters a command that isn't valid - run this!
    else
        puts "Invalid command - try again!"
    end
end
```

So inside the while loop (while the boolean is true), there is a case statement which will run a method depending on which key is pressed. The character is converted to uppercase as well so if the user enters a lowercase 'v' for example, the choice for 'V' will be hit. The 'else' statement is there to catch any other character the user inputs.

It's interesting streaming tweets to the console in real time and it was a fun challenge to tackle. Plus, I got experience with researching gems and reading documentation to solve the problem. I plan to recreate my C# program using [NET:HTTP](https://ruby-doc.org/stdlib-2.6.4/libdoc/net/http/rdoc/Net/HTTP.html) so I can become more confident with performing HTTP requests to API's.

I plan to come back to this in the future so I can additional functionality, such as writing tweets to a file.

Thanks for reading!
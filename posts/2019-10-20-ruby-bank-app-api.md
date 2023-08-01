---
title:  "Ruby Bank Application (rewrite of my C# project)"
date:   '2019-10-20'
---

So, a bit late on this post. In fact, it's my birthday today! So to celebrate, lets talk about another ruby project!

I know I was going to talk about TypeScript, but instead for this quick post, I've got a ruby project to share with you.

So, this is actually using the same API I used in my C# project. You can think of it as a rewrite in a different language.

For reference, [here](https://gitlab.com/JoshBl_/ruby-money-swap) is the repo for the project I am referring to in this post.

I found that writing this project was much more enjoyable than writing it in C#. I found that it was much easier to manage and to read as opposed to C#. This does go with the main core concepts of the Ruby language.
Plus, the Ruby application has less lines of code compared to the C# application.

Anyway, let's take a look at some key areas.

```
#error catching when performing get request
    begin
        #integer for counting currencies
        currencyCount = 0
        #output of get request stored in a variable to deserialise JSON
        jsonString = Net::HTTP.get(URI.parse('https://api.exchangeratesapi.io/latest?base=' + base))
        jsonString = JSON.parse(jsonString)['rates'].each do |currency, rate|
            currencyCount += 1
        end
    rescue StandardError => e
        #code to handle errors
        #logging the error to the console
        puts "Error! Info: #{e.message}"
        puts "Please try again!"
    else
        #if no errors, run this code
        puts "Complete! #{currencyCount} currencies have been loaded."
        #boolean set to false to end loop
        loadCheck = false
    end
```

So, calling the API and storing the results in a format which Ruby can understand is so much easier. With the [JSON](https://ruby-doc.org/stdlib-2.6.5/libdoc/json/rdoc/JSON.html) module, parsing the information to a hash is useful as this avoids the use of a disctionary.
Also, the use of the [NET:HTTP](https://ruby-doc.org/stdlib-2.6.4/libdoc/net/http/rdoc/Net/HTTP.html) class makes performing a get request simpler to do - as this is done on a single line.

There is also the use of the begin, rescue and else statements. Think of this as the Ruby equivalent of a Try/Catch statement in C#.

Moving on, let's take a look at some other methods:

```
def viewRates(jsonObject, base)
    puts "Viewing rates for #{base}"
    #iterates through the hash and prints each key and value
    jsonObject.each do |currency, rate|
        puts "#{currency} - #{rate}"
    end
    puts "Press enter to back to the menu"
    gets.chomp
end
```

Quite similar to the C# project, this method iterates through the hash and prints each currency and rate to the screen.

Next!

```
def printRates(jsonObject, base)
    #boolean variable
    writeFile = true
    #while loop to ensure that the user enters a valid location to write a text file
    while writeFile == true
        puts "Please specify where you want to write the file 'currencyRates.txt' to."
        #gets file path from user
        location = gets.chomp
        puts "Writing file, please wait..."
        begin
            #storing the current date and time in a variable
            date = DateTime.now
            #target variable holds information of where to write the file to, the 'w' argument means write new file
            target = open("#{location}" + '\\currencyRates.txt', "w")
            #calling the write method to write date/time and base currency information
            target.write("Currency exchange rate for #{base} - at #{date}\n")
            #iterates through the hash and for each key/value pair - write it to the file
            jsonObject.each {|key, value| target.write("#{key} - #{value}\n")}
            #close the file
            target.close
        #rescue statement to catch errors 
        rescue StandardError => e
            #prints the specific error - stored in variable 'e'.
            puts "Error! Info: #{e.message}"
            puts "Please try again!"
        else
            #boolean set to false
            writeFile = false
            #print the location of where the file was written to
            puts "Complete! File is written to #{location}"
            puts "Press enter to go back to the main menu"
            gets.chomp
        end 
    end
end
```

So for writing to a [File](https://ruby-doc.org/core-2.1.4/File.html), two arguments need to be provided to the open method. The location of where the file needs to be written to and the flag for what the operation will do. In this case, 'w' was provided meaning write.
So for writing to the file, the base currency and date are at the top of the file and then there is a each statement for the hash to iterate and for every key/value pair it finds, it writes it to the file with a new line escape sequence.
A begin/rescue/else statement was added to catch any errors.

Moving on!

```
def swapMoney(jsonObject, base)
    #boolean set to true
    swapCheck = true
    #while loop to ensure that the user enters a valid integer and/or a valid currency
    while swapCheck == true
        puts "Please specify which currency you want to swap with (by typing in the three character code, such as GBP, USD or JPY)"
        choice = gets.chomp.upcase
        puts "You have selected #{choice}"
        puts "How much money (#{base}) do you want to exchange for #{choice}?"
        value = gets.chomp.to_i
        puts "Calculating how much #{choice} you will get for #{value}#{base}"
        #begin statement for calculating the cost
        begin
            #calculate the cost based on user input by multiplying the value by the requested currency
            totalValue = value * jsonObject["#{choice}"]
            #variable displays two decimals
            totalValue = '%.02f' % totalValue
        #rescue statement to catch any errors
        rescue StandardError => e
            #print any errors to the user
            puts "Error! Info: #{e.message}"
            puts "Please try again!"
        else
            #boolean set to false so loop can end
            swapCheck = false
            #confirming to the user how much money they get
            puts "You will receive #{totalValue}#{choice}"
            puts "Press enter to return to the main menu"
            gets.chomp 
        end 
    end
end
```

Well for calculating how much a user would get for their money in a different currency is not that different to what was done on the C# project.

And that's about it in terms of major differences. There is a case statement which acts as a menu but that's been covered in previous posts so I won't go into that.

Apologies for the short post on this, but next week I'll cover TypeScript!

Thanks for reading!
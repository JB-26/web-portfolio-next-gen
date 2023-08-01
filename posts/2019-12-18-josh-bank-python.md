---
title:  "Josh Bank in Python! 🐍"
date:   '2019-12-18'
---

I've recently been learning Python and it is growing on me as one of my favourite languages to work in. So in this week's blog post - I'll be talking about the new and improved, world famous, Josh Bank in Python! 🐍

If you want to take a look at the code, it can be found on my GitLab [here](https://gitlab.com/JoshBl_/python/tree/master/Josh%20Bank).

For those who are unfamiliar with Josh Bank, it uses this [api](https://exchangeratesapi.io/) to get the recent exchange rates from the European Central Bank. I find that writing Josh Bank is a good project to get to grips with learning the syntax and the behaviours of a language.

First things first, we need to make a GET request! But to do that, we need to install an additional package called [requests](https://pypi.org/project/requests/). In addition, we need to use the JSON and datetime packages as well.

```
import requests
import json
import datetime
```

With appropriate packages imported, lets get some user input for which currency they want to compare with!

```
# boolean for ensuring that a valid currency choice has been entered
check = False

while check == False:
    # take user selection and convert the string to upper
    selection = input(
        "Welcome to Josh Bank! Please enter the three character code for a currency (GBP, USD, JPY).\n> ").upper()
    #selection = selection.upper
    print(f"You have selected {selection}")
    address = "https://api.exchangeratesapi.io/latest?base=" + selection
    print(address)
    rates = requests.get(address)
    # printing the status code returned
    print(f"Status code from request is", rates.status_code)
    # print the content type of the response
    print(f"Content type is", rates.headers['content-type'])
    if rates.status_code == 400:
        print(f"Error! Please try again!")
        print(rates.content)
    if rates.status_code == 200:
        # break while loop
        check = True
```

So first, the program asks the user for a three character currency code and performs a GET request. Then, it will print some information about the request performed such as the status code and the content type of the response (which is an application/json). Then we move onto some error handling, an if statement which looks at the status code.

If the response returns 400 then the program will print an error message and the content from the response. The user will be asked to enter a three character code again (as this is in a while loop).

If the response returns 200 then the peogram will set the boolean variable check to true, which will end the loop.

Once we have content from the GET request - we need to get the content into something that can be read by Python.

```
# check the type of the rates variable
print(f"The type of variable rates is", type(rates))
# assign the response into a dictionary variable
rawData = rates.json()
print(f"The type of variable rawData is", type(rawData))
# since the data has nested objectes, a new dictionary is created consisting of just the currency rates
# a dictionary in Python is a collection which is unordered, changeable and indexed. No duplicate members are allowed.
currencyRates = rawData['rates']
print(f"The type of variable currencyRates is", type(currencyRates))
```

By using the 'type' function, I was able to determine the type of each variable. So...
- The rates variable is a 'requests.models.Response' type
- The rawData variable is a 'dict' type
- The currencyRates variable is 'dict' type

A dictionary type will be useful! So the currencyRates dictionary holds the nested object of 'rates' from the rawData dictionary (which is from the rates variable).

Now we have our currencies loaded, let's create a switch statement for the menu!

....except Python doesn't have a switch statement.

To get around this, I wrote the menu in a while loop with a if/elif statement.

```
# boolean for menu loop
menuLoop = True
while menuLoop == True:
    print("""
Main menu
Enter a character for a menu choice!
(V)iew rates
(P)rint to file
(S)wap currency
(Q)uit application""")
    # since switch statement don't exist in Python, a nested if statement is used
    menuChoice = input(">").upper()
    if menuChoice == 'V':
        # print(currencyRates)
        viewRates(currencyRates)
    elif menuChoice == 'P':
        # print currency rates to an external file
        printToFile(currencyRates)
    if menuChoice == 'S':
        # swap selected currency to another currency
        swapCurrency(currencyRates, selection)
    if menuChoice == 'Q':
        # exist the program
        menuLoop = False
    else:
        # error handling
        print("")
```

Let's take a look at the viewRates function (which takes the currencyRates dictionary as an argument):

```
# function for viewing the rates
def viewRates(currencyRates):
    print(f"Now viewing rates as of", datetime.datetime.now())
    for key in currencyRates:
        print(key, currencyRates[key])
    enter = input("Press enter to return to the main menu.")
```

This function is straight forward - for every element in the dictionary, print them! (The key/value pair that is)

Next, we have the function for printing to an external file.

```
# function for printing currency rates to a file
def printToFile(currencyRates):
    time = datetime.datetime.now()
    # formatting datetime to string format (so that it can be written to a file)
    time.strftime("%d,%m,%Y,%H,%M")
    time = str(time)
    location = input(
        "Please state where you want the currency rates to be written to. \n>")
    print(f"You have specified", location)
    print(f"Now writing CurrencyRates.txt to - {location}")
    # creating a new file, using parameter w - will create a file if the specified file doesn't exist
    # you could use x but the program will fail if the file exists in specified location
    file = open("CurrencyRates.txt", "w")
    # writing to a file only allows text format, so json.dumps takes the dictionary and serialises it to a formatted string
    # write function only allows 1 argument
    file.write(time)
    file.write("\n")
    file.write(json.dumps(currencyRates))
    file.close()
    print("Complete!")
    enter = input("Press enter to return to the main menu.")
```

This was actually a little bit more challenging than I previously thought, one of which is that the write function only accepts the text format. So I couldn't use the dictionary in it's current state. I'd need to convert the contents to a string - but how? Well, by using [json.dumps](https://docs.python.org/3.5/library/json.html#json.dumps) takes the dictionary and serialises it to a formatted string. That solves that!

I also wanted to print the current date as well - but again, write will only allow the text format. To get around that I used [time.strftime](https://docs.python.org/3.5/library/time.html?highlight=time%20strftime#time.strftime) to format the current time to a string. I added the directives to print; the day, the month, the year, the hour and the minute.

Before we start writing to a file, we need to open one or create one if it doesn't exist. That's why I use the parameter 'w' under opening a file. If the file doesn't exist, then Python will create it.

When it comes to writing content to the file, the write function only allows 1 argument, so I have to type out the write function multiple times. 🤦‍♂️

When all is said and done, we close it. Great! Now what does the file look like?

```
2019-12-16 18:26:32.823558
{"CAD": 1.7528022538, "HKD": 10.4125157346, "ISK": 163.9992807049, "PHP": 67.6389138644, "DKK": 8.9589402386, "HUF": 394.4254630462, "CZK": 30.5496613319, "GBP": 1.0, "RON": 5.7293052808, "SEK": 12.4933165498, "IDR": 18713.6246478451, "INR": 94.8346220704, "BRL": 5.453575496, "RUB": 83.7159983216, "HRK": 8.9193790086, "JPY": 146.2207037104, "THB": 40.3872205239, "CHF": 1.3130731883, "EUR": 1.1988251514, "MYR": 5.5346160762, "BGN": 2.344662231, "TRY": 7.8151411617, "CNY": 9.3538332434, "NOK": 12.0218186178, "NZD": 2.0210993227, "ZAR": 19.3376491039, "USD": 1.3362105137, "MXN": 25.417730624, "SGD": 1.8097464485, "AUD": 1.9393394473, "ILS": 4.6660672541, "KRW": 1564.071210214, "PLN": 5.1138284481}
```

Looks good! 👏

Our final function, is for swapping currency:

```
# function for swapping currency
def swapCurrency(currencyRates, selection):
    choice = input(f"Please enter the three character code of the currency you want to swap to.\nYou are currently looking at exchange rates for {selection}\n>").upper()
    print(f"You have selected {choice}")
    # try/except block to catch errors
    try:
        # accessing specific element in dictionary
        print(f"{choice} -", currencyRates[choice])
        print(f"The type of the currencyRates[choice] variable is", type(currencyRates[choice]))
        value = input(f"Please enter how much {selection} you would like to convert to {choice}\n>")
        value = float(value)
        print(f"The type of the value variable is,", type(value))
        calculation = value * currencyRates[choice]
        print(f"For {value} {selection} - you will receieve {calculation} {choice}")
        enter = input("Press enter to return to the main menu.")
    except:
        retry = input("An error occurred! Press enter to return to the main menu!")
```

One of the first things that you might notice here is the use of try and except. This is very similar to a try/catch statement in C#. It's designed to catch errors in case anything goes wrong.

The user's choice is then searched in the dictionary, when the value for said choice would be located.

Since the values in the dictionary are floats, the value the user enters for how much they want to convert is converted into a float from an int, so the calculation can take place.

This program is still very much in development, I need to add a try and except statement to printing a file for example.

I've enjoyed writing JoshBank in Python, the language itself is growing on me as one of my favourites.

Be sure to check back here next week for another post! 👏

Thanks for reading!
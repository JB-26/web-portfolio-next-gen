---
title:  "Builidng an interactive Transport for London app in Python! 🐍"
date:   '2020-01-01'
---

So, I'm really liking Python. In fact, it's now my go to language in most cases. Over the winter break I decided to spend some time building an entirely new application in Python. Something that would challenge me and something that I could work on over time (adding new features etc).

And that something is a Python application which calls the Transport for London's (TfL) [Unified API](https://tfl.gov.uk/info-for/open-data-users/unified-api?intcmp=29422)!

So what will this application do you may ask? Well...
- Allow a user to view the status and stops for an Underground line.
- Allow a user to view the current status for a road (and show a detailed reason if there are any issues)
- Allow a user to enter the name of an Underground station of where they are near and the station the user wants to go to
    - The total time of the journey is displayed
    - The each step will have a description, an action and a destination
    - If there are any disruptions, these will be displayed.
 
The code for this application can be found [here](https://gitlab.com/JoshBl_/python/tree/master/TfL%20App).

Let's get started!

<h1>Investigation 🔎</h1>

Well, to understand the [API](https://api.tfl.gov.uk/) - let's take a look at some example [requests](https://api-portal.tfl.gov.uk/docs) in Postman - let's look at this [one](https://api.tfl.gov.uk/line/mode/tube/status).

![Postman](https://i.postimg.cc/rFpKWMRN/postman-1.jpg)

Well, this gives us a lot of information! 🤔

This returns us all of the Underground lines and their status.

Well, how about building a [journey](https://api.tfl.gov.uk/journey/journeyresults/1000266/to/1000013)?

![Postman](https://i.postimg.cc/P5YhvRyM/postman-2.jpg)

Ah - for this GET request, we will need to sign up to get an API Key. Thankfully, this is free and painless (unlike Twitter where you need to submit a short story why you need access to the Twitter API).

Apart from that, we can see all sorts of useful information! Such as the duration of the journey, the individual steps, it covers the different ways of transport and even warns us of disruptions (if there are any).

Now we've seen some example calls and explored what TfL's API can offer - let's start building!

<h1>Setup 🧪</h1>

Well, first things first - we need to import several libraries into the program. However - for the requests [library](https://pypi.org/project/requests/) - we will need to install this by running 'pip'.

```
# import requests library - done by running - pip install requests
import requests
import json
import datetime
```

Once we have everything imported, we can begin putting together our first part of the program.

But before we can start building - we will create two new variables to store the API ID and the API Key. Without them, the application won't work.

I haven't included my own keys in the repository but you can sign up on TfL and add your own keys into the program if you want to run it locally.

```
appId = ''
appKey = ''
```

<h1>Getting the status of a Tube line 🚆</h1>

The London Underground has 11 lines, and when we look at the API, we can find a list of all the lines and their service status. That's great and all, but what if the user wants to see the status of a single line? How can we do that? Let's find out!

```
def tubeCheck():
    getRequest = requests.get(f"https://api.tfl.gov.uk/line/mode/tube/status")
    print(f"Status code from GET is {getRequest.status_code}")
    print(f"The current type of getRequest variable is {type(getRequest)}")

    print("""Welcome to the TfL Underground checker!
Please enter a number for the line you want to check!
0 - Bakerloo
1 - central
2 - circle
3 - district
4 - hammersmith & City
5 - jubilee
6 - metropolitan
7 - northern
8 - piccadilly
9 - victoria
10 - waterloo & city
    """)
    try:
        # getting the input as an integer
        number = int(input(">"))
        print(f"You have selected {number}")
        rawData = getRequest.json()
        tubeLine = rawData[number]
        #print(f"The type of the tubeLine variable is {type(tubeLine)}")
        print(f"Welcome to the {tubeLine['name']} line!")
        # # accessing an element in a nested dictionary
        print(f"The current status on the {tubeLine['name']} line is {tubeLine['lineStatuses'][0]['statusSeverityDescription']}")
        print(f"\nNow showing all available stops for the {tubeLine['name']} line:")
        getRequest = requests.get(f"https://api.tfl.gov.uk/line/{tubeLine['name']}/stoppoints")
        stopPoints = getRequest.json()
        stopCount = 0
        for stop in stopPoints:
            print(stopPoints[stopCount]['commonName'])
            stopCount += 1
        enter = input("\nPress enter to return to the menu!")
    # handling errors if user enters anything else other than a number or an invalid number
    except UnboundLocalError as e:
        print("Error! Please enter a number!")
        print("UnboundLocalError")
        print(e)
    except ValueError as e:
        print("Error! Please enter a number")
        print("ValueError")
        print(e)
    except IndexError as e:
        print("Error! Please enter a valid number!")
        print("IndexError")
        print(e)
```

And here's what it looks like on a terminal:

![Tube line status check](https://i.postimg.cc/02R43yP9/tfl-screen-1.jpg)

Well, let's make a call to the API and get the data we need.

```
getRequest = requests.get(f"https://api.tfl.gov.uk/line/mode/tube/status")
print(f"Status code from GET is {getRequest.status_code}")
print(f"The current type of getRequest variable is {type(getRequest)}")
```

I included the additional print statements after the GET request for some debugging while I was developing. It's also good to know how to print a status code from a GET request etc.

After that we get some user input of which line they want to view.

```
# getting the input as an integer
number = int(input(">"))
print(f"You have selected {number}")
```

The input is convered into an integer, not a string. If it wasn't converted to an integer - then we wouldn't be able to read the dictionary!

Before we start accessing the dictionary, we need to convert the response from the request into something that Python can read.

```
rawData = getRequest.json()
tubeLine = rawData[number]
```

So now we have our JSON content encoded, we can create a new dictionary called tubeLine which will contain information of the specified line that the user wants to see.

Next up, we print the request!

```
print(f"Welcome to the {tubeLine['name']} line!")
# # accessing an element in a nested dictionary
print(f"The current status on the {tubeLine['name']} line is {tubeLine['lineStatuses'][0]['statusSeverityDescription']}")
```

Great! Now we can access parts of the nested dictionary and print the values to the user.

While we're at it, why don't we use the name of the specific line and find out the lists of stops on the line? 🤔

Let's do that!

```
print(f"\nNow showing all available stops for the {tubeLine['name']} line:")
getRequest = requests.get(f"https://api.tfl.gov.uk/line/{tubeLine['name']}/stoppoints")
stopPoints = getRequest.json()
stopCount = 0
for stop in stopPoints:
    print(stopPoints[stopCount]['commonName'])
    stopCount += 1
enter = input("\nPress enter to return to the menu!")
```

By using the name of the line from the dictionary, we can perform a new GET request and encode the JSON request into a new dictionary called stopPoints. We also create a new integer called stopCount, this will be used to count all the stops for a line.

To iterate through the the dictionary, we need to use a for statement. After we print the name of a stop, we increment the value of stopCount by 1, this will repeat until it prints all of the names of the stops!

Great! That looks good!

But, what about error handling?

![Error handling](https://i.postimg.cc/W1Yp0HJF/tfl-screen-2.jpg)

Well, the key part of the function is in a try/except statement. This allows us to catch errors, like so:

```
except UnboundLocalError as e:
    print("Error! Please enter a number!")
    print("UnboundLocalError")
    print(e)
except ValueError as e:
    print("Error! Please enter a number")
    print("ValueError")
    print(e)
except IndexError as e:
    print("Error! Please enter a valid number!")
    print("IndexError")
    print(e)
```

From the testing I have done, I have found three potential errors that could happen depending on the input. So I have created except statements for particular errors.

Looks good to me! ✔

<h1>Checking the roads 🛣</h1>

Did you know that the TfL API also includes roads? 🤔 I didn't! I was curious to see what data would be included!

![Road Check](https://i.postimg.cc/GpW130ZR/tfl-screen-3.jpg)

```
# new function for checking the roads
def roadCheck():
    # error handling
    try:
        getRequest = requests.get(f"https://api.tfl.gov.uk/road")
        print(f"Status code from GET is {getRequest.status_code}")
        print(f"The current type of getRequest variable is {type(getRequest)}")
        rawData = getRequest.json()
        print("""Welcome to TfL Road checker!
Type in the number that you would like to check!
0 - A1
1 - A10
2 - A12
3 - A13
4 - A2
5 - A20
6 - A205
7 - A21
8 - A23
9 - A24
10 - A3
11 - A316
12 - A4
13 - A40
14 - A406
15 - A41
16 - Bishopsgate Cross Route
17 - Blackwall Tunnel
18 - City Route
19 - Farringdon Cross Route
20 - Inner Ring
21 - Southern River Route
22 - Western Cross Route
        """)
        roadName = int(input(">"))
        roadData = rawData[roadName]
        print(f"Now viewing data for {roadData['displayName']}")
        print(f"The current status of {roadData['displayName']} is {roadData['statusSeverity']} with {roadData['statusSeverityDescription']}")
        enter = input("Press enter to return to the main menu!")
        # handling errors if user enters anything else other than a number or an invalid number
    except UnboundLocalError as e:
        print("Error! Please enter a number!")
        print("UnboundLocalError")
        print(e)
    except ValueError as e:
        print("Error! Please enter a number")
        print("ValueError")
        print(e)
    except IndexError as e:
        print("Error! Please enter a valid number!")
        print("IndexError")
        print(e)
```

This is very similar to the function of getting the status of a tube line:

```
getRequest = requests.get(f"https://api.tfl.gov.uk/road")
print(f"Status code from GET is {getRequest.status_code}")
print(f"The current type of getRequest variable is {type(getRequest)}")
rawData = getRequest.json()
print("""Welcome to TfL Road checker!
Type in the number that you would like to check!
0 - A1
1 - A10
2 - A12
3 - A13
4 - A2
5 - A20
6 - A205
7 - A21
8 - A23
9 - A24
10 - A3
11 - A316
12 - A4
13 - A40
14 - A406
15 - A41
16 - Bishopsgate Cross Route
17 - Blackwall Tunnel
18 - City Route
19 - Farringdon Cross Route
20 - Inner Ring
21 - Southern River Route
22 - Western Cross Route
""")
roadName = int(input(">"))
```

We perform a GET request on the road API, and encode the response into a dictionary. After this is done, we ask the user for which road they want to check.

```
roadName = int(input(">"))
roadData = rawData[roadName]
print(f"Now viewing data for {roadData['displayName']}")
print(f"The current status of {roadData['displayName']} is {roadData['statusSeverity']} with {roadData['statusSeverityDescription']}")
enter = input("Press enter to return to the main menu!")
```

We create a new dictionary called roadData which uses the encoded JSON library based on the input from the user.

After that, we print information to the user about the road they have selected - including the description if the road has an issue! I didn't know that TfL had this information available about the roads in London! 👏

Of course, there is error handling:

![Error handling](https://i.postimg.cc/gJ4yGpTt/tfl-screen-4.jpg)

```
except UnboundLocalError as e:
    print("Error! Please enter a number!")
    print("UnboundLocalError")
    print(e)
except ValueError as e:
    print("Error! Please enter a number")
    print("ValueError")
    print(e)
except IndexError as e:
    print("Error! Please enter a valid number!")
    print("IndexError")
    print(e)
```

Similar to the line status check - we have parts of this function in a try/except statement. There are except statements looking at specific errors I found during testing.

Looks good! Now a user can check the roads in London! ✔

<h1>Planning a route 🚄</h1>
One part of the API I wanted to try and build around is the ability to plan a journey. So a user can put in a starting point and an end point which will result in directions, including the total time it takes!

For this first iteration of this application - I'll be looking at calculating routes between two Underground stations.

To do this, I need to find the ICS Code for each station and then use those codes to call the TfL journey planner. 🤔

Let's take a look at the function and go through it step by step.

```
def travelRoute():
    # try/except block for error handling
    try:
        # start
        print("""Please enter the name of the underground station where you are travelling from (i.e. Euston):
Please note, travel information will be based on the current time.""")
        startingLong = input(">")
        print(f"You have selected {startingLong}")
        # split the string into a list and rejoin it into a single word - used for the get request
        #startingLong = startingLong.split(' ')
        #startingString = ''.join(startingLong)
        #print(startingLong)
        # end
        print("Please enter the name of the underground station - end destination (i.e. Westminster):")
        endLong = input(">")
        print(f"You have selected {endLong}")
        # split the string into a list and rejoin it into a single word - used for the get request
        #endLong = endLong.split(' ')
        #endString = ''.join(endLong)
        #print(endLong)
        print("Now fetching route, please wait...")
        # find the icsCode for the start and end destination - used to build another GET request
        # GET request
        getRequest = requests.get(f"https://api.tfl.gov.uk/journey/journeyresults/{startingLong}/to/{endLong}&app_id={appId}&app_key={appKey}")
        #print(f"Status code from GET is {getRequest.status_code}")
        rawData = getRequest.json()
        # finding icsCode for starting point
        startPoint = rawData['fromLocationDisambiguation']['disambiguationOptions'][0]['parameterValue']
        #print(type(startPoint))
        print(f"The icsCode for the starting point is {startPoint}")
        # finding icsCode for end point
        endPoint = rawData['toLocationDisambiguation']['disambiguationOptions'][0]['parameterValue']
        #print(type(endPoint))
        print(f"The icsCode for the end point is {endPoint}")
        # building new GET request
        rawJourneyData = requests.get(f"https://api.tfl.gov.uk/journey/journeyresults/{startPoint}/to/{endPoint}&app_id={appId}&app_key={appKey}")
        #print(f"Status code from GET is {rawJourneyData.status_code}")
        fullRouteResponse = rawJourneyData.json()
        journeyTime = fullRouteResponse['journeys'][0]['duration']
        print(f"The overall journey time will be {journeyTime} minutes")
        print("The journey steps are:\n")
        selectedRoute = fullRouteResponse['journeys'][0]['legs']
        for detail in selectedRoute:
            print("From", detail['departurePoint']['commonName'])
            print(detail['instruction']['detailed'])
            print("Arrive at", detail['arrivalPoint']['commonName'])
            # displaying disruptions (if there are any)
            isDisrupted = detail['isDisrupted']
            if isDisrupted == True:
                for disruption in detail['disruptions']:
                    print("\n=======Disruption:=======")
                    print(disruption['description'])
            else:
                print("No disruptions reported.\n")
            print("\n")
    # handling KeyError specifically - found this in testing
    except KeyError as e:
        print("Error (KeyError)! Please try again!")
    # handling TypeError
    except TypeError as e:
        print("Error (TypeError)! Please try again!")
    print("Press enter to return to the main menu.")
    enter = input("")
```

First, let's get the name of the start point and the end point from the user.

```
print("""Please enter the name of the underground station where you are travelling from (i.e. Euston):
Please note, travel information will be based on the current time.""")
startingLong = input(">")
print(f"You have selected {startingLong}")
# split the string into a list and rejoin it into a single word - used for the get request
#startingLong = startingLong.split(' ')
#startingString = ''.join(startingLong)
#print(startingLong)
# end
print("Please enter the name of the underground station - end destination (i.e. Westminster):")
endLong = input(">")
print(f"You have selected {endLong}")
```

Good - we've got the start and end point, now we need to fetch the ICS Code for each station!

```
getRequest = requests.get(f"https://api.tfl.gov.uk/journey/journeyresults/{startingLong}/to/{endLong}&app_id={appId}&app_key={appKey}")
#print(f"Status code from GET is {getRequest.status_code}")
rawData = getRequest.json()
# finding icsCode for starting point
startPoint = rawData['fromLocationDisambiguation']['disambiguationOptions'][0]['parameterValue']
#print(type(startPoint))
print(f"The icsCode for the starting point is {startPoint}")
# finding icsCode for end point
endPoint = rawData['toLocationDisambiguation']['disambiguationOptions'][0]['parameterValue']
#print(type(endPoint))
print(f"The icsCode for the end point is {endPoint}")
```

But wait, why do we perform this get request to get the ICS Code - doesn't this include steps to get to the destination in the response?

Not exactly.

Although we are using the same endpoint, the response when using ICS Codes is different from using the names of stations. So we get the ICS Codes from this response and use it to build another request to find a journey between the two stations.

So, now we have our ICS Codes, let's go build our journey between two stations!

```
rawJourneyData = requests.get(f"https://api.tfl.gov.uk/journey/journeyresults/{startPoint}/to/{endPoint}&app_id={appId}&app_key={appKey}")
#print(f"Status code from GET is {rawJourneyData.status_code}")
fullRouteResponse = rawJourneyData.json()
journeyTime = fullRouteResponse['journeys'][0]['duration']
print(f"The overall journey time will be {journeyTime} minutes")
print("The journey steps are:\n")
selectedRoute = fullRouteResponse['journeys'][0]['legs']
for detail in selectedRoute:
    print("From", detail['departurePoint']['commonName'])
    print(detail['instruction']['detailed'])
    print("Arrive at", detail['arrivalPoint']['commonName'])
    # displaying disruptions (if there are any)
    isDisrupted = detail['isDisrupted']
    if isDisrupted == True:
        for disruption in detail['disruptions']:
            print("\n=======Disruption:=======")
            print(disruption['description'])
    else:
        print("No disruptions reported.\n")
    print("\n")
```

Okay, so after we build our new GET request using the ICS Codes - we can start printing out information for the user about the journey!

In this case, I am taking the first journey available from the response.

First, we find the journey time by looking at the duration value and print it.

Afterwards, we get to a tricky for loop. I honestly struggled with this part, but I learnt to take it slow and experiment! At one point it was printing each character in the commonName field! 🤦‍♂️

Anyway, inside the for loop we iterate through each object in the dictionary fullRouteResponse. We print the departure point, the instruction and where the arrival point is for that step. And then we check for disruptions, which is good for the user! It can have information if a road is closed or a line is going through maintenance!

In the response, there is a field called 'isDisrupted', we assign the value to a variable called isDisrupted and use it for a if statement. If the value is true, then it will hit a nested for loop - to iterate over the disruptions in the step of the journey and print them.

If there are no disruptions for the step, then it will print "No disruptions reported."

Probably one of the more trickier for loops I have done so far. 👏

I have error handling as well:

```
# handling KeyError specifically - found this in testing
except KeyError as e:
    print("Error (KeyError)! Please try again!")
# handling TypeError
except TypeError as e:
    print("Error (TypeError)! Please try again!")
print("Press enter to return to the main menu.")
enter = input("")
```

Let's take a look at creating a journey!

![Route checker](https://i.postimg.cc/NFxs012B/tfl-screen-5.jpg)

Looks great! We can see it prints disruptions if there are any and prints a message if there aren't any disruptions! ✔

<h1>Using the program 👨‍💻</h1>

Since Python doesn't have a switch statement, I decided to use a different approach:

```
valid = True
while valid == True:
    print("""Welcome to the TfL checker!
Please specify which service you would like to check!
1 - Underground
2 - Roads
3 - Route Checker
Type 'q' to quit.""")
check = input(">")
if check == '1':
    tubeCheck()
elif check == '2':
    roadCheck()
elif check == '3':
    travelRoute()
elif check == 'q':
    print("Goodbye!")
    valid = False
else:
    print("Error! Please try again!")
```

I use a while loop with a boolean value and a series of if/else statements to determine which function to run. The else statement is to catch any unexpected inputs from the user.

Great - the user can control the program! ✔

<h1>Conclusion</h1>

I've had a lot of fun building this application over the holidays - and I'm pleased on how well it works!

Of course, there is more to do and refactoring to be done.

Some of the things I want to implement in the future are:
- Calculating fares between stations.
- Find bike point information.
- Write information to a file.
- Look at planned works (when available)

I'm planning on adding more to this, so keep an eye on future posts about this exciting application! 👀

Don't forget to visit the GitLab page [here](https://gitlab.com/JoshBl_/python/tree/master/TfL%20App) to look at the code or fork the repo if you want to run it locally! 👍

Thanks for reading and happy new year! 🎉🎉🎉
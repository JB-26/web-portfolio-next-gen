---
title:  "Machine Learning in Python: Linear Regression - predicting future house prices. 🤖🏠"
date:   '2020-01-04'
---

For those who know me, I'm currently saving to buy my first home. As it turns out, houses are expensive where I am (in Milton Keynes). So I decided to buiild an application that can predict what the average house price would be at a given point in the future using Machine Learning in Python! 🤖

<h1>Investigation 🔎</h1>

So - what is Machine Learning? Machine Learning is where a program is able to perform a task without being given explicit instructions. Instead, the program in question uses patterns and inference from data. You could argue that Machine Learning is very similar to Artificial Intelligence.

In this example however, I will be looking at one area of Machine Learning - Linear Regression, which is a form of Supervised Learning.

<h4>Supervised Learning</h4>

In this case, the data we provide to the program is labeled and the program learns to predict the outcome based on the input.

There are several examples of Supervised Learning:
- <b>Regression Problems</b> - trying to predict a continuous valued output.
- <b>Classification</b> - trying to predict a discrete number of values (this will require examples to recognise the input).
- <b>Image Classification</b> - a program that can describe an unknown photo (by having thousands of pictures with labels to describe them known to the program before hand)

So if I want to use Supervised Learning to predict an average house price in the future then I will need to use Linear Regression.

The reason why Linear Regression is being used is that I'm trying to find a relationship between variables, and we can use that relationship to predict a future value. In this case, Linear Regression uses the relationship between the data points to draw a line of regression, which is used to predict a future value.

But in order to use Supervised Learning, I need data that is labeled, or in this case I need to find the average house price in Milton Keynes over the years so the program can predict an outcome in the future.

Where can I find this information? The land registry! Thankfully, the land registry has the [UK House Price Index](https://landregistry.data.gov.uk/app/ukhpi/browse?from=2000-01-01&location=http%3A%2F%2Flandregistry.data.gov.uk%2Fid%2Fregion%2Fmilton-keynes&to=2019-01-01) where I can find the data I need and download it in a CSV file.

![House prices from the land registry](https://i.postimg.cc/dtTRsC6f/excel.jpg)

Great, we have our labeled data in place so let's get started in creating something that can allow us to predict house prices in the future! 👨‍💻

Initially, I was just going to write a program that just took the data I found. Instead, I decided to write something that anyone could insert data for their local area.
In that case, I decided on the following:
- The user can add their own data for the X and Y axis.
- The user can clear the data.
- The user can see the graph displayed to them.
- The user has the choice of predicting a value in the future.

You can find the code for this [here](https://gitlab.com/JoshBl_/python/tree/master/Machine%20Learning/House%20price%20calculator).

<h1>Setup 🧪</h1>

First of all, we need to define which packages we need. Several of these are needed so we can draw a graph to show the data and the line of linear regession.

```
# importing pyplot to draw the graph including the line of linear regression
import matplotlib.pyplot as plt
# importing scipy to draw the line of Linear Regression
from scipy import stats
# needed for making the X and Y axis numpy arrays
import numpy
```

With everything imported, let's get started.

```
# boolean values
# these booleans will be referred to as global variables in functions so the value can be changed
xAxisAdded = False
yAxisAdded = False
menu = True

# test data
#2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019
#126282, 148630, 177948, 222582, 240869, 253564, 250250, 274463, 298417, 254852, 262020, 275860, 277554, 284119, 298446, 341733, 390376, 419366, 435652, 428394

# new arrays for the x and Y axis
yearX = []
valueY = []
```

The booleans (xAxisAdded and yAxisAdded) are used to monitor if the arrays (yearX and valueY) have been populated. The menu array is for monitoring if the user wants to exit the application or not. The test data comment was for testing purposes (it was used for testing drawing a graph and calculating the line of linear regression - it saved time from having to enter everything manually over and over again).

Then we have the arrays (yearX and valueY) - these will be populated with data from the user.

With the initial setup done, let's look at entering data from the user.

<h1>Getting data 🔢</h1>

To get data from the user, I wrote a function (technically two functions for the X and Y axis respectively, but it's basically the same apart from some small differences) that takes input from a user and adds it to the array:

<b>X axis function</b>
```
# function to add values to the X axis
def addToXAxis():
    # global used so the boolean can be accessed inside and outside of a function
    global xAxisAdded
    while xAxisAdded == False:
        try:
            monthCount = 1
            print("Adding values to the X axis (year) - the X axis can hold only 20 values")
            while monthCount <= 20:
                print(f"Please enter the value ")
                year = input(">")
                # convert the input to an integer
                year = int(year)
                # add value to the array
                yearX.append(year)
                print(f"Added year {year}")
                # increment value by 1 when a value is added to the array
                monthCount += 1
            else:
                # once array is populated, set boolean to true, designed to prevent the user from adding more than 20 values to the array
                xAxisAdded = True
        # error handling
        except ValueError as e:
            print("Error! Please enter a valid number.")
            print(f"Error details: {e}")
            # clearing the array as a precaution
            yearX.clear()
            # break to return to the menu and to prevent the user from adding values to the array
            break
    else:
        print("X axis is now populated.\nIf you want to add new values, please clear the currently held values.")
        print("Press enter to return to the main menu.")
        enter = input("")
```

<b>Y axis function</b>
```
# function to add values to the Y axis
def addtoYAxis():
    # global used so the boolean can be accessed inside and outside of a function
    global yAxisAdded
    while yAxisAdded == False:
        try:
            monthCount = 1
            print("Adding values to the Y axis (value) - the Y axis can hold only 20 values")
            while monthCount <= 20:
                print(f"Please enter the value ")
                value = input(">")
                # convert the input to an integer
                value = int(value)
                # add value to the array
                valueY.append(value)
                print(f"Added value {value}")
                # increment value by 1 when a value is added to the array
                monthCount += 1
            else:
                # once array is populated, set boolean to true, designed to prevent the user from adding more than 20 values to the array
                yAxisAdded = True
        except ValueError as e:
            print("Error! Please enter a valid number!")
            print(f"Error details: {e}")
            # clearing array as a precaution
            valueY.clear()
            # break to return to the menu and to prevent the user from adding values to the array
            break
    else:
        print("Y axis is now populated.\nIf you want to add new values, please clear the currently held values.")
        print("Press enter to continue.")
        enter = input("")
```

So before the user can input data into an array, the value of the boolean (yAxisAdded/xAxisAdded) is checked. The boolean is a global variable so it can be accessed inside or outside a function. In this case, if the boolean is false, the user can add values into the array.

I've set the limit of values that can be added into the array to twenty, so that twenty years of information can be added into the array. To achieve this, an integer called monthCount is incremented by one whenever a value is entered. The logic of adding a value to an array is within a while loop, so while the monthCount value is less than twenty, the user can add a value!

To ensure that the values entered can be used to draw a graph, the input is converted to an integer before it's saved to the array.

After twenty values have been entered, the value of the boolean is changed to true. So if a user tries to add more values to the array, they are met with a message that instructs them to clear the values in the array.

There is error handling as well, which apart from printing an error, all the values in the array are cleared (for example, in case the user has entered ten successful entries but the eleventh entry is incorrect).

Great - the user can now add values to the X and Y axis! ✔

![Python adding value X axis](https://i.postimg.cc/4d5L19qP/ML-1.jpg)

![Python adding value Y axis](https://i.postimg.cc/PfMJm5xq/ML-2.jpg)


<h1>Clearing values in the arrays 🧹</h1>

Maybe the user wants to check house prices across different towns or cities. The user shouldn't have to close the application and then start it again just to enter some new data.

That's why there are functions that clear the arrays for the X and Y axis respectively!

<b>X axis function</b>
```
# function to clear the array for the X axis
def clearXAxis(yearX):
    # global used so the boolean can be accessed inside and outside of a function
    global xAxisAdded
    print("Now clearing all held values in the X axis.\nPlease wait...")
    # clear the array of all values currently held
    yearX.clear()
    # changing value of boolean - this will allow the user to add values to the array again
    xAxisAdded = False
    print("Values in the X axis have been cleared. You can now add new values to the X axis.\nPress enter to return to the main menu")
    enter = input("")
```

<b>Y axis function</b>
```
# function to clear the array for the Y axis
def clearYAxis(valueY):
    global yAxisAdded
    print("Now clearing all held values in the Y axis.\nPlease wait...")
    valueY.clear()
    # changing the value on the boolean - this will allow the user to add values to the array again
    yAxisAdded = False
    print("Values in the Y axis have been cleared. You can now add new values to the Y axis.\nPress enter to return to the main menu")
    enter = input("")
```

This function is very straightforward - the array is cleared and then the value of the array is changed to False so that the user can add data to the X and Y axis again.

With being able to clear the X and Y axis, the user can have greater control on how they want to use the program! ✔

![Python clearing X axis](https://i.postimg.cc/FzCfqjBZ/ML-7.jpg)

![Python clearing Y axis](https://i.postimg.cc/Mp76f7mF/ML-8.jpg)

<h1>Displaying the values in the arrays 📰</h1>

Maybe the user wants to double check what values they have entered in the arrays for the X and Y axis? This function allows the user to do exactly that!

<b>X axis function</b>
```
# function for displaying all values held in X axis array
def displayXAxis(yearX):
    print("Now displaying the values held in the X axis")
    print(yearX)
    print("\nPress enter to return to the main menu.")
    enter = input("")
```

<b>Y axis function</b>
```
# function for displaying all values held in the Y axis
def displayYAxis(valueY):
    print("Now displaying the values held in the Y axis")
    print(valueY)
    print("\nPress enter to return to the main menu")
    enter = input("")
```

These functions are very straightforward - it just displays whatever is in the array!

Now the user can see what data they have entered in the array! ✔

![Python displaying array X](https://i.postimg.cc/X7TRqwbB/ML-3.jpg)

![Python displaying array Y](https://i.postimg.cc/LXby7p4g/ML-4.jpg)

<h1>Drawing the graph 📈</h1>

Now comes the fun part - using the information we have, we can now draw a graph for the user! 👏

This function is complex so I'll be breaking this part down into several sections.

Here's the function in question:

```
# function for plotting data on the graph and displaying it
def plotGraph(yearX, valueY):
    global xAxisAdded, yAxisAdded
    # check to ensure that both booleans are true
    if xAxisAdded == True & yAxisAdded == True:
        # key info for linear regression
        slope, intercept, rSquared, p, std_err = stats.linregress(yearX, valueY)
        # run through each value from the X axis via the drawX function
        def drawX(x):
            return slope * x + intercept
        print("Now drawing graph, please wait...")
        # calculating R-Squared value
        print(f"The relationship between the values on the X axis and the Y axis is {round(rSquared,2)}")
        # this creates a list object (list) and calculates the length of each word in the tuple (map)
        newModel = list(map(drawX, yearX))
        # draw the scatter plot
        plt.scatter(yearX, valueY)
        # draws the line of linear regression
        plt.plot(yearX, newModel)
        # title for the graph
        plt.title("Average House Prices")
        print("Close the graph to return to the program. Press enter to display the graph.")
        enter = input("")
        # display graph
        plt.show()
        # new boolean value
        predictBool = True
        while predictBool == True:
            print("Using the data available, would you like to predict house prices in a later year?\nType 'Y' for yes or 'N' for no.")
            userChoice = input(">")
            # converting the input to upper case
            userChoice = userChoice.upper()
            if userChoice == 'Y':
                try:
                    print("Please enter a year.")
                    futureYear = input("")
                    futureYear = int(futureYear)
                    prediction = drawX(futureYear)
                    print(f"In the year {futureYear}, the average price of a house will be £{round(prediction,0)}")
                    # calculating the percentage increase - accessing the last element in the X axis and Y axis array
                    print(f"That's a difference of {round(prediction / valueY[-1] * 100.0 - 100.0, 0)}% since {yearX[-1]}")
                    # change the value of the boolean to allow the while loop to end
                    predictBool = False
                    print("Press enter to return to the menu.")
                    enter = input("")
                # error handling
                except ValueError as e:
                    print("Error! Please enter a valid number!")
                    print(f"Error details: {e}")
            elif userChoice == 'N':
                predictBool = False
                print("Press enter to return to the main menu.")
                enter = input("")
            # if user enters something other than 'Y' or 'N' - print message
            else:
                print("Please enter a valid option.")
    else:
        # if either of the boolean values are false, print message
        print("Error! Please ensure that both the X axis and Y axis have values before plotting a graph.\nPress enter to return to the menu.")
        enter = input("")
```

So, first we need to check that the boolean values for the X and Y axis are true - we don't want to try to draw a graph with empty arrays!

After that we begin to calculate key values which will be used for creating the line of Linear Regression, drawing the graph and calculating if there is a relationship between the values on the X and Y axis.

```
# key info for linear regression
slope, intercept, rSquared, p, std_err = stats.linregress(yearX, valueY)
# run through each value from the X axis via the drawX function
def drawX(x):
    return slope * x + intercept
print("Now drawing graph, please wait...")
# calculating R-Squared value
print(f"The relationship between the values on the X axis and the Y axis is {round(rSquared,2)}")
# this creates a list object (list) and calculates the length of each word in the tuple (map)
newModel = list(map(drawX, yearX))
# draw the scatter plot
plt.scatter(yearX, valueY)
# draws the line of linear regression
plt.plot(yearX, newModel)
# title for the graph
plt.title("Average House Prices")
print("Close the graph to return to the program. Press enter to display the graph.")
enter = input("")
# display graph
plt.show()
```

So what are the values that are returned when we call 'stats.linregress'? 🤔

- <b>Slope (float)</b> - Slope of the regression line.
- <b>Intercept (float)</b> - Intercept of the regression line.
- <b>rSquared (float)</b> - Correlation coefficient.
- <b>p (float)</b> - Two-sided p-value for a hypothesis test whose null hypothesis is that the slope is zero, using Wald Test with t-distribution of the test statistic.
- <b>std_err (float)</b> - Standard error of the estimated gradient.

Note - 'p' and 'std_err' aren't used in this application.

The function 'drawX' is needed so that when we create the variable newModel (which is needed to draw the line of regression and will return a new array), the values of the function are returned. This is because a list in this case is not callable.

The rSqaured value shows the relationship between the X and Y axis. The closer the value is to 1, the more likely there is a relationship. If the value is 0 - there is no relationship.

![Python show rSquared](https://i.postimg.cc/SsHgcMyn/ML-10.jpg)

Now we have all of our variables ready, lets draw a graph!

We call 'plt.scatter' to add the values of the X and Y axis to the graph and 'plt.plot' to draw out line of Linear Regression by using the X axis array and the newModel variable as arguments. Finally, we give the graph a title with 'plt.title'.

To display the graph to the user - 'plt.show' is used!

![Python displaying graph](https://i.postimg.cc/43LkJjNs/ML-5.jpg)

Great! A graph is displayed along with a line of Linear Regression! ✔

<h1>Predicting a value in the future 🤖</h1>

Now comes the part everyone has been waiting for - Machine Learning in action. We've given the program labelled data, we've calculated the line of Linear Regression. Now we can predict a value in the future!

```
# new boolean value
predictBool = True
while predictBool == True:
    print("Using the data available, would you like to predict house prices in a later year?\nType 'Y' for yes or 'N' for no.")
    userChoice = input(">")
    # converting the input to upper case
    userChoice = userChoice.upper()
    if userChoice == 'Y':
        try:
            print("Please enter a year.")
            futureYear = input("")
            futureYear = int(futureYear)
            prediction = drawX(futureYear)
            print(f"In the year {futureYear}, the average price of a house will be £{round(prediction,0)}")
            # calculating the percentage increase - accessing the last element in the X axis and Y axis array
            print(f"That's a difference of {round(prediction / valueY[-1] * 100.0 - 100.0, 0)}% since {yearX[-1]}")
            # change the value of the boolean to allow the while loop to end
            predictBool = False
            print("Press enter to return to the menu.")
            enter = input("")
        # error handling
        except ValueError as e:
            print("Error! Please enter a valid number!")
            print(f"Error details: {e}")
    elif userChoice == 'N':
        predictBool = False
        print("Press enter to return to the main menu.")
        enter = input("")
    # if user enters something other than 'Y' or 'N' - print message
    else:
        print("Please enter a valid option.")
```

So the user has a choice if they want to predict a value in the future or not. If they don't want to then the function ends.

If they do however, they are asked for a value (which will be converted to an integer). To predict the value, we call the drawX function once more but this time pass in the value as the argument. This will then use the slope and the intercept to predict the value based on what the user has entered.

I also calculate the percentage increase based on the last element in the array (which is thankfully really easy to access by typing -1).

This part of the function is within a while loop with error handling - to ensure that the user enters a valid option.

<h1>Using the program 👨‍💻</h1>

Once again, I'm using my DIY switch statement for this program as well! 😂

```
# DIY switch statement
while menu == True:
    print("""Welcome to the House Price Calculator!
Type in the value against a menu option you want to run!
1) Add values to the X axis (year)
2) Add values to the Y axis (value)
3) Display values in X axis (year)
4) Display values in Y axis (value)
5) Plot graph (using values in X and Y axis)
6) Clear values in the X axis (year)
7) Clear values in the Y axis (value)
q) Quit""")
    menuChoice = input(">")
    if menuChoice == '1':
        addToXAxis()
    elif menuChoice == '2':
        addtoYAxis()
    elif menuChoice == '3':
        displayXAxis(yearX)
    elif menuChoice == '4':
        displayYAxis(valueY)
    elif menuChoice == '5':
        plotGraph(yearX, valueY)
    elif menuChoice == '6':
        clearXAxis(yearX)
    elif menuChoice == '7':
        clearYAxis(valueY)
    elif menuChoice == 'q':
        # terminates the program
        print("Goodbye!")
        menu = False
    # error handling for unknown inputs
    else:
        print("Error! Please try again!")
```

If the user enters something that the program doesn't expect - it will throw an error message.

<h1>Conclusion 🤖</h1>

So why don't we take a look at the potential average house price in Milton Keynes in the year 2021?

![Python prediction](https://i.postimg.cc/qMdYdpX2/ML-6.jpg)

Ah well, back to saving! 🤦‍♂️

Be sure to check the blog again next week for another post!

Thanks for reading!
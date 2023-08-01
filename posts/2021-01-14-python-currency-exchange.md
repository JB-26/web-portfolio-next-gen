---
title: "Using data from the European Central Bank to make DataFrames with Pandas and graphs with Plotly! 💶"
date: "2021-01-14"
---

In this post, I'll be walking through another project I've been working on recently. This project has been fun to work on as I've been able to practice using several data science libraries that I've been learning about recently.

As always, [here](https://gitlab.com/JoshBl_/python-currency-exchange-rate) is a link to where you can find the repo. Feel free to clone it and try it out!

So, what are we doing?

This program calls the [Exchange Rates API](https://exchangeratesapi.io), which uses the European Central Bank as it's data set. I like this API a lot - it's free to use and doesn't require an account to use it. Plus, it can retrieve exchange rates in the past and between two dates.

In a nutshell, we'll be calling that API and using the data we get to make some nice graphs.

So how are we going to do that? Let's take a look at the modules we will be using.

### Modules used

* [requests](https://pypi.org/project/requests/)
    * Used to make GET requests to the API
* json
    * Used to deserialise data from the response
* datetime
    * Used to get the current date
* os
    * Used to get the current working directory
* [pandas](https://pandas.pydata.org/)
    * Used for data analysis
* [plotly](https://plotly.com/)
    * Used for making interactive graphs
* [cufflinks](https://github.com/santosjorge/cufflinks)
    * Used to connect pandas and cufflinks

I've been meaning to find a way to practice Pandas and Plotly (and cufflinks), so I thought this project would be something fun to do.

Alright, now we understand what we're trying to do, let me walk you through what I've done.

### Imports and cufflinks

```
#import modules
import requests as req
from json import loads
import datetime
import os
#Data Science modules
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import cufflinks as cf

#allows cufflinks to be used offline
cf.go_offline()
```

Standard stuff, but what's important is the last line - making cufflinks available offline. That's needed as we need need to connect pandas and plotly together.

We'll be using pandas and plotly to make graphs that the user can interact with.

With this in mind, let's get started.

### Fetching the latest rates

We'll begin with getting the latest rates from the Exchange Rates API.

But first, we need to set some things up:

```
currentDateTime = datetime.datetime.now().strftime('%Y-%m-%d')
currentDateTime = str(currentDateTime)
baseCurrency = setBase()
compareCurrency = setCurrencyCompare()
```

We get the current date and covert it into a string and set the base currency and the currencies to compare against. Let's take a look into those functions now as we'll be using them a lot.

First, the base currency function:

```
while True:
        print('Please enter the currency you wish to use as the base currency in the form of a three character string (i.e. GBP, JPY, USD)')

        base = input('Input base currency - ').upper()

        if len(base) > 3:
            print("That's too long! Please enter a three character string and try again!")
        elif len(base) < 3:
            print("That's too short! Please enter a three character string and try again!")
        elif len(base) == 3:
            print(f"You have selected - {base}")
            return base
```

The API accepts a three character code for the base currency, so there's some basic validation to ensure the user enters something that's three characters.

Next, the compare currency function:

```
while True:
        print('Please enter the currency you wish to compare against in the form of a three character string (i.e. GBP, JPY, USD)')
        print('You can enter multiple currencies using a comma after the first currency (i.e. JPY,GBP,USD)')
        print('Or you can leave this blank and hit enter to return ALL currencies')

        currency = input('Input currency - ').upper()

        return currency
```

Similar to the base currency function, except the user can specify multiple currencies (separated by a comma)

Each function will return what the user entered.

Alright, let's take a look at making a GET request.

```
print(f'Now getting latest rates for {baseCurrency} as of {datetime.datetime.now()}')

        #Get data
        response = req.get(url=f'https://api.exchangeratesapi.io/latest?base={baseCurrency}&symbols={compareCurrency}')
        #Deserialise response into Python dictionary
        responseDict = loads(response.text)
        #the response has multiple dictionaries
        exchangeDict = responseDict['rates']
        print('Complete!')
        print('Current exchange rates')
        currencyList = []
        valueList = []
        for key,value in exchangeDict.items():
            #prints out the keys and values (up to 2 decimal places)
            #print(f'{key} - {value:.2f}')
            currencyList.append(key)
            valueList.append(f'{value:.2f}')
        completeDict = {'Currency':currencyList, 'Exchange':valueList}
        #make a dataframe
        df = pd.DataFrame(completeDict)
        df = df.sort_values(by='Currency')
        print(df)
```

We use the request module to make a GET request. But there is one problem, when we access the text attribute of the response, it's a string!

![JSON response](https://i.imgur.com/PRLNygR.png)

This is where the JSON loads method comes into play to help deserialise the response and turn it into a dictionary.

So we have the dictionary, let's take a look at what data we have from the API.

![Nested dictionary](https://i.imgur.com/SSdCH1S.jpg)

Ah - it's a nested dictionary. This is where the variable 'exchangeDict' is used to grab the dictionary from the 'rates' key.

You can also see that the exchange rates have so many decimal places, which doesn't make it readable. Let's change this.

For this step, we create two lists for the values and the currency names. Then we append the key and the value from the dictionary to these lists in a for loop. I used to print the values out but I'll leave that to the DataFrame in the next step.

The values are also formatted to two decimal places.

With these lists, we can now create our own dictionary called completeDict.

Now we have our dictionary with the data that we need, we can now create a DataFrame! But, as you saw from the response from the API, the currency names aren't in alphabetical order. This is why I used the 'sort_values' method and passed in the argument of 'Currency'.

With that done, let's take a look at the completed DataFrame!

![DataFrame latest rates](https://i.imgur.com/9lttcju.jpg)

Nice! 👏 It's in alphabetical order and the values are displayed to two decimal places.

A DataFrame is great and all, but to a user, it would be good if they could have a copy of this data somehow. This is where Pandas method of writing to a CSV comes into play.

```
print('Printing results to CSV file...')
df.to_csv(f'latest-{baseCurrency}-{currentDateTime}.csv',index=False)
print(f'CSV created! Written to {os.getcwd()}')
print(f'File is called - latest-{datetime.datetime.now()}-{baseCurrency}')
print('Now creating table - please wait...')
fig = go.Figure(data=[go.Table(
    header=dict(values=list(df.columns),),
    cells=dict(values=[df.Currency, df.Exchange]))])
fig.show()
fig.write_html(f'latest-{baseCurrency}-{currentDateTime}.html')
print(f'Table has been saved as a HTML file called - latest-{baseCurrency}-{currentDateTime}')
```

The name of the file is based on the date and the base currency chosen by the user.

Let's take a look at the CSV!

![CSV File latest](https://i.imgur.com/9kNvkC3.jpg)

Excellent! The user has a copy of the results in a CSV file.

But what if the user wants to see these results in a formatted table? This is where plotly comes into play. By creating a new figure (and calling it a table), defining what the header and cells are, we have a table in plotly!

![Plotly table](https://i.imgur.com/28jHu2s.jpg)

Great! This table is displayed in the browser and a HTML file of the graph is also saved to the user's machine.

That covers getting the latest exchange rates from the API. Let's move on to getting historical exchange rates from a specified day.

### Fetching historical rates on a specified date

Next, let's look at fetching historical rates on a specified date.

```
while True:
    try:
        print('NOTE: The furthest you can go back to is 1999!')

        year = setYear()
            
        month = setMonth()

        day = setDay()
        break
    except ValueError:
        print('Incorrect value detected! Please try again!')
```

Before we call the API, the user needs to specify what date they want to retrieve exchange rates. So, we have three functions for the year, month and day. Let's take a look at each.

```
def setYear():
    '''
    Function for setting the year from user
    '''
    while True:
        try:
            print('Please enter the year (as a numerical value)')
            year = int(input('Enter the year - '))

            if year < 1999:
                print('Please enter a valid year!')
            else:
                return year
        except ValueError:
            print('Incorrect value detected! Please try again!')
```

```
def setMonth():
    '''
    Function for setting the month from user
    '''
    while True:
        try:
            print('Please enter the month (as a numerical value)')
            month = int(input('Enter the month - '))

            if month < 1 or month > 12:
                print('Please enter a valid month!')
            else:
                return month
        except ValueError:
            print('Incorrect value detected! Please try again!')
```

```
def setDay():
    '''
    Function for setting the day from user
    '''
    while True:
        try:
            print('Please enter the day (as a numerical value)')
            day = int(input('Enter the day - '))

            if day < 1 or day > 31:
                print('Please enter a valid day!')
            else:
                return day
        except ValueError:
            print('Incorrect value detected! Please try again!')
```

These functions are fairly straight forward. They validate the input from the user and that value is returned.

So we have the date, and the currencies from the user - let's get the data!

```
print(f'Now fetching exchange rates for {baseCurrency} on the following date: {day}-{month}-{year}')
#Get data
response = req.get(url=f'https://api.exchangeratesapi.io/{year}-{month}-{day}?base={baseCurrency}&symbols={compareCurrency}')
#Deserialise response into Python dictionary
responseDict = loads(response.text)
#the response has multiple dictionaries
exchangeDict = responseDict['rates']
print('Complete!')
print(f'Exchange rate for {baseCurrency} on {day}-{month}-{year}')
for key,value in exchangeDict.items():
    currencyList.append(key)
    valueList.append(f'{value:.2f}')

completeDict = {'Currency':currencyList, 'Exchange':valueList}
#make a dataframe
df = pd.DataFrame(completeDict)
df = df.sort_values(by='Currency')
print(df)
```

This looks similar! The only differences is that the address for the API has slightly changed and the naming of the files.

Alright, let's look at the final area of this program.

### Fetching historical rates over a period of time

This is an area where we make use of plotly's scatter graph. So let's jump in!

But first, we need to get two dates so the API can retrieve exchange rates over a period of time.

```
while True:
    try:
        print('NOTE: Creating start date')
        print('NOTE: The furthest you can go back to is 1999!')

        year = setYear()
            
        month = setMonth()

        day = setDay()

        startDate = f'{year}-{month}-{day}'
        break
    except ValueError:
        print('Incorrect value detected! Please try again!')
    
while True:
    try:
        print('NOTE: Creating end date')
        print('NOTE: The furthest you can go back to is 1999!')

        year = setYear()
            
        month = setMonth()

        day = setDay()

        endDate = f'{year}-{month}-{day}'
        break
    except ValueError:
        print('Incorrect value detected! Please try again!')
```

We've already seen the functions to build the parts of the date (setYear, setMonth and setDate), so this part is self-explanatory.

And the request looks slightly different:

```
print(f'Now fetching exchange rates for {baseCurrency} between the following dates: {startDate} - {endDate}')
#Get data
response = req.get(url=f'https://api.exchangeratesapi.io/history?start_at={startDate}&end_at={endDate}&base={baseCurrency}&symbols={compareCurrency}')
```

Not only is the request different, but the response is slightly different as well!

![Nested dictionary two](https://i.imgur.com/lDRUszs.jpg)

So within the 'rates' key of the dictionary from the response, there are keys of all the dates between the two that the user specified, but the value are the exchange rates for that date! Plus, the dates are not in order and the values aren't displayed in two decimal places.

So we have a pretty big dictionary that isn't in order. Let's put this into a DataFrame and fix it!

```
#build DataFrame and clean up
df = pd.DataFrame(exchangeDict)
df = df.round(decimals=2)
df = df.reindex(sorted(df.columns), axis=1)
df = df.reindex(sorted(df.index), axis=0)
df = df.rename_axis("Dates", axis="columns")
df = df.rename_axis("Currency Code", axis="rows")
print(df)
```

And the result is....

![DataFrame Historical dates](https://i.imgur.com/vyfEGqN.jpg)

Excellent! 🎉

The program will make the CSV file but we've covered that before so there's nothing exciting going on there.

But what is exciting is the choice for a user to create a CSV file of the mean of each currency across the time period.

```
while True:
    print('Do you want to print the mean (average) of each currency to a seperate CSV file?')
    print("Type 'Y' for yes or 'N' for no")
    meanChoice = input('Enter your choice - ').upper()
    if meanChoice == 'Y':
        df.mean(axis=1).to_csv(f'historical-{startDate}-{endDate}-{baseCurrency}-Mean.csv',index=True)
        break
    elif meanChoice == 'N':
        print('Not printing the mean of currencies')
        break
    else:
        print(f'{meanChoice} - is invalid, please try again!')
```

This is optional, but it's quite amazing that pandas can do this on a DataFrame!

Moving on, we have the scatter graph with plotly!

```
#build scatter graph and customise it
print('Now creating scatter plot - please wait...')
fig = px.scatter(data_frame=df, title=f'Historical rates between {startDate} - {endDate} for {baseCurrency}')
fig.update_traces(marker=dict(size=15,line=dict(width=2,color='DarkSlateGrey')))
fig.show()
fig.write_html(f'historical-{startDate}-{endDate}-{baseCurrency}.html')
print(f'Scatter plot has been saved as a HTML file called - historical-{startDate}-{endDate}-{baseCurrency}')
```

When this is run, it produces the following scatter graph!

![Scatter Graph](https://i.imgur.com/2Oq2fA3.jpg)

Better yet, you can zoom in by using the mouse to highlight an area to focus on!

![Scatter Graph zoomed in](https://i.imgur.com/duvDfdR.jpg)

Of course, if the user requests for a large amount of data between two dates, the performance can take a hit when creating the graph with plotly.
### Conclusion

And that wraps it up!

Well, for now. There's still several areas that I'd like to improve on such as adding the ability to import a CSV file which has exchange rates, and perform some data analysis on it.

But for now, it grabs data from the European Central Bank, can do some analysis and can create some interactive graphs with Plotly!

I'll make another post in the future, when I have made several improvements - so keep an eye out!

Thanks for reading! 👏
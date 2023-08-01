---
title: "Practicing data analysis on COVID-19 data from the UK 🔍"
date: "2021-08-01"
---

In my search to find data sets where I can practice my data analysis skills is turning out to be more difficult than I thought. But then I discovered that the UK Government have created an [API](https://coronavirus.data.gov.uk/details/developers-guide) so you can access data regarding COVID-19 in the UK. In fact, it's available as a [Python library](https://github.com/publichealthengland/coronavirus-dashboard-api-python-sdk)!

So this time on my blog, I'll be exploring the API and seeing how we can visualise the data I find.

# An introduction to the library

Using the library requires the following in order to make a request:
- Filters
- Structures

## Filters

The filter is a required parameter to filter data from the API. This breaks down what data we want from an area. We can use the following filters for the area type:
- Overview for the UK
- Specific nation
- Specific region
- NHS Region
- Upper-tier local authority
- Lower-tier local authority

So in this case, I'm looking at Milton Keynes (my home town):

```
area_filter = [
    'areaType=ltla',
    'areaName=Milton Keynes'
]
```

With our list ready, we can now move onto the next piece of the request...

## Structures

With the structure we define the metrics we want in the structure we want. We can basically choose which metrics we want in the request. And from the documentation, there are a lot of different metrics that we can choose from (34 to be exact)! I won't list them all here but feel free to look at the documentation.

So, let's build our structure with a Python dictionary:

```
structure_dict = {
    "date": "date",
    "newCasesByPublishDate": "newCasesByPublishDate",
    "cumCasesByPublishDate": "cumCasesByPublishDate",
    "newDeaths28DaysByDeathDate": "newDeaths28DaysByDeathDate",
    "cumDeaths28DaysByDeathDate": "cumDeaths28DaysByDeathDate",
}
```

So in this case, I want the following:
- The date
- The number of new cases by publish date
- The number of cumulative cases by publish date
- The new number of new deaths in the past 28 days by death date
- The cumulative number of new deaths in the past 28 days by death date

So we have all that we need let's call the API and fetch some data!

## Using the library

The documentation suggests creating an object of 'Cov19API', then we can access the various built in methods to export the data.

```
api = Cov19API(filters=area_filter, structure=structure_dict)
```

And one of those methods is to export the data to a DataFrame!

```
df = api.get_dataframe()
```

Let's take a look at the data we have!

![Variables](https://i.imgur.com/OEX8R7h.jpg)

Well, the 'Not a number' values is something we'll have to work with. Let's replace them with 0 for now.

```
df.replace(np.nan, 0, inplace=True)
```

Now we have a value for the metrics, let's take a look at building a graph with Seaborn!

Let's build our first graph!

```
# create the plot
fig, ax = plt.subplots(figsize = (20,15))
# rename X and Y label
plt.xlabel('Date from 05-03-2020', fontsize=15)
plt.ylabel('New cases', fontsize=15)
# set title
plt.title("COVID-19 Milton Keynes (new cases)")
# create plot
sns.scatterplot(x='date', y='newCasesByPublishDate', size="newDeaths28DaysByDeathDate", sizes=(15,200), data=df)
```

![Too many X Ticks!](https://i.imgur.com/bObcR5M.jpg)

Looks like there isn't enough space for all the X Ticks, so let's remove them and try again!

```
# create the plot
fig, ax = plt.subplots(figsize = (20,15))
# remove X Ticks
plt.xticks([])
# rename X and Y label
plt.xlabel('Date from 05-03-2020', fontsize=15)
plt.ylabel('New cases', fontsize=15)
# set title
plt.title("COVID-19 Milton Keynes (new cases)")
# create plot
sns.scatterplot(x='date', y='newCasesByPublishDate', size="newDeaths28DaysByDeathDate", sizes=(15,200), data=df)
```

Which gives us this!

![Wrong graph](https://i.imgur.com/cGnXEHp.jpg)S

At first glance, it looks good! But if I create another graph which looks at using the cumulative deaths data on the Y Axis...

```
# create the plot
fig, ax = plt.subplots(figsize = (20,15))
# remove X Ticks
plt.xticks([])
# rename X and Y label
plt.xlabel('Date from 05-03-2020', fontsize=15)
plt.ylabel('Cumulative Deaths - 28 days by death date', fontsize=15)
# set title
plt.title("COVID-19 Milton Keynes (cumulative deaths)")
# create plot
sns.scatterplot(x='date', y='cumDeaths28DaysByDeathDate', size='newCasesByPublishDate', sizes=(15,200), data=df)
```

Which gives us this graph...

![Wrong graph](https://i.imgur.com/DN9XlTN.jpg)

That means, reading from left to right, these graphs don't make any sense! So we had high numbers at the start and now we don't? This graph is the wrong way round!

Thankfully, we can easily fix this! By using the following code:

```
df = df.iloc[::-1]
```

The code is the same for reversing a list.

Looking at the DataFrame from the API, the first row of data is for the most recent date, and the final row is the earliest date. So once the DataFrame is reversed, the graphs now make sense.

With this in mind, let's build a plot with two subplots and look at some data!

```
# create the plot (1 row, 2 columns)
fig, axes = plt.subplots(2, 1, figsize = (40,30))
# create plot 1
g1 = sns.scatterplot(x='date', y='newCasesByPublishDate', size="newDeaths28DaysByDeathDate", sizes=(15,200), data=df, ax=axes[0])
g1.set(xticklabels=[])
g1.set(title="COVID-19 Milton Keynes (new cases)")
g1.set(xlabel='Date from 05-03-2020')
g1.set(ylabel="New cases")

# create plot 2
g2 = sns.scatterplot(x='date', y='cumDeaths28DaysByDeathDate', size='newCasesByPublishDate', sizes=(15,200), data=df, ax=axes[1])
g2.set(xticklabels=[])
g2.set(title="COVID-19 Milton Keynes (cumulative deaths)")
g2.set(xlabel='Date from 05-03-2020')
g2.set(ylabel="Cumulative Deaths - 28 days by death date")
```

![Complete image](https://i.imgur.com/asA1ANi.png)

Much better! Now we can take a look at the data!

What's interesting to me from these graphs is the two spikes in the new cases graph. Let me show this in a line graph:

```
# create the plot
fig, ax = plt.subplots(figsize = (20,15))
# remove X Ticks
plt.xticks([])
# rename X and Y label
plt.xlabel('Date from 05-03-2020', fontsize=15)
plt.ylabel('New cases', fontsize=15)
# set title
plt.title("COVID-19 Milton Keynes (new cases)")
# create plot
sns.lineplot(x='date', y='newCasesByPublishDate', data=df)
```

![Line graph](https://i.imgur.com/t2XE5Xl.jpg)

The two spikes I'm looking at is the one in the middle and the one on the right.

The one in the middle is using data from winter 2020, and the one on the right is from the past few months. If we were using these graphs to tell a story we could say...

> The use of vaccines and lockdowns has led to a reduced number of COVID-19 cases and deaths in Milton Keynes

How can we prove that?

Let's refer to these two graphs again

![Complete image](https://i.imgur.com/asA1ANi.png)

On the top graph (new cases), the size of the dots represents the number of deaths on that day. The bigger the dot, the more deaths there were.

If you look at the size of the dots on each of the spikes, the dots were bigger on the first spike and smaller on the second. The difference between these two times is the availability of the vaccine.

## Plotly

So the graphs above are fine, but I did have to remove the X Ticks as there wasn't enough room for them. But what if you wanted to see how many cases and deaths there were on a specific date? I decided to use [Plotly](https://plotly.com/python/) - which creates interactive graphs.

So lets's get started!

```
# using plotly express
df = df.dropna()
fig = px.scatter(df, x='date', y='newCasesByPublishDate', size="newDeaths28DaysByDeathDate", title="COVID-19 Milton Keynes (new cases)")
fig.show()
```

Which gives us the following graph:

![Plotly graph](https://i.imgur.com/MhaOS4k.jpg)

It's great that it gives a level of interaction by being able to hover over points on the graph, but as you can see, if the value for the size parameter is 0 then there won't be a point plotted on the graph.

Slightly frustrating, but being able to zoom in on certain parts of the graph is great.

## Conclusion

The library is pretty good at getting a wide variety of data. This post only scratches the surface of what you can get from the API. I'll have to revisit this API in the future and make another post about it.

Thanks for reading! 👏
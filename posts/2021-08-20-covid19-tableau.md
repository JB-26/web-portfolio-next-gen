---
title: "Visualising COVID-19 data from the UK with Tableau 🔍"
date: "2021-08-20"
---

So [last time](https://joshblewitt.dev/blog/2021-08-01-covid19-uk-data/) I looked at using the API from the UK government to look at COVID-19 data in my hometown of Milton Keynes. Although this was good practice for my data analysis skills, visualising the data could be better.

So in this post, I'm visualising COVID-19 data for the UK as a whole.

As always, if you want to take a look at the GitHub repo of where you can find the data, you can find it [here](https://github.com/JB-26/covid_19-uk-data-analysis).

So let's grab all the UK data, clean it, and export it to a CSV file.

```
# nation data
area_filter = [
    'areaType=nation',
]

structure_dict = {
    "date": "date",
    "areaName": "areaName",
    "areaCode": "areaCode",
    "newCasesByPublishDate": "newCasesByPublishDate",
    "cumCasesByPublishDate": "cumCasesByPublishDate",
    "newDeaths28DaysByDeathDate": "newDeaths28DaysByDeathDate",
    "cumDeaths28DaysByDeathDate": "cumDeaths28DaysByDeathDate",
    "hospitalCases":"hospitalCases",
    "cumAdmissions":"cumAdmissions"
}

api = Cov19API(filters=area_filter, structure=structure_dict)
df = api.get_dataframe()

# reverse the order, so the graph starts with the earliest date
df = df.iloc[::-1]

# clean up! Replace nan with 0
df.replace(np.nan, 0, inplace=True)

df.to_csv('nation_results.csv')
```

The CSV file looks like this


![CSV file](https://i.imgur.com/9cdjNMJ.jpg)

Now with a CSV file, we can bring this to tableau!

_Since this was made in Tableau public - you can view it and interact with it! A link is further down the page!_

After bringing in the data, we can take a look at creating some visualisations. At first, I tried to create a bar graph but the results weren't great.

![Bar graph](https://i.imgur.com/qgofQ38.jpg)

The high results in England outweighed the results of Wales, Scotland and Northern Ireland. Plus it's difficult to read with the use of multiple rows.

So I decided to create a map! Thankfully, Tableau automatically generated the Longitude and Latitude for us - which makes things easier.

![Generated values](https://i.imgur.com/RYor9gg.jpg)

One challenge I had was having Tableau recognise the different regions of the UK (England, Scotland, Wales and Northern Ireland). At first, I thought of changing the Area Name to have the Geographical role of NUTS Eurpoe. Which resulted in the following:

![Wrong map](https://i.imgur.com/ymCrRoh.jpg)

As you can see, England isn't being shown despite Wales, Scotland and Northern Ireland being shown.

So how do we fix this?

Thankfully, it's an easy fix. Just change the Geographical role to State/Province for the Area Name.

Which shows the following:

![Correct map](https://i.imgur.com/UPLnAq6.jpg)

Great! Now we can hover over each part of the map to see information about each part of the UK!

Let's take a look at the tooltip. We want relevant information to be shown on the specific date.

![Tooltip](https://i.imgur.com/QafiiQQ.jpg)

And we'll use colour to highlight which state has the highest new cases. As well as adding the area name as the detail on the map, plus adding values for the tooltip.

![Tableau Marks](https://i.imgur.com/dEZtD00.jpg)

But the map still shows that the numbers for England hugely impact the results on the map. To fix this, let's add some filters.

![Filters](https://i.imgur.com/XfBHBsi.jpg)

Now the user can filter the state and the date! (And also added the date as a page so the user can start from the beginning and see how the map changes!)

Overall, it looks good! The interactive map is great and lets the user interact with the data with as much or little granularity as they want.

If you want to take a look at the map for yourself, click [here](https://public.tableau.com/app/profile/joshuablewitt/viz/COVID-19UKInteractiveMap/Map). If you liked it, why not add it as a favourite?

Thanks for reading! 👏
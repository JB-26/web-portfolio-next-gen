---
title: "Looking at the cost of living with Python (and getting depressed along the way) 📈"
date: "2021-05-03"
---

Since I started work, I had a vision of what I wanted to achieve in life. Much like the Marvel Cinematic Universe, my plan has phases.

- __Phase 1__ - Learn to drive
- __Phase 2__ - Buy a car
- __Phase 3__ - Buy a house

I've done the first two phases of my plan, but phase 3 is proving to be more challenging than I previously thought. You've probably seen on the news recently from outlets such as the [BBC](https://www.bbc.co.uk/news/business-56941162) and [The Guardian](https://www.theguardian.com/business/2021/apr/30/uk-house-prices-increase-at-fastest-rate-since-2004) that house prices are increasing at a terrifyingly fast rate, which is leaving first time buyers like myself in a difficult situation.

In fact, the Land Registry which operates the [UK House Price Index](https://landregistry.data.gov.uk/app/ukhpi) found that the average house price (at the time of writing is) __£250,341__, where property prices have increased by __8.6%__ over the previous year.

Which is crazy, I (and many others) can't afford those house prices! This has lead me to living with my parents, even at the age of 28.

What got me thinking to do this post was if there was a percentage or a number of people who are in the same position as myself.

As it turns out, there is. The Office for National Statistics tracks the number of [Young Adults living with their parents](https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/families/datasets/youngadultslivingwiththeirparents/current). And there is also the [UK House Price Index](https://www.gov.uk/government/statistical-data-sets/uk-house-price-index-data-downloads-february-2021?utm_medium=GOV.UK&utm_source=summary&utm_campaign=UK_HPI_Summary&utm_term=9.30_21_04_21&utm_content=download_data), which has some great data available.

With all this data, it's time to break out Python and Pandas to look at this data.

If you want to take a look at the Excel files I used for this, you can view them on my repo on [GitHub](https://github.com/JB-26/house-price-python). This repo also includes the Jupyter notebook for creating the dataframes, graphs and statistics.

First things first, let's put some data together. We'll need to create two CSV files:
- One for the percentage of young adults living with their parents
- One for the average UK House Price for each year.

For the percentage of young adults, this data set is split into two categories of age:
- Total of 15 to 34
- Total of 20 to 34

I'll be looking at total of 20 to 34 (as it's very likely that those who are 15 - 19 years old will be living with their parents).

Next, we need to look at the average cost a home throughout the years. Thankfully, the [UK House Price Index](https://landregistry.data.gov.uk/app/ukhpi/browse?from=1996-01-01&location=http%3A%2F%2Flandregistry.data.gov.uk%2Fid%2Fregion%2Funited-kingdom&to=2021-02-01&lang=en) has a handy application so we can get that information. It lets you download the data as a CSV, we'll use that and get the data we need.

Since the percentage of young people data is reported yearly, we will use the average price for a house in December per year. This will represent the average house price growth per year.

With our data ready, let's create some dataframes and take a look!

First, we'll create our dataframes, set the index to one of the columns and create a graph. 

![Dataframes](https://i.imgur.com/7wfwD5T.jpg)
![Set index](https://i.imgur.com/RtsdIxa.jpg)

![House price graph](https://i.imgur.com/b4M6Qdt.jpg)
![Young People parents graph](https://i.imgur.com/iLkWZEK.jpg)

The graph looks like this for the average house price over time from 1996 to 2020.

![Average house price](https://i.imgur.com/JA7wFR8.png)

The image shows several interesting points:
- The impact that the recession in the mid 2000's had on house prices
- The sudden spike in house prices in the year 2020 after prices were starting to slow

Let's take a look now at the percentage of young people (between the ages of 20 to 34) living with their parents.

![Percentage of young people living with their parents](https://i.imgur.com/RxUMxhH.png)

Much like the house price graph, as house prices go up, the number of young people staying with their parents also goes up.

So if we overlay both graphs over each other - we can see the following:

![Graph overlay](https://i.imgur.com/peGC1gq.png)

It seems like we can draw a line of correlation! Thankfully, we can calculate the correlation thanks to Pandas built in 'corr' method.

First, we'll need to create a new dataframe which concatenates two existing dataframes together.

![New dataframe](https://i.imgur.com/iVlZLvG.jpg)

With this new dataframe, we can now calculate the correlation.

This returns the value of __0.886905__.

![Correlation](https://i.imgur.com/W0wUYto.jpg)

Although it's good that we can be confident that the hypothesis of the cost of living has an impact on the number of young people living with their parents is correct - it is a depressing figure. The percentage of young people living with their parents could increase drastically over the next few years.

I would try and predict the values but given how the market is right now - I wouldn't be confident in predicting that. These values could change over the course of the year! (Especially as the tax break on Stamp Duty will end soon)

But the question is, _why is this happening?_

Why are many young people unable to afford a home?

I decided to take another look Office for National Statistics and see if I can find infomation on wages. Turns out there is data on [Earnings growth](https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/bulletins/uklabourmarket/october2020#earnings-growth). Which states that there was a fall of 0.8%. In fact, the data shows that earnings growth has been very low.

So as house prices have continued to climb - earnings growth has been very low.

As someone who falls into the 20 to 34 age range (I'm 28), and who is living with their parents, I decided to stay with my parents after graduating because I wanted to save money to buy a house. I mean sure, I could rent, but with the high house prices mean high rent costs. I wouldn't be able to put money away for a deposit. In fact, the Office for National Statistics also track this by looking at the [private rental market](https://www.ons.gov.uk/peoplepopulationandcommunity/housing/bulletins/privaterentalmarketsummarystatisticsinengland/october2019toseptember2020) and the current median for England is __£725__ - the highest ever recorded (we'll not look at London as that's a different [situation](https://www.london.gov.uk/what-we-do/housing-and-land/tackling-londons-housing-crisis)).

With this in mind, I'm not surprised that there are many young people staying with their parents. And I wouldn't be surprised if this values goes up in the future as house prices continue to rise.

For now, I'll just continue saving. I'm not sure how long I'll need to save for or how much I need - but it's all I can do. And I'm sure I'm not alone in this either.

Thanks for reading.
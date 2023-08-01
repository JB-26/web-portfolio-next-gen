---
title: "Exploring Social Media stats around the world with Pandas and Mito"
date: "2023-06-07" #YYYY-MM-DD
description: "The ever changing landscape of the internet"
image: https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=7200
---

![](https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=7200)

This post and project originally started back in February this year, and for some reason I just never finished it. So, roughly three months later, I’ve returned to this project to restart and finish it! Originally, this post was about focusing on social media stats in the United Kingdom. But I realise that wasn’t particularly exciting so I decided to shake things up and grab data from several other countries as well. So this project looks at data from the following countries

- United Kingdom
- United States of America
- Japan
- South Korea

Each data set of each country looks at the same date range; 2013 to 2023. Ten years of data.

The social media landscape has seen some major shakeups over the past few years. From Twitter being bought out, Facebook at the centre of privacy scandals and how businesses use social media (I honestly only have a Twitter account because so many businesses use the platform for customer support - which I think is an awful idea) and the rise of new social networks such as Mastodon.

So I decided to do a little data analysis with Pandas and a few other packages such as [Bokeh](https://bokeh.org/) and [Mito](https://www.trymito.io/) to get a better picture of the data.

If you want to clone the repo, you can do so [here](https://github.com/JB-26/social-media-stats) on GitHub. 

The data used in this analysis is from [StatCounter](https://gs.statcounter.com/social-media-stats/).

Let’s jump in!

# Preparing the data

The data is stored in CSV files, so this will need to be used when creating the dataframes (which will be needed for creating the graphs).

The data would be imported:

```
uk_df = pd.read_csv("social_media-GB-monthly-201305-202305.csv")
```

And then the date column would be converted to be using the 'datetime' data type:

```
uk_df['Date'] = pd.to_datetime(uk_df['Date'])
```

And then the information about the dataframe would be viewed to ensure that the date column was updated:

```
uk_df.info()
```

This process would be repeated for each country.

# UK Data

Let’s start with the UK first. The data itself does mention some odd social networks that I’ve never heard such as ‘Fark’ (*seriously, that was the best name they came up?*) and a few other results that either I’ve never heard of or just didn’t really make an impact (*I’m looking at you, Google+*) so I’ll exclude these when I’m creating graphs.

So, here’s the graph of the data:

![](https://github.com/JB-26/social-media-stats/blob/main/uk_data.png?raw=true)

We can see some interesting points:

- Facebook remained the most popular network, until a brief drop in 2020 where Twitter and Instagram jumped in popularity
- Tumblr briefly saw some popularity in 2014
- Pinterest appears to be declining in popularity
- Instagram is on the rise, looking to overtake Twitter
- Twitter hasn't seen much growth

# USA Data
Let's take a look at how things look in the USA:

![](https://github.com/JB-26/social-media-stats/blob/main/usa_data.png?raw=true)

We can see that:

- Facebook still remains hugely popular
- Pinterest hasn't been as popular in recent years
- Twitter and Instagram has seen large increases in popularity over the last few years
- Tumblr was birefly popular in 2014

# Japan Data
I was curious at how the social media landscape looked like and see if it was different to the UK and USA. And the results were interesting:

![](https://github.com/JB-26/social-media-stats/blob/main/japan_data.png?raw=true)

We can see that:

- Facebook was the most popular platform, but then lost ground to Twitter which has become the most popular platform today
- Pinterest also saw a brief spike in popularity in 2019
- YouTube enjoyed some growth, but it hasn't maintained it
- Intagram is on the rise

# South Korea Data
I was also wondering what was popular in South Korea, so I took a look at the data for that as well. And the results were surprising for one reason:

![](https://github.com/JB-26/social-media-stats/blob/main/south_korea_data.png?raw=true)

We can see that:

- Facebook and Twitter have swapped places in being the most popular platform
- Facebook is now the most popular platform
- Tumblr remained popular for a few years
- YouTube saw some growth recently (and has since lost it)
- Instagram isn't as popular as it is in other countries

# Combining data

Although it's interesting to see how the different platforms perform in each country, I decided to create a dataframe that looks at how a specific platform performs across multiple countries. Let's start with Facebook.

## Facebook

First, I created a new dataframe:

```
facebook_df = pd.DataFrame()
```

Created a new column for a country using an existing dataframe:

```
facebook_df['uk'] = uk_df['Facebook']
```

Which allowed me to create the following graph in Mito:

![](https://github.com/JB-26/social-media-stats/blob/main/facebook_combined.png?raw=true)

We can see that while the platform has done well in South Korea, it isn't popular in Japan. The platform still remains popular in the UK and the USA.

## Twitter

I did the same with Twitter.

First, create the dataframe:

```
twitter_df = pd.DataFrame()
```

And create a column for the country:

```
twitter_df['uk'] = uk_df['Twitter']
```

Which allowed me to create the following graph in Mito:

![](https://github.com/JB-26/social-media-stats/blob/main/twitter_combined.png?raw=true)

We can see that Twitter is very popular in Japan (and it was at one stage very popular in South Korea). The platform still remains popular in the UK and USA.

# Wrap up

It's interesting to see how different platforms perform in different countries. It's quite interesting to see how popular Twitter is in Japan, and Instagram slowly increasing in popularity.

There are some gaps such as how Mastodon and TikTok perform in these countries (I'm pretty sure that TikTok would have the lion's share in popularity), so it might be worth revisting this in the future when more data becomes available.

Thanks for reading! 👏


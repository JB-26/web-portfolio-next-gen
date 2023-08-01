---
title: "F1 2022 Data Science part two - plotting with Seaborn 🧐"
date: "2022-05-15"
description: "Wrestling with Time Delta, rotating X labels in Seaborn and visualisation!"
image: https://images.unsplash.com/photo-1582854050148-651d87fa3319?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80
---

Welcome back to part 2 of my series on my project about F1 2022 season with Data Science/Analysis! This week, it's a short update as I am very busy with other things on my plate at the moment.

If you want to take a look at the project and clone it for yourself to play around with it, the repo is [here](https://github.com/JB-26/f1-2022-analysis).

So last time, I explored on creating data frames with Pandas and wrestling with the challenge of timing with time delta. At the end of the previous post, I explained how I transformed the fastest lap timings from the F1 website into something workable with time delta.

Problem is, the format is not _exactly_ how I would like it. Here’s a reminder of how it looks:

```
NO                                 1.0
FL           0 days 00:01:29.633333333
AVG_SPEED                   226.321333
```

Trying to put this onto a plot with Seaborn won’t look right. I don’t want to display 0 days 00:01:29.633333 etc for _every_ point, I’d like it to look slightly more readable.

So I decided to do some research.

Turns out, it’s quite easy!

```
# convert column to timedelta
fastest_lap[‘FL’] = pd.to_timedelta(fastest_lap[‘FL’])
# get total seconds
fastest_lap['FL'] = fastest_lap['FL'].dt.total_seconds()
```

And the total seconds returns information like this:

```
NO             1.00
FL            87.74
AVG_SPEED    223.50
```

Success! This makes things much easier when it comes to calculating the average and plotting data!

Speaking of plotting, let’s take a look at plotting data with [Seaborn](https://seaborn.pydata.org/index.html). I’ve moved work for plotting data into a new Jupiter notebook as the other notebooks were becoming crowded.

So at first I decided to create a [scatterplot](https://seaborn.pydata.org/generated/seaborn.scatterplot.html?highlight=scatterplot#seaborn.scatterplot) to try and plot the fastest lap data from the drivers across all races so far (up until Miami at this time of writing). It initially looked good but there was a problem, the labels on the X axis were overlapping with each other.

![](https://i.imgur.com/7Zi4qMk.png)

So I needed to find a way to rotate the labels. Easier said than done, right? Turns out, not quite.

The first hurdle I found was with this code, viewing the X labels
```
#define figure size
sns.set(rc={"figure.figsize":(10, 7)}) #width=10, height=7
# create plot
plot = sns.scatterplot(data=fl_df, x='DRIVER', y='FL', hue='RACE')
# no xlabels - weird!
plot.get_xticklabels()
```

Which returns the following:

```
[Text(0, 0, ''),
 Text(0, 0, ''),
 Text(0, 0, ''),
 Text(0, 0, ''),
 Text(0, 0, ''),
 Text(0, 0, ''),
 Text(0, 0, ''),
 Text(0, 0, ''),
 Text(0, 0, ''),
 Text(0, 0, ''),
 Text(0, 0, ''),
 Text(0, 0, ''),
 Text(0, 0, ''),
 Text(0, 0, ''),
 Text(0, 0, ''),
 Text(0, 0, ''),
 Text(0, 0, ''),
 Text(0, 0, ''),
 Text(0, 0, ''),
 Text(0, 0, ''),
 Text(0, 0, '')]
```

The list of the labels is blank! That doesn’t look right (maybe it’s a bug with Seaborn?)

So I decided to repopulate the list and then rotate the labels by 90 degrees.

```
#define figure size
sns.set(rc={"figure.figsize":(10, 7)}) #width=10, height=7
# create plot
plot = sns.scatterplot(data=fl_df, x='DRIVER', y='FL', hue='RACE')
# no xlabels - weird!
plot.get_xticklabels()
# add the xlabels and rotate!
plot.set_xticklabels(fl_df['DRIVER'].tolist(), rotation=90)
```

So now the X labels list looks like this:

```
[Text(0, 0, 'Max Verstappen'),
 Text(1, 0, 'Charles Leclerc'),
 Text(2, 0, 'Carlos Sainz'),
 Text(3, 0, 'Sergio Perez'),
 Text(4, 0, 'George Russell'),
 Text(5, 0, 'Mick Schumacher'),
 Text(6, 0, 'Lewis Hamilton'),
 Text(7, 0, 'Yuki Tsunoda'),
 Text(8, 0, 'Esteban Ocon'),
 Text(9, 0, 'Valtteri Bottas'),
 Text(10, 0, 'Daniel Ricciardo'),
 Text(11, 0, 'Lance Stroll'),
 Text(12, 0, 'Fernando Alonso'),
 Text(13, 0, 'Lando Norris'),
 Text(14, 0, 'Alexander Albon'),
 Text(15, 0, 'Sebastian Vettel'),
 Text(16, 0, 'Kevin Magnussen'),
 Text(17, 0, 'Nicholas Latifi'),
 Text(18, 0, 'Pierre Gasly'),
 Text(19, 0, 'Zhou Guanyu'),
 Text(20, 0, 'Max Verstappen')]
```

And the plot looks like this!

![](https://i.imgur.com/6JlEMRj.png)

That’s much better!

I decided to play around with several different setups for a scatter plot…

![](https://i.imgur.com/1x0n7Sr.png)

…with limited success.

The graph above is difficult to read with all the drivers. So maybe instead of looking at the performance of all the drivers, why not focus on one driver?

So in this example, I’ll look at Lando Norris (who drives for McLaren). I decided to take a look at visualising the data.

Here’s a quick example:
```
# Looking at Lando Norris
# get data by specific driver
lando = fl_df.loc[fl_df['DRIVER'] == 'Lando Norris']
lando_plot = sns.catplot(x='RACE', y='AVG_SPEED', data=lando, kind='bar', height=7, aspect=2)
```

Which results in the following plot:

![](https://i.imgur.com/QzoS1R8.png)

Looks okay, we can see that Lando’s average speed tends to be above 200 MPH.

But of course, the F1 2022 season is _far_ from over. So as more data becomes available, the more we can learn about specific drivers performance!

And that about wraps it up for this update on the F1 2022 project. Thanks for reading! 👋
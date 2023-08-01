---
title: "An introduction to my new project, Data Science/Analysis meets the 2022 season of F1! 🏎"
date: "2022-04-20"
description: "Who knew working with time could be so frustrating?"
image: https://images.unsplash.com/photo-1636089772054-48dc564443d1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2498&q=80
---

Hi! It’s been a while! 👋

What have I been working on recently? I decided to start on a somewhat long term project which looks at combining Data Science/Analysis with a sport that I’m a fan of; [Formula 1](https://www.formula1.com).

The 2022 season is under way and I thought it would be fun to learn more about Python packages such as [Pandas](https://pandas.pydata.org) and [Seaborn](https://seaborn.pydata.org/index.html) by using them in a project that I could continually work on and share.

So, in this week’s post, I will be going through a brief introduction to the project and share what I’ve done so far. If you want to take a look at the project, feel free to check it out on [GitHub](https://github.com/JB-26/f1-2022-analysis).

## What’s this project about?
This project is about looking at several statistics from Formula 1 and performing analysis as well as visualising the data.

Areas that are currently planned are:
* Fastest lap
* Points
* Speed

This will be looked at drivers and teams.

The analysis/data science will be done with Pandas whilst visualisation will be done with Seaborn.

At the moment, this is very much a work in progress.

## Getting the data
First things first; data.

Thankfully, Formula 1 has this data available on its [website](https://www.formula1.com/en/results.html/2022/races.html). Although it’s not available to download, copy and pasting it into a CSV file is easy enough. So at the moment, the repo has data for the first three races of the season:
* Bahrain
* Saudi Arabia
* Australia

The repo has the data for the race and the fastest lap data.

## Starting up - fastest lap analysis
For the overall analysis, the data will need to live in a DataFrame, let’s 
```
fastest_lap = pd.DataFrame()

fastest_lap = fastest_lap.assign(NO = '', DRIVER = '', RACE = '', FL = '', AVG_SPEED = '')
# rename the column header
#fastest_lap.columns = fastest_lap.columns.str.replace('SPEED', 'AVG SPEED')

fastest_lap.head()
```


Let’s put those race statistics into DataFrames with Pandas
```
# example of loading csv data
bahrain_df = pd.read_csv("data/BAHRAIN.csv")
bahrain_df.head()
```

Looks good!

Now we have some data, we can move onto one of the more challenging aspects. The fastest lap data from each race.

Something I want to do is to calculate the average fastest lap across all races for each driver. 

Let’s take an example from the race in Australia. The fastest lap was done by Charles Leclerc which was 01:20.3. Which we know is 1 minute, 20 seconds and 3 milliseconds. However, Python doesn’t know that. If we were to add this to a column in a DataFrame, it would be treated as an object (so you can’t calculate the mean).

Originally, I went down the route of going with the [datetime](https://docs.python.org/3/library/datetime.html) data type. But this didn’t work as I intended so I went with [timedelta](https://docs.python.org/3/library/datetime.html#timedelta-objects) instead.

But how do we extract the data and covert it?

## Wrestling with time
So first, I need to get the data from the previous races, extract them and put them in the ‘fastest_lap’ DataFrame.

We can do this with the following:

```
driver_count = 0

while driver_count < len(fl_australia.index):
	time = fl_australia.loc[driver_count, 'TIME']
	driverNo = fl_australia.loc[driver_count, 'NO']
	name = fl_australia.loc[driver_count, 'DRIVER']
	avg_speed = fl_australia.loc[driver_count, 'AVG SPEED']
	if time == 'DNF':
		driver_count += 1
	else:
		#time = re.sub(r'[^0-9.]', '', time)
		#timeFloat = float(time)
		formattedTime = datetime.strptime(time,'%M:%S.%f')
		formattedTime = formattedTime.strftime('%H:%M:%S.%f')[:-5]
		#finalTime = timeFloat + fastest_lap_bahrain_time.strftime('%M:%S.%f')[:-3]
		# add row
		fastest_lap.loc[-1] = [driverNo, name, 'AUSTRALIA', formattedTime, avg_speed]
		# shift the index
		fastest_lap.index = fastest_lap.index + 1
		driver_count += 1

# CONVERT FL COLUMN TO TIMEDELTA FORMAT
fastest_lap['FL'] = pd.to_timedelta(fastest_lap['FL'])
fastest_lap.head()
```

This loop would perform the following:
* Grab information for the driver (using the index value) and assign to variables
* If the time is ‘DNF’, then do nothing
* If it has a time, then we use the ‘strptime’ method to convert it to a datetime format.
* ‘strftime’ method to format the milliseconds
* Add the row to the ‘fastest_lap’ DataFrame
* Increment the driver count variable by 1
* Convert the fastest lap column to a ‘timedelta’ type

Originally, I converted the column to a ‘timedelta’ type and **then** added the data into the DataFrame. But what happened is that once the data was added, the data type for the column changed back to ‘object’.  So performing any calculations wouldn’t work. This caught me off guard slightly, I was confused at why it was changing the data type.

Which is why I added the convert column to the ‘timedelta’ format when the while loop had completed, that way I know that the data type for the column will be converted.

## Finding data in the (partially) complete DataFrame
So, now that we have some data (at this time of writing, data from 3 races) we can actually start doing some calculations of getting the mean of the fastest lap.

But first, let’s actually get the data for a driver. Let’s pick Max Verstappen as an example

```
# get data by specific driver
fastest_lap.loc[fastest_lap['DRIVER'] == 'Max Verstappen']
```

Great! This returns only Max’s results from the 3 races that have happened so far. Now, we can add the mean method at the end of this like so:

```
# get data by specific driver
fastest_lap.loc[fastest_lap['DRIVER'] == 'Max Verstappen'].mean()
```

And this returns the following:

```
NO                                 1.0
FL           0 days 00:01:29.633333333
AVG_SPEED                   226.321333
```

Great! Now we can see the average fastest lap time and speed for Max!

## Next steps
The next step is to only get the fastest lap result and then reformat the result to show the hour, minute, second and millisecond value (but only to 1 decimal place). Part of this has been achieved in the while loop shown above.

The next big challenge is visualising the data that has been collected. Seaborn will be used in this and I need to decide on what graph should be used.

Then comes the data science part. I was thinking of building a linear regression model to predict the results of races in the future. This would rely on getting the practice data (as before the main race there are practice sessions to determine where each driver will start at).

## Conclusion
So that’s a brief introduction to my newest project. If you want to take a look, feel free to clone the repo and have a look around!

Thanks for reading! 👋
---
title: "F1 Data Science Project Part 6 - Improving data analysis with Mito"
date: "2023-02-11"
description: "A new way to supercharge your data analysis work"
image: https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=7200
---

![](https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=7200)

Hey, welcome back to an update to the F1 Data Science Project! With the new season coming up I was looking at new ways to improve my skills on Data Analysis.

When I was doing some research I discovered something called [Mito](https://www.trymito.io/) - a package for Jupyter notebooks. Mito provides tools to analyse files (CSV, excel files and dataframes), transforming data and generates code.

With the new season of F1 starting in a few months, I was thinking of using Mito to perform data analysis on the data I collect. As having a tool that can do majority of the heavy lifting would be beneficial.

So I decided to investigate using Mito and build some graphs with the current F1 data that I have. Mito has [documentation](https://docs.trymito.io/) to install and to use Mito.

If you want to see a working example of this with the F1 data, check out this [GitHub](https://github.com/JB-26/f1-2022-analysis/blob/main/mitosheet_example.ipynb) page which has some examples of Mito being used.

Installing Mito is quite simple. It can be installed with venv, Docker and Anaconda (although Mito is free to use, there are additional features that are locked behind a paywall).

Let’s jump into using Mito!

# Installing and using

Mito only supports running in a Jupyter notebook in a web browser. So this means you can’t run Mito in Visual Studio Code for example. I think this is my major issue I have with it. It would be great if this would work in VSC or [DataSpell](https://www.jetbrains.com/dataspell/).

Getting Mito up and running is pretty easy, just by calling the package in a cell on a Jupyter notebook (or by pressing the Mito spreadsheet button in Jupyter notebook). The performance of Mito is great, even when displaying graphs using Plotly.

It might seem odd working within a cell but Mito does offer a fullscreen option, which makes it much easier to use.

When you generate a Mito spreadhseet, it’ll create a unique ID. So when you close Mito and then reopen it later on, it’ll remember what you had opened (such as what dataframes you were using etc). However, you will need to ensure that the dataframes are created so Mito can use them.

# Importing data

It’s not particular files that can be exported, it’s existing dataframes as well. In the example Mito spreadsheet, there’s both a CSV file and a dataframe.

After importing a set of data into Mito, the code that was used to import it will be pasted in a separate cell. Example:

```python
from mitosheet import *; register_analysis("id-olultagqwt");
    
# Imported race-results.csv
import pandas as pd
race_results = pd.read_csv(r'/Users/joshblewitt/Dev/f1-2022-analysis/data/compiled-data/race-results.csv')
```

Once it’s imported, you can filter the table, see the type of data for the column and start using the other functionalities of Mito.

Speaking of which…

# Graphs with Plotly

So an interesting functionality of Mito is that it uses [Plotly](https://plotly.com/graphing-libraries/) to generate the graphs. And when you build a graph, the code to generate it is printed out for you in a separate cell. It’s a great opportunity to learn how to do something in Plotly.

Here’s an [example](https://github.com/JB-26/f1-2022-analysis/blob/main/iframe_figures/figure_13.html) of a box plot that I created in Mito (you will need to clone the repo and then open it locally for the graph to be displayed!). And here is the code that generated that graph:

```python
import plotly.express as px
# Construct the graph and style it. Further customize your graph by editing this code.
# See Plotly Documentation for help: https://plotly.com/python/plotly-express/
fig = px.box(race_results, x='Car', y='PTS', points=False)
fig.update_layout(
    title='Team Performance', 
    xaxis = dict(
        title='Team', 
        showgrid=True
    ), 
    yaxis = dict(
        title='Points', 
        showgrid=True
    ), 
    legend = dict(
        orientation='v'
    ), 
    paper_bgcolor='#FFFFFF'
)
fig.show(renderer="iframe")
```

This is by far my most favourite feature of using Mito. The ease of use in creating interactive graphs is a huge plus. Again, the fact that Mito provides you with the code is amazing.

# Managing DataFrames

Managing DataFrames can be quite tricky normally, but Mito makes it easier to work with DataFrames by providing a wide range of functionality out of the box.

From creating pivot tables, to concatenating additional DataFrames, Mito can handle it. And as always, it shows you the code on ****how**** it performed your requested functionality.

Let’s take a look at this example of using a DataFrame to create a pivoted table.

```python
# Pivoted raceResults into raceResults_pivot
tmp_df = raceResults[['Race', 'Car', 'PTS']].copy()
pivot_table = tmp_df.pivot_table(
    index=['Car'],
    columns=['Race'],
    values=['PTS'],
    aggfunc={'PTS': ['std']}
)
pivot_table = pivot_table.set_axis([flatten_column_header(col) for col in pivot_table.keys()], axis=1)
raceResults_pivot = pivot_table.reset_index()
```

Mito is quite powerful once you start using its range of functionalities!

# Column functions

Mito is also excellent at managing columns, whether you want to change the data type for a column or filtering the view, Mito can do that.

Here’s an example of filtering the view on the position column and then changing the data type of the column from a string to an integer:

```python
# Filtered POS
race_results = race_results[race_results['POS'] == '1']

# Changed POS to dtype int
race_results['POS'] = to_int_series(race_results['POS'])
```

And another example of applying a group of filters

```python
# Filtered Driver
race_results = race_results[(race_results['Driver'].str.contains('A', na=False, regex=False)) & (~race_results['Driver'].str.contains('Max', na=False, regex=False))]
```

# Spreadsheet formulas

Similar to Microsoft Excel, you can enter formulas that can be applied to cells in a column.

Here’s an example for the points column, checking where if a cell’s value is greater than 5.

```python
# Set formula of PTS
race_results['PTS'] = race_results['PTS'] > 5
```

This will show either true or false in the column if the cell meets the condition.

There’s a full list of formulas that can be performed in Mito [here.](https://docs.trymito.io/how-to/interacting-with-your-data/mito-spreadsheet-formulas)

# Exporting data

Much like Excel, you can export the data that you are working on.

Sheets that you have open can be exported to CSV or to an Excel file. Mito also allows you to generate export code to the file type you choose. Here’s an example of exporting several sheets to CSV

```python
# Exports 6 to file race_results_export_raceResults_pivot.csv
race_results.to_csv("race_results_export_race_results.csv", index=False)
fastest_laps.to_csv("race_results_export_fastest_laps.csv", index=False)
avgPoints.to_csv("race_results_export_avgPoints.csv", index=False)
avgPoints_transposed.to_csv("race_results_export_avgPoints_transposed.csv", index=False)
raceResults.to_csv("race_results_export_raceResults.csv", index=False)
raceResults_pivot.to_csv("race_results_export_raceResults_pivot.csv", index=False)
```

# Wrap up

And that’s a quick introduction to Mito! 

I think the biggest benefit of using Mito is how easy it is to use and how it generates code of what you’re doing (having knowledge of Python and Mito is useful to have before you start using Mito).

Although it’s free to use, the Pro level costs $40 a month, with an enterprise level also being offered.

I’ll be implementing the use of Mito while I’m doing data analysis for the next season of Formula 1!
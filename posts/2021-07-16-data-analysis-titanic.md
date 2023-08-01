---
title: "Analysing data from the Titanic with Python 🐍"
date: "2021-07-16"
---

Something I've been enjoying recently is learning about Data Analysis. The idea of finding data and seeing if you can tell a story from it is interesting. So, this time on my blog - I'll be doing just that! I'll be exploring a data set regarding the Titanic and see if we can answer a question!

Before we look at the data in question. Let's take a quick look of the data analyst process:

- __Ask__ a question
- __Determine__ the necessary data
- __Get__ the data
- __Clean__ and sort the data
- __Explore__ the data
- __Communicate__ the findings

With this in mind, let's break down what we're going to do:

- __Question__ - Who was more likely to survive the Titanic, men or women?
- __Data__ - The data is from [OpenML](https://www.openml.org/d/40945) (Which was originally found at this Visual Studio Code tutorial by [Microsoft](https://code.visualstudio.com/docs/datascience/data-science-tutorial))

Now, we begin the process of __Cleaning__ and __Exploring__ the data we have. For this, I'll be using Visual Studio Code. If you want to take a look at the Jupyter notebooks, you can find them on this GitHub [repo](https://github.com/JB-26).

I've done some data analysis before, when I looked at [UK House Pricing](https://joshblewitt.dev/blog/2021-05-03-house-prices/) a few months back. But this time I have a full data set to look at.

Well, let's get started with importing the libraries that we need.

```
import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
```

And import the CSV that we need....

```
data = pd.read_csv('titanic.csv')
```

And let's just check the head of the dataframe just to make sure it looks okay.

```
data.head()
```

While I'm doing this, I've got the variables that I've created open in the Jupyter kernel like so:
![Variables](https://i.imgur.com/wOnuXDt.jpg)

And we can view the data in the DataFrame as well, which is handy!

But looking at the data, not all rows of data are complete - some have missing data (marked with a question mark). So, let's do some clean up!

```
#clean up!
data.replace('?', np.nan, inplace= True)
#update column data type
data = data.astype({"age": np.float64, "fare": np.float64})
```

You'll see that the data type for two columns have also been changed to a 'float64' type.

Although we've changed the question mark to a 'Not a number' type, this can cause us some issues if we were to try and perform any analysis on it. So let's drop those rows which have 'Not a number' data:

```
data = data.dropna(axis=1)
```

(Setting the axis to 1 means it will drop columns, _not_ rows)

We have no cleaned the data - let's go and explore it and see if we can answer our question!

Let's remind ourselves of the question:

<blockquote>
Who was more likely to survive the Titanic, men or women?
</blockquote>

Let's try this:
```
sns.catplot(x="sex", y="survived", kind="bar", data=data)
```

Which results in....

![Graph](https://i.imgur.com/B2ma9fn.jpg)

Which is fine, it answers the question. But I think we can dig a little deeper! Let's take a look at our data set - what else could we use to analyse the data? The only column I see is the passenger class.

Let's take a look at using a Point Plot graph:
```
sns.pointplot(x="pclass", y="survived", hue="sex", data=data)
```

Which results in this graph:

![Graph](https://i.imgur.com/PqBZPcS.jpg)

Looks better!

There are other types of graphs that we can use, such as a bar graph:

```
sns.catplot(x="survived", y="sex", hue='pclass', kind="bar", data=data)
```

![Graph](https://i.imgur.com/VuwTfwI.jpg)

Or even a violin plot:

```
sns.catplot(x="survived", y="pclass", hue='sex', kind="violin", data=data)
```

![Graph](https://i.imgur.com/OYEK6DU.jpg)

Now we can tell a story and communicate our findings! From what we have gathered, we can determine that:

<blockquote>
Women were more likely to survive than Men. However, passengers in a higher class were even more likely to survive.
</blockquote>

Great! But let's take this another step further...

Let's calculate the percentage of surviving.

First, let's sort this data in regards to passengers who had siblings and/or spouses by creating a new column using a lambda expression:

```
#create a new column in the data called relatives
data['relatives'] = data.apply (lambda row: int((row['sibsp'] + row['parch']) > 0), axis=1)
```

This takes the values in two columns and adds them together. If the value is greater than 1, the value under the column 'relatives' will be 1.

And change the male or female data to 0 or 1:

```
data.replace({'male': 1, 'female': 0}, inplace=True)
```

And sort the data again by getting rid of any redundant columns and specifying which columns we want to keep.

```
data = data[['sex', 'pclass','age','relatives','fare','survived']].dropna()
```

Now we can train and evaluate our model by using SciKit learn:

```
from sklearn.model_selection import train_test_split
x_train, x_test, y_train, y_test = train_test_split(data[['sex','pclass','age','relatives','fare']], data.survived, test_size=0.2, random_state=0)
```

Here we split the dataset into training and validation data. We split the dataset as a way to estimate how well it would actually perform against data the model has not yet seen.

Now, we can normalise the models:

```
from sklearn.preprocessing import StandardScaler
sc = StandardScaler()
X_train = sc.fit_transform(x_train)
X_test = sc.transform(x_test)
```
Now we're sure that the ranges of values are all the same (because whilst the gender column will be 0 or 1, age can be 0-99).

Next, we can use the Naïve Bayes algorithm (used for classification problems)

```
from sklearn.naive_bayes import GaussianNB
model = GaussianNB()
model.fit(X_train, y_train)
```

With the trained model, let's use it against the test data that wasn't used in training.

```
from sklearn import metrics
predict_test = model.predict(X_test)
print(metrics.accuracy_score(y_test, predict_test))
```

This returns a result of 75%! Great!

And that about wraps it up!

Data analysis is something that interests me, the method of investigating and problem solving by using Python is something that I'm enjoying.

I am aware of a library called [PsyCopg](https://www.psycopg.org/) - a Postgres driver for Python. Since I recently did a course looking at Postgres/SQL, building a tool that can connect to my Postgres database and pull data from it and perform analysis on it might be a fun project to do!

Thanks for reading!
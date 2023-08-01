---
title: "Building the Postgres Toolbox, part one 🐘"
date: "2021-07-26"
---

So recently, I've been diving more into Data Analysis (which I've been really enjoying!) and I recently wanted to see if I could combine both my interest of hobbyist development and data analysis into a project! 🧐 And today I'm sharing the recent progress I've made on it. I'm calling this application the 'Postgres Toolbox' 🔮

This is going to be a fairly big project. I honestly think this will take several months to complete, as there is a lot to do! But also, this is my first 'real' project that uses the PyCharm IDE - something that's used by professionals!

If you want to take a look at the repo, you can find it [here](https://github.com/JB-26/postgres_toolbox) on GitHub (If you like it, give it a star!)

__Please remember that this is a work in progress!__

# What __is__ Postgres Toolbox?

Postgres Toolbox is a CLI application that allows you to:
- Connect to a Postgres database
- Save your login info to a JSON for faster login
- Run queries against your database
- Export your results to a CSV file
- Perform Data Analysis by using Seaborn to visualise your data

Currently, you can perform data visualisation on statistical data. Support for distributions of data and plotting categorical data is planned! 👨‍💻

The project will grow over time so who knows what new features will be added!

This post will look at connecting to a DB, running a query and then taking the results of the query and exporting them to a CSV file.

So let's jump in with connecting to a database.

# Connecting to a Postgres database

Before we can do anything, we need to connect to our Postgres database. So, we need a library that can do just that. For this project, I'm using a library called [psycopg](https://www.psycopg.org/).

So in order to connect to the database in Postgres, we need the following:
- Database name
- The user name
- The password
- The host
- The port

We can get this information from the user like so:

```
# get db info from user
print('Please enter the following information below.')
db_name = input('Enter the DB Name - ')
db_user = input('Enter the user name - ')
db_password = input('Enter the DB Password - ')
db_host = input('Enter the host name - ')
db_port = input('Enter the port - ')
```

But after a while of running the program and entering the details over and over again, I wanted to see if there was an easier way. So I decided to take the variables and write them to a JSON file:

```
print("Now saving DB info to JSON file....")
# create dictionary
db_dict = {'db_name': db_name, 'db_user': db_user, 'db_password': db_password, 'db_host': db_host, 'db_port': db_port}
# create json
json_file = json.dumps(db_dict, indent=4)
with open("db_info.json", "w") as outfile:
    outfile.write(json_file)
print('Complete! File saved as db_info.json')
```

And then on startup, the program checks to see if a JSON file exists:

```
if os.path.exists('db_info.json'):
    try:
        print('Found saved login - now reading...')
        # open JSON file and close it
        with open('db_info.json', 'r') as file:
            db_data = json.load(file)
            file.close()
        # unpack dictionary
        db_name = db_data['db_name']
        db_user = db_data['db_user']
        db_password = db_data['db_password']
        db_host = db_data['db_host']
        db_port = db_data['db_port']
```

This way, it can be quicker for the user to access the same database instead of typing in the same information over and over again.

So we can establish a connection to the database - now lets take a look at sending a query.

# Querying a connected database

Before we can begin querying the database we're connected to, we need to create a cursor.

```
# Open a cursor to perform database operations
cursor = connection.cursor()
print('Enter your query below')
query = input('')
print('Now executing...')
try:
    # execute query
    cursor.execute(query)
    result = cursor.fetchall()
```

After the cursor is created, we can ask the user for their query.

Executing a query is captured in a try/except statement - just in case the query is incorrect.

There is a problem that I discovered early on, the 'fetchall' method doesn't include the names of the columns.

The 'results' variable becomes a list, but doesn't have any of the column names. They must be stored somewhere in the cursor object right? Turns out, they are!

```
# extract the column names
col_names = []
for name in cursor.description:
    col_names.append(name[0])
```

The 'description' property is a tuple which holds the names of the columns. We take the first element of the tuple and append it to a dictionary. Here's the complete code for that:

```
try:
    # execute query
    cursor.execute(query)
    result = cursor.fetchall()
    # extract the column names
    col_names = []
    for name in cursor.description:
        col_names.append(name[0])
    df = pd.DataFrame(data=result, columns=col_names)
    print('Success! Would you like to export the results to a CSV file or view the results?')
    choice = input("""Enter 1 to export to CSV or 2 to view the results.
    \nEnter anything else to skip.""")
    if choice == '1':
        print('Now exporting...')
        df.to_csv('query_results.csv')
        print('Complete! File name is called query_results.csv')
    elif choice == '2':
        print(f'{df}')
    else:
        print('Skipping.')
    while True:
        print('Would you like to perform some data analysis on your results?')
        print('Type Y for yes or N for no')
        analysis_choice = input().upper()
        if analysis_choice == 'Y':
            analyse_data(df)
            # close connection
            cursor.close()
            break
        elif analysis_choice == 'N':
            print('Returning to the main menu...')
            # close connection
            cursor.close()
            break
        else:
            print('Invalid command - try again!')
except OperationalError as e:
    print(f"The error {e} occurred!")
```

So how do we use the 'results' variable and the 'col_names' dictionary to create a CSV file?

# Writing a CSV file

As seen above, we use Pandas to create a data frame and then use the built in functionality.

```
print('Now exporting...')
df.to_csv('query_results.csv')
print('Complete! File name is called query_results.csv')
```

Now we have a CSV file exported for the user which has the column headers!

And that about covers what I wanted to cover today on part one of the Postgres Toolbox 🐘 It's been fun putting the program together and make something that can pull data from a database.

Next time, I'll look at how we use the dataframe and create graphs to visualise the data in Seaborn.

Thanks for reading! 👏
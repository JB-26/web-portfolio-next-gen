---
title:  "Calling an external API in C# (and more!)"
date:   '2019-08-13'
---

As part of my journey of learning to code - I previously built a small application that allows a user to exchange money. I built the application in C# and was pretty happy with how it turned out. I knew there was room for improvement however so I spoke to a colleague to get some advice on what to do next.

What was suggested was to call an API.

It sounded like a good idea to me - why rely on hard coded values when you can pull up to date exchange rates from an API instead?

It turns out, calling an external API is more difficult than I thought in C#. (Remember - I'm very new at this!)

I figured for this blog post, I'd go into detail about calling an API in C#.

First off, I need to find an API to call from! For this, I used the [Foreign Exchange Rates API](https://exchangeratesapi.io/). This uses rates from the European Central Bank.

So, in this case. The program will ask the user for their name and what currency they want to use as the base currency to find exchange rates for other currencies.

Thankfully, the API has a scenario for that!

```
GET https://api.exchangeratesapi.io/latest?base=USD HTTP/1.1
```

Alright, now we need to work out a way to call this in C#!

First things first. Create some strings and store the URL in one of them.

```
string html = string.Empty;
string url = "https://api.exchangeratesapi.io/latest?base=";
url += userChoice;
```

As you can see, when the user enters the three characters for a currency (i.e. GBP) then that is added to the end of the URL (and is also used in other areas later on).

Now we move onto using the HttpWebRequest, Stream and StreamReader class to:
- Store the HTTP response
- Read the body of the response from the server
- Read characters from a byte stream

```
//create local variable of HttpWebRequest, which initialises WebRequest
HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
request.AutomaticDecompression = DecompressionMethods.GZip;

//new local variable to store the HTTP response
using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
//new local variable to read the body of the response from the server
using (Stream stream = response.GetResponseStream())
//new local variable to read characters from a byte stream
using (StreamReader reader = new StreamReader(stream))
{
  html = reader.ReadToEnd();
}
```

I admit that this is a lot of work and I could use HttpClient instead. This is an area that I can refactor in the future.

So now we have read the API and have stored the result in the html string (which was previously defined as empty).

The next step is to deserialize the JSON string to a custom .NET object. (For those wondering, serialize does the opposite)

```
//deserialize JSON to specified .NET type
var jsonVar = JsonConvert.DeserializeObject<RateResponse>(html);
//parse the html string into something more readable
//create local variable schema
JSchema schema = JSchema.Parse(html);
```

You may notice that I call JSchema to parse the html string into a variable called schema. JSchema is an in-memory representation of a JSON schema and will be used when we want to print the rates to a text file.

The jsonVar variable is part of the RateResponse class, which contains a dictionary with a get and set method. This will be useful later on.

Now that we've called it and stored it in a variable, let's use it!

There are three areas where the JSON is used:
- Viewing exchange rates
- Swapping currency from one to another
- Printing the rates to a text file

We'll start with viewing exchange rates - which is a simple foreach statement where it iterates through each currency. jsonVar calls the rates dictionary (the key and value being the name of the currency and the rate of said currency) in the RateResponse class.

```
//iterate through each currency in the JSON file and print the name and value
foreach (var newCurrency in jsonVar.rates)
{
    Console.WriteLine(newCurrency.Key + " - " + newCurrency.Value);
}
```

For swapping currency, it's also straight forward.

```
Console.Write("Enter how much currency you want to swap!\n");
double input = Convert.ToDouble(Console.ReadLine());
Console.Write("You entered " + input + userChoice + "\n");
Console.Write("Type in a 3 digit code (such as GBP, USD, JPY) for which currency you want to compare with\n");
string compare = Console.ReadLine();
Console.Write("Here's what you can get for your money!\n");
//accessing the rates dictionary to find a currency the user specified (and calculate how much money the user will receive)
Console.Write("For " + input + userChoice + " - you can get " + jsonVar.rates[compare] * input + compare);
```

After finding out how much money the user wants to swap and which currency they want to convert it to:
- the rates dictionary is used to find the currency the user specified
- then the amount of money the user will get is performed by multiplying the original amount by the rate of the requested currency

Finally, we have printing the rates to a text file.

```
//confirm to user that file has been writtne, using the WriteAllText method
string file = Convert.ToString(schema);
File.WriteAllText(path, file);
Console.WriteLine("File Written: " + path);
Console.WriteLine("Press enter to return to Main Menu");
Console.ReadKey();
```

For this part, I took the JSON schema and stored the value into a string called file (are converting it to a suitable format). Not much has changed since the first iteration of this area so I won't go into too much detail here.

Overall, I'm really happy with how this turned out! There are a few more areas that I can improve on and add additional functionality down the line.

For example, the API I call can retrieve records from the year 1999 onwards! So I could incorporate that into the program.

I'm hoping this helps someone out there who may be new to programming or might not be sure how to call an API in C#.

Thanks for reading!
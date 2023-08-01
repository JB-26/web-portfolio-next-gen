---
title:  "Version 1.0 of my C# Currency Converter has been released!"
date:   '2019-10-05'
---

So, you may remember about my C# [project](https://gitlab.com/JoshBl_/csharp-currency-convertor) where I called an API to convert currency.

Today - I'm happy to say that this is now considered complete! 🎉

But what's changed?

Well....

- Unit Test added (based on XUnit)
- Methods added
- Improved error handling on entering username
- Improved error handling on entering a base currency
- Improved error handling on printing file to directory
- Improved error handling on selecting how much money you want to exchange and currency you want to exchange to

So, a lot of work has been done!

Let's take a look!

```
bool nameValid = false;
//checking for valid username
while (nameValid == false)
{
    Console.WriteLine("Hello user! What is your name?");
    //setting user name in a string
    userName = Console.ReadLine();
    double nameChecker = 0;
    if (string.IsNullOrEmpty(userName) || double.TryParse(userName, out nameChecker))
    {
        Console.WriteLine("That doesn't look right! Try again!");
    }
        else
        {
            //printing the user name
            Console.WriteLine("Ah - so your name is " + userName + "? Pleased to meet you!");
            nameValid = true;
        }
}
```

So, when the user prompted to enter their name, the user has to enter a name which isn't a number or empty.
This is kept in a while loop so the user has to enter a string of some kind to proceed.

Next, we have improvements to where the user enters the base currency.


```
//while loop to ensure that if the user enters anything except a string, it will loop until the user enters a string.
bool attempt = false;
while (attempt == false)
{
    Console.WriteLine("Please set the base currency! Enter a three digit code (such as GBP, USD, JPY):");
    string userChoice = Console.ReadLine();
    currencyChoice = userChoice.ToUpper();
    double value = 0;
    if (double.TryParse(currencyChoice, out value) || string.IsNullOrEmpty(userChoice))
    {
        Console.WriteLine("Error! Input is invalid! Try again!");
    }
    else
    {
    Console.WriteLine("You have selected " + currencyChoice);
    //grabbing the API
    html = string.Empty;
    string url = "https://api.exchangeratesapi.io/latest?base=";
    url += currencyChoice;

    //create local variable of HttpWebRequest, which initialises WebRequest
    HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
    request.AutomaticDecompression = DecompressionMethods.GZip;

    try
    {
        //new local variable to store the HTTP response
        using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
        //new local variable to read the body of the response from the server
        using (Stream stream = response.GetResponseStream())
        //new local variable to read characters from a byte stream
        using (StreamReader reader = new StreamReader(stream))
        {
            html = reader.ReadToEnd();
            //sets bool to true, ends while loop
            attempt = true;
        }
    }
    //catches any errors
    catch (Exception e)
    {
        Console.WriteLine("Error!");
        Console.WriteLine(e);
    }
    }
}
```

So first, there is a check to make sure if the user enters a blank/null entry or if the result can be parsed to a double variable. If they do, they will prompted to enter a valid choice.
After that if statement, there is a try/catch statement. If the user inputs a base currency which returns a status code 400 then they are prompted to enter a valid choice.

With these changes, the program will ensure that the user enters a valid choice before the API is called and the JSON is deserialised. This prevents errors and improves the user experience.

Next up - changes to the switch statement!

```
switch(selectMenu)
    {
        case "V":
            ViewCurrencyRates(jsonVar);
            break;

        case "S":
            SwapCurrency(jsonVar);
            break;

        case "P":
            PrintRates(schema);
            break;

        //quit application, changes bool check to false
        case "Q":
            Console.WriteLine("Exiting the application\n");
            check = false;
            Console.Write("So long, " + userName + "!");
            Console.ReadKey();
            break;

        //if user types any other value, display error message
        default:
            Console.WriteLine("ERROR! Please type a valid command!");
            break;
    }
```

That's right - I've introduced methods! This makes the code much cleaner (and easier to debug if something went wrong so I can focus on a particular method).

Speaking of the methods, I've made some changes as well to them to improve how they handle errors, lets look at swapping currency.

```
double newCheck;
    while (isInt == false)
    {
        Console.Write("Enter how much currency you want to swap!\n");
        string value = Console.ReadLine();
        if (double.TryParse(value, out newCheck))
        {
            input = Convert.ToDouble(value);
            isInt = true;
        }
        else
        {
            Console.WriteLine("Error! Input is not a number!");
        }

    }

    Console.Write("You entered " + input + currencyChoice + "\n");

    while (valueCheck == false)
    {
        Console.Write("Type in a 3 digit code (such as GBP, USD, JPY) for which currency you want to compare with\n");
        try
        {
            string temporary = Console.ReadLine();
            //converting to upper to prevent errors
            string compare = temporary.ToUpper();
            //converting to upper to prevent errors
            compare = temporary.ToUpper();
            //accessing the rates dictionary to find a currency the user specified (and calculate how much money the user will receive)
            double result = entry.rates[compare] * input;
            //ensuring that the result is displayed with 2 decimal places
            result = Math.Round(result, 2);
            Console.Write("Here's what you can get for your money!\n");
            Console.Write("For " + input + currencyChoice + " - you can get " + result + compare);
            //prevents the screen from being filled with the main menu, allows user to focus on the data in front of them
            Console.Write("\nPress enter to go back to menu!");
            valueCheck = true;
            Console.ReadKey();
        }
        catch (Exception e)
        {
            Console.WriteLine("Error!");
            Console.WriteLine(e);
        }
    }
```

So similar to the where the user inputs the base currency, the swap method has similar code. It checks to make sure that the user is entering a number first when entering the amount of currency to swap, then checks to make sure the requested currency exists in the dictionary.

So now the program will loop until the user meets the requirements are met.

Moving on to the Print Rates method:

```
while (printLoop == false)
    {
        //obtain path for location where file should be written to
        string path = Console.ReadLine();
        //adding the file name and file format at the end
        path += "\\rates.txt";

        //check to make sure the file doesn't exist
        if (File.Exists(path))
        {
            //print path in message
            Console.WriteLine("ERROR! A file already exists here! " + path);
            Console.WriteLine("Please try again!");
        }
        //if file doesn't exist...
        else
        {
            //try-catch block for writing file and error handling
            try
            {
                //confirm to user that file has been writtne, using the WriteAllText method
                string file = Convert.ToString(entry);
                File.WriteAllText(path, file);
                Console.WriteLine("File Written: " + path);
                Console.WriteLine("Press enter to return to Main Menu");
                printLoop = true;
                Console.ReadKey();
            }
            catch (Exception error)
            {
                //print error
                Console.WriteLine(error);
                Console.WriteLine("Plese try again!");
            }
        }
    }
```

Now the whole process is in a while loop - and the loop only exits when the file is successfully written to a location.

And finally, we have a unit test to ensure that all 33 currencies are being called from the API.

This unit test was done in XUnit.

```
using currencySwap;
using Newtonsoft.Json;
using System;
using System.IO;
using System.Net;
using Xunit;

namespace Unit_Tests
{
    public class UnitTest1
    {
        [Fact]
        //ensures all rates are pulled
        public void RatesArePulled()
        {
            //arrange
            string html = string.Empty;
            string url = "https://api.exchangeratesapi.io/latest?base=GBP";
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
            var jsonVar = JsonConvert.DeserializeObject<RateResponse>(html);
            //act and assert
            Assert.Equal(33, jsonVar.rates.Count);
        }
    }
}
```

The way this test is presented is arrange, act and assert. This is a standard used when writing unit tests. (Oh, if you change the value in the Equal statement to anything but 33, it will fail as intended).

And that's it for this update on my C# project!

Please feel free to clone/download the project.

If you have any feedback, please let me know.

Next time - TypeScript! (And why I like it so much!)

Thanks for reading!
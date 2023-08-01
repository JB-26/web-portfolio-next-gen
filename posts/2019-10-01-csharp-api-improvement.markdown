---
title:  "C# API project improvements"
date:   '2019-10-01'
---

Apologies for the delay on this post, I've been in America recently! Since I'm still recovering from jet lag, here's a small post for this week.

Today, I'm going to explain several changes I made to this [project](https://gitlab.com/JoshBl_/csharp-currency-convertor) - my currency converter written in C#.

These changes are small improvements to error handling.

Let's jump in with changes to the very beginning, where the user sets the base currency.

```
Console.WriteLine("Please set the base currency! Enter a three digit code (such as GBP, USD, JPY):");
string userChoice = Console.ReadLine();

//convert choice to uppercase - prevent errors when user types in lowercase
string currencyChoice = userChoice.ToUpper();

//integer declared for checking if user entered any numbers
int value;

//check to make sure the user has entered a string
//if not, exit the program
//we use TryParse to attempt to parse currencyChoice to value - if it's successful - exit program
if (int.TryParse(currencyChoice, out value))
{
  Console.WriteLine("Error! Input is not a string! Press enter to exit program!");
  Console.ReadKey();
  Environment.Exit(0);
}
else
{
  Console.WriteLine("You have selected " + currencyChoice);
}
```

So, first the input is now converted to uppercase as the API expects the base currency to be in uppercase only. With that being set to uppercase that will make things a bit more user friendly.

Moving on, we have a new if statement to check if the user entered an integer and not a string. This is achiveved by using the 'TryParse' method by passing in the currencyChoice string as an argument. With the output set to value (an integer). If the parse is successful, then something isn't right. In this scenario, the program will exit by using 'Environment.Exit(0)'. If the parse fails, then the choice is confirmed.

I added the conversion to upper for strings in the swap currency selection as well:

```
Console.Write("Type in a 3 digit code (such as GBP, USD, JPY) for which currency you want to compare with\n");
string temporary = Console.ReadLine();
//converting to upper to prevent errors
string compare = temporary.ToUpper();
```

So there you have it - small changes to improve error handling and the overall user experience!

Next time, I'll be taking a look at performing get requests, coverting to a Hash and iterating through it in Ruby!

Thanks for reading!
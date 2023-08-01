---
title:  "Code walkthrough of: C# Currency Converter"
date:   '2019-08-10'
---
Hello and welcome to my first 'Code walkthrough' post! I've recently decided to take learning to code a bit more seriously lately, and I decided whenever I make a small project applying what I've learnt and explaining my thought process.

Today, I'll be doing a code walkthrough on my C# project; currency converter! The project can be found on my GitLab page [here](https://gitlab.com/JoshBl_/csharp-currency-convertor)

So let's get started on what the program can do:

- The program takes a user input of how much money (in pounds) and tells them how much they get in Dollars and Yen.
- The currency rate for Dollars and Yen can also be changed.
- The user can view the current currency rates.
- The rates of the currencies can be printed to a text file.
- The user can quit the program.

As there are going to multiple currencies (three to be exact) - I figured it would be a good idea to create a class for currencies:

```
//new class for creating different currencies
public class Currency
{
//new private variables defined
private string name, symbol;
private double value;
//setter method
public void setValues(string name, string symbol, double value)
{
    this.name = name;
    this.symbol = symbol;
    this.value = value;

//new method for changing currency value
public void setRate(double value)
{
    this.value = value;

//getter methods
public string getName()
{
    return name;

public string getSymbol()
{
    return symbol;

public double getValue()
{
    return value;
}
}
```

I thought that since each currency will share similar properties - such as the name, symbol and value, I created a class for them with methods to get, set and another method to change the value specifically (I'll come back to this later).

Let's take a look at the first part of the program:

```
//console title
Console.Title = "Currency Swap";
//create new objects of currencies outside of loop
Currency Pound = new Currency();
Currency Dollar = new Currency();
Currency Yen = new Currency();
//set values for currencies outside of loop
Pound.setValues("British Pound", "£", 1);
Dollar.setValues("US Dollar", "$", 1.2);
Yen.setValues("Japanese Yen", "¥", 120.3872
Console.WriteLine("Hello user! What is your name?");
//setting user name in a string
string userName = Console.ReadLine();
//printing the user name
Console.WriteLine("Ah - so your name is " + userName + "? Pleased to meet you!");
Console.Write("Lets swap some currency!\n");
//setting the boolean value for check to true, to be used in the while loop
bool check = true;
```

- We can see that the title of the console application is set.
- New objects for the currencies are created.
- For each currency object, the method of set values is called (with arguments)
- The user is asked to enter their name (stored in a string)
- A boolean called check is defined and set to true.

The point of the boolean value is to help create a user menu that loops.
The actual menu itself is held within a switch statement

```
while(check == true)
{
    //menu - reads input from user
    Console.WriteLine("Main Menu - type a key to access the function");
    Console.Write("(V)iew currency rates\n");
    Console.Write("(S)wap currency\n");
    Console.Write("(C)hange rates\n");
    Console.Write("(P)rint rates\n");
    Console.Write("(Q)uit\n");
    
    //gets input from user
    string choice = Console.ReadLine();
    //inserts the string of choice into the switch statement
    switch(choice)
```

The variable choice holds the users input, which is then passed to the switch statement.

If the user quits (by inputting Q) - then the boolean variable check is changed to false - which then ends the while loop.

```
//quit application, changes bool check to false
case "Q":
    Console.WriteLine("Exiting the application\n");
    check = false;
    Console.Write("So long, " + userName + "!");
    Console.ReadKey();
    break;
```

If the user enters anything else, this triggers the default statement.

```
//if user types any other value, display error message
default:
    Console.WriteLine("ERROR! Please type a valid command!");
    break;
```

Alright, lets take a look at when the user wants to view the currency rates.

```
case "V":
    //displays currency rate to user
    //objects use get methods to display values
    Console.WriteLine("View Currency Rates\n");
    Console.WriteLine(Pound.getName() + " " + Pound.getSymbol() + " " + Pound.getValue());
    Console.WriteLine("Current Rates for " + Pound.getName());
    Console.WriteLine(Dollar.getName() + " " + Dollar.getSymbol() + " " + Dollar.getValue());
    Console.WriteLine(Yen.getName() + " " + Yen.getSymbol() + " " + Yen.getValue());
    Console.WriteLine("Press enter to return to Main Menu");
    Console.ReadKey();
    break;
```

For this part, each currency object uses the get methods defined in the Currency class.
Afterwards, the user needs to press the enter key to return to the menu (as the boolean value hasn't changed)

Moving on, lets take a look at when the user wants to swap an amount of pounds to Dollars or Yen!

```
case "S":
    //allows user to swap Pounds to different currency
    Console.WriteLine("Swap Currency\n");
    Console.Write("NOTE: Swapping British Pound only!\n");
    Console.Write("Enter how much currency you want to swap!\n");
    //as the actual rate for a currency is a double, new variable is converted from a string to a double
    double input = Convert.ToDouble(Console.ReadLine());
    Console.Write("You entered " + input + " pounds!\n");
    Console.Write("Here's what you can get for your money!\n");
    //uses the input from the user and calculates how much money the user gets in Dollars and Yen
    Console.WriteLine(Dollar.getName() + " " + Dollar.getSymbol() + input * Dollar.getValue());
    Console.WriteLine(Yen.getName() + " " + Yen.getSymbol() + input * Yen.getValue());
    //prevents the screen from being filled with the main menu, allows user to focus on the data in front of them
    Console.Write("\nPress enter to go back to menu!");
    Console.ReadKey();
    break;
```

In this area, the user can enter an amount of how much they want to swap. Then, this input is then multiplied by the current value of Dollars and Yen (which is then displayed for the user).

Then, the user has to press enter to go back to the main menu (it makes reading the information easier to read instead of having the main menu being displayed alongside the data)

Now we move onto a nested switch statement for the next area - changing the rates for Dollars and Yen!

```
case "C":
    Console.WriteLine("Change rates\n");
    Console.WriteLine("Please select which currency rate you wish to change");
    Console.WriteLine("(Y)en");
    Console.WriteLine("(D)ollar\n");
    //another switch statement to read input from user for which currency rate to change
    string currency = Console.ReadLine();
    switch(currency)
    {

        //if user wants to change the rate for Yen
        case "Y":
            Console.WriteLine("Change rate for Japanese Yen\n");
            Console.WriteLine("Please state the new rate for Japanese Yen\n");
            //variable to set the new rate from user (converted to double from string)
            double newYen = Convert.ToDouble(Console.ReadLine());
            //calls setRate method while passing the newYen double as an argument
            Yen.setRate(newYen);
            Console.WriteLine("\nThe rate for Japanese Yen has been changed!");
            Console.WriteLine("The new rates are as follows:");
            //display info on currency
            Console.WriteLine(Yen.getName() + " " + Yen.getSymbol() + " " + Yen.getValue());
            break;

            //if user wants to change the rate for Dollar
            case "D":
                Console.WriteLine("Change rate for US Dollar\n");
                Console.WriteLine("Please state the new rate for US Dollar\n");
                //variable to set the new rate from user (converted to double from string)
                double newDollar = Convert.ToDouble(Console.ReadLine());
                //calls setRate method while passing the newDollar double as an argument
                Dollar.setRate(newDollar);
                Console.WriteLine("\nThe rate for US Dollar has been changed!");
                Console.WriteLine("The new rates are as follows:");
                //display info on currency
                Console.WriteLine(Dollar.getName() + " " + Dollar.getSymbol() + " " + Dollar.getValue());
                break;

                //default for error handling
                default:
                    Console.WriteLine("ERROR! Please input a valid command");
                    break;
                }
                break;
```

So this is quite similar to what I've covered previously. If the user enters Y or D then the user can set a new rate for the currency.

The new rate is stored within a double variable and is then passed as an argument to the setRate method in the Currency Class.

Finally, the information on the currency is displayed.

So that's cool and all but what if the user wants to print the currency rate information to a text file?

That's where the next area comes in!

```
case "P":
                        Console.WriteLine("Print rates\n");
                        Console.Write("Please specify the location of where you want the file to be written to\n");

                        //create variable of contents with currency object values
                        string contents = "Currency Rates\n";
                        contents += Pound.getName() + " " + Pound.getSymbol() + " " + Pound.getValue();
                        contents += "\n";
                        contents += Dollar.getName() + " " + Dollar.getSymbol() + " " + Dollar.getValue();
                        contents += "\n";
                        contents += Yen.getName() + " " + Yen.getSymbol() + " " + Yen.getValue();

                        //obtain path for location where file should be written to
                        string path = Console.ReadLine();
                        //adding the file name and file format at the end
                        path += "\\rates.txt";

                        //check to make sure the file doesn't exist
                        if(File.Exists(path))
                        {
                            //print path in message
                            Console.WriteLine("ERROR! A file already exists here! " + path);
                            break;
                        }
                        //if file doesn't exist...
                        else
                        {
                            //try-catch block for writing file and error handling
                            try
                            {
                                //confirm to user that file has been writtne, using the WriteAllText method
                                File.WriteAllText(path, contents);
                                Console.WriteLine("File Written: " + path);
                                Console.WriteLine("Press enter to return to Main Menu");
                                Console.ReadKey();
                                break;
                            }
                            catch(Exception error)
                            {
                                //print error
                                Console.WriteLine(error);
                                Console.WriteLine("Press enter to return to Main Menu");
                                Console.ReadKey();
                                break;
                            }
                        }
```

First things first, the contents of the file is stored within a string called contents. It uses the get methods for each currency and each currency is on it's own line.

Now the user is asked to enter a file location to where the text file will be written to, which is then stored in a string called path. You'll notice that after the user specifies the path, the file name and format is added onto the end (makes it easier instead of asking the user to specify what the file is called and what the format is).

Of course, there is error handling. We have an if statement first to check if the file already exists. If it doesn't - then the else statement is activated.

This leads to a try/catch block for writing the file. If it's successful, the user sees where the file is written to.

If it isn't, then the Exception is caught and displayed to the user.

And that's it! A pretty simple program, but it's a good excuse to put to practice what I've learnt recently.

I plan to revisit this once I'm used to calling API's so I can pull real time currency rates for Dollars and Yen.

Thanks for reading!
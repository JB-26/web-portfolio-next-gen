---
title:  "Code walkthrough of: Ruby Bank project"
date:   '2019-08-27'
---

Recently, I've been learning about Ruby. I completed a course on CodeCademy about it and I thought I'd take a stab at making a project and expand on it over time.

For those who are unfamiliar with Ruby, it's a great language to learn if you are new to programming and introduces concepts such as object orientated programming. In fact, this blog was made through a Ruby Gem called [Jekyll](https://jekyllrb.com/)!

So I decided to take the last project from the CodeCademy tutorial and expand on it. I'll go through what I do for each step and explain a bit about Ruby as I go.

If you're unfamiliar with the Ruby language - check out this link [here](https://www.ruby-lang.org/en/about/).

If you want to view the code, visit my GitLab [project](https://gitlab.com/JoshBl_/ruby-bank-interface-project).

Anyway, let's get started!

For this project, it will be a simple banking interface. The user can view their balance, deposit money, and withdraw money. But before that, the user has to register.

I plan to make improvements to this so I think of this as laying the foundations.

This might seem like a simple project to some, but as someone who is learning, it's a good opportunity to put what I've learnt into practice.

First things first, we need a class!

```
#class defined
class Account
    #read the name and balance variables
    #to use the reader, the attributes need to be symbols!
    attr_reader :name, :balance, :pin
    #method to set the values for name and balance
    #balance is an optional variable, if balance isn't given a value, then 100 will be provided
    def initialize (name, balance=100, pin)
        @name = name
        @balance = balance
        @pin = pin
    end

    #stating public method
    public
    def display_balance (pin_number)
        #ternary expression
        puts pin_number == pin ? "Balance $#{balance}." : pin_error
    end

    #public method
    public
    def withdraw (pin_number, amount)
        #checking if the supplied pin number is correct
        if pin_number == pin
            #perform maths
            @balance -= amount
            #display new amount and withdrawn amount
            puts "Withdrew #{amount}, balance is $#{@balance}"
        else
            pin_error
        end
    end

    #public method
    public
    def deposit (pin_number, amount)
        if pin_number == pin
            #perform maths
            @balance += amount
            #display new amount and deposit amount
            puts "Deposited #{amount}, balance is $#{@balance}"
        else
            pin_error
        end
    end

    #private method
    private
    def pin_error
        return "Access denied: Incorrect pin"
    end
end
```

If you're unfamiliar with Ruby, let me explain this.

```
attr_reader :name, :balance, :pin
```

So, this is the attribute reader. This is a short hand version of:

```
def name
  @name
end
```

And the attributes are passed as a symbol to the reader.

Now we need to initialise some variables for when we create an instance of our class. Which is where this method comes into play.

```
def initialize (name, balance=100, pin)
  @name = name
  @balance = balance
  @pin = pin
end
```

When we create a new instance of this class, we'll pass values to these variables. However, if no value for 'balance' is specified, then a value of 100 will be provided. The '@' symbol means that those variables are instance variables. This means that a variable is attached to an instance of a class.

After that, we have several methods for displaying the balance, withdraw and deposit. You'll notice that there is a private method, which can only be used inside the object. If we want to access this method, we need a public method to access it. By default, all methods are public!

Let's move on, we need to create an instance of that class!

```
puts "Hello and welcome to Josh Bank in Ruby!"
puts "Please enter your username!"

#get user input and assign it to username variable
username = gets.chomp

puts "Pleased to meet you - #{username}"
puts "Now - enter your starting balance"

#get user input and assign it to startingBalance variable
#stored as an integer
startingBalance = gets.chomp.to_i
puts "Your starting balance will be #{startingBalance}"

#get user input and assign it to userPin
#stored as an integer
puts "Enter your PIN"
userPin = gets.chomp.to_i
puts "Your PIN will be #{userPin}"

puts "Lets create your account!"

#creating test object of the Account class
test_account = Account.new(username, startingBalance, userPin)

puts "Account created!"
```

So, we ask for the user's name. This is stored under the variable username and 'gets.chomp' gets input from the user. In this case, the variable will be a string.

Then, we do the same for the balance but add 'to_i' at the end of gets.chomp. This changes the variable into an integer (which will be handy when we want to subtract and add later on)

Now if you're familiar with my previous project (the C# currency one), you know what's coming next....

```
#creating a new boolean variable, setting to true by default
check = true

#while loop to ensure that the user stays within the menu unless the user quits
while check == true
    puts "Welcome to the main menu. Enter a command!"
    puts"(D)isplay balance"
    puts "(W)ithdraw balance"
    puts "De(P)osit"
    puts "(Q)uit"
    choice = gets.chomp

    #case statement used to create multiple choice menu
    case choice
    when 'D'
        #stored as an integer
        puts "Enter your pin to view your balance!"
        pinInput = gets.chomp.to_i
        puts test_account.display_balance(pinInput)
    when 'W'
        puts "Enter your pin!"
        pinInput = gets.chomp.to_i
        puts "Enter how much you want to withdraw"
        #stored as an integer
        withdrawAmount = gets.chomp.to_i
        puts test_account.withdraw(pinInput, withdrawAmount)
    when 'P'
        puts "Enter your pin!"
        pinInput = gets.chomp.to_i
        puts "Enter how much you want to deposit!"
        #stored as an integer
        depositInput = gets.chomp.to_i
        puts test_account.deposit(pinInput, depositInput)
    when 'Q'
        check = false
        puts "Bye!"
    #else for catching errors
    else
        puts "Error!"
    end
end
```

That's right - it's another while loop with a case statement! (The case statement is very similar to a switch statement)

So, we declare a new boolean variable (check) which is set to true. Then, the while loop will always loop while check is equal to true. The only way to exit the program is to press 'Q' which will then change the value to false and exit the while loop.

Whenever a user enters a valid character, then they will be prompted to enter their pin and depending if they want to deposit or withdraw money, then they are prompted to enter a value.

Let's take a look at each of the methods.

We'll start with displaying the balance:

```
#stating public method
    public
    def display_balance (pin_number)
        #ternary expression
        puts pin_number == pin ? "Balance $#{balance}." : pin_error
    end
```

For this method, a ternary expression is used to check if the entered PIN is correct. If not, then it runs the pin_error method which returns a message.

Let's take a look at the withdrawing method:

```
public
    def withdraw (pin_number, amount)
        #checking if the supplied pin number is correct
        if pin_number == pin
            #perform maths
            @balance -= amount
            #display new amount and withdrawn amount
            puts "Withdrew #{amount}, balance is $#{@balance}"
        else
            pin_error
        end
    end
```

Here, we have an if/else statement where it checks to make sure if the PIN entered matches the PIN set. If it doesn't match then the pin_error method is run.

If it does match however, then it will take the instance variable of balance and subtract the amount from it. This will also update the value held by the balance variable (by using the '-=' operator).

And finally, we the deposit method:

```
public
    def deposit (pin_number, amount)
        if pin_number == pin
            #perform maths
            @balance += amount
            #display new amount and deposit amount
            puts "Deposited #{amount}, balance is $#{@balance}"
        else
            pin_error
        end
    end
```

This method is very similar to the withdraw method but it takes the instance variable of balance and add the amount to it. This will update the value held by the balance variable (by using the '+=' operator).

And that concludes this code walkthrough! I enjoy Ruby, it's a good language which is very accessible for those who are new to programming. I'll update this project with additional functionality in the future as I learn more about Ruby.

Be sure to check back here next week for my next post.

Thanks for reading!
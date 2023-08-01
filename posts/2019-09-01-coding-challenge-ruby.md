---
title:  "Coding Challenges in: Ruby"
date:   '2019-09-01'
---
I'm currently learning Ruby at the moment and I thought I'd challenge myself by doing several coding problems and document them here.

All the code mentioned in this post can be found on my GitLab [here](https://gitlab.com/JoshBl_/ruby-coding-challenges).

So, let's kick things off with a famous one.

<h1>FizzBuzz</h1>

Ahh yes, FizzBuzz! Known to be used in tech interviews around the world. Here's what the challenge involves:

- Write a program that prints 1 to 100
- For numbers divisible by 3, print "Fizz"
- For numbers divisible by 5, print "Buzz"
- For number divisible by 3 and 5, print "FizzBuzz"

Sounds simple right? I'll break things down for each step. Let's get to it!

So, printing 1 to 100 is going to require a loop of some kind.

```
counter = 1

while counter <= 100
    puts counter
    counter+=1
end
```

As you can see, this while loop will continue to print the variable 'counter' until it is no longer less than or equal to 100!
In the loop, after printing the variable to the screen, the value is incremented by 1.

Okay, that's done - next it needs to print "Fizz" if it is divisible by 3, "Buzz" if it is divisible by 5 or "FizzBuzz" if it is divisible by 3 and 5.

```
counter = 1

while counter <= 100
    if counter % 3 == 0 && counter % 5 == 0
        puts "FizzBuzz"
    elsif counter % 3 == 0
        puts "Fizz"
    elsif counter % 5 == 0
        puts "Buzz"
    else
        puts counter
    end
    counter+=1
end
```

And if we run the program, we will see this!

```
1
2       
Fizz    
4       
Buzz    
Fizz    
7       
8       
Fizz    
Buzz    
11      
Fizz    
13      
14      
FizzBuzz
```

Looks good! 6 is divisible by 3 so that prints Fizz, 10 is divisible by 5 so that prints Buzz and 15 is divisible by both so it prints FizzBuzz!

<b>However...</b> what if I did this?

```
while counter <= 100
    if counter % 3 == 0
        puts "Fizz"
    elsif counter % 5 == 0
        puts "Buzz"
    elsif counter % 3 == 0 && counter % 5 == 0
        puts "FizzBuzz"
    else
        puts counter
    end
    counter+=1
end
```

That will result in....

```
1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
Fizz
```

Whoah! That doesn't look right! Why?

It all lies in the order of where the if statements are placed. In the example above, we can see that the first if statement checks if it is divisible by 3, if it is - it prints Fizz, if not, it will check if it is divisible by 5.

Which means that in every scenario it will never hit that final elsif statement! So if we move that statement to the front, it will always check each number if it is divisible by 3 and 5. Then, check if it is divisible by 3 or 5 individually.

Problem solved! ✔

<h1>Chessboard</h1>

The summary of the problem is:

<i>Write a program that creates a string that represents an 8×8 grid, using newline characters to separate lines. At each position of the grid there is either a space or a "#" character. The characters should form a chessboard.</i>

In fact, this problem came from the Eloquent Javascript book! (Which is excellent by the way)

Let's get to it!

Would you believe it that I struggled with this one?

I get lost in the various different states of loops.

Seriously, I started off with this (in an attempt to draw <i>something</i> to the console.):

```
#define the size of the board
size = 4
#blank string - this is intentional
board = ""

#x axis
x = 0

#y axis
y = 0

#variable to determine when to add a new line
counter = 0

while x <= size
    board += "# "
    x += 1
    if counter > 1 && counter <= 4
        board += "\n"
        board += "# "
        x -= 1
        if y <= 4
            board += "# "
            y += 1
        end
    end
    counter += 1
end

puts board
```

And the output was this:

```
# # #
# # #
# # #
# # # # #
```

Not only is the code messy and unreadable in places but it also doesn't print a square!

So, I took this back to basics of Ruby - if I'm doing something too complex, then I'm doing it wrong.

And in which, I came up with this:

```
#define the size of the board
size = 8
#blank string - this is intentional
board = ""

#x axis
x = 0

#y axis
y = 0

#variable to determine when to add a new line
counter = 0

while x <= size
    8.times {board += "# "}
    x += 1
    if y <= size
        board += "\n"
    end
    y += 1
end

puts board
```

Which in turn prints...

```
# # # # # # # #
# # # # # # # #
# # # # # # # #
# # # # # # # #
# # # # # # # #
# # # # # # # #
# # # # # # # #
# # # # # # # #
# # # # # # # #
```

Hooray! An 8 x 8 Chessboard!

Problem solved! ✔

<h1>Finding Duplicates</h1>

Finally, we have a problem from the website Ruby Guides.

The problem is...

<i>Given an array with Integer values you need to find all the duplicated numbers.</i>

This is another one that I struggled with - but it got me to think on my feet and research dfferent ways on how to solve the problem.

Let's get to it!

So, we need an array with duplicate integer values for us to find duplicate numbers.

```
#array defined with duplicate numbers
numbers1 = [1,2,2,2,3,3,4,5]
```

But after that, how do I write a method that finds duplicated elements? Maybe a for each statement?

I was eventually getting frustrated so I turned to the internet (or more specifically Stack Overflow). Eventually I found about the use of the built in method called [find-all](https://ruby-doc.org/core-2.6.4/Enumerable.html#method-i-find_all).

So this returns an array containing all elements of enumerable for which the given block (the code inbetween curly brackets) returns a true value. If there isn't a block, an enummerator is returned instead.

With this in mind, I did some more research and found a way to use the code block in find-all to return duplicates. My research lead me to [count](https://ruby-doc.org/core-2.5.1/Enumerable.html#method-i-count). Which is used to return a number of items through enumeration.

So if we can return an array with all the elements and then return a number of items, we can use that to find duplicates in an array!

I decided to write a method which has an if statement to determine if the array has any duplicates to begin with.

To achieve this, I used [uniq](https://ruby-doc.org/core-2.4.1/Array.html#method-i-uniq). Like so:

```
if array.uniq.length == array.length
        puts "No duplicates!"
    else
        puts "There are duplicates"
```

So putting this all together, I wrote this to solve the problem:

```
#method called find duplicates, takes in array as an argument
def find_duplicates (array)
    #if the array length with unique values is equal to all elements in the array
    if array.uniq.length == array.length
        puts "No duplicates!"
    else
        puts "There are duplicates"
        #using the find_all method to return all elements from Enumerable.
        #then between the curly brackets, we check each element (e) in the array if there is a duplicate element in the array.
        array.find_all { |e| array.count(e) > 1 }
    end
end

#array defined with duplicate numbers
numbers1 = [1,2,2,2,3,3,4,5]

puts find_duplicates(numbers1)
```

Which gives the output of...

```
There are duplicates
2
2
2
3
3
```

As we can see, it prints the duplicates to the console!

Problem solved! ✔

<h1>Lessons learned</h1>
I've learnt a lot by doing these exercises:
- Take the opportunity to do challenges, it expands your knowledge and problem solving skills.
- Take your time, no rush. It doesn't hurt to take a break and do something else if you are struggling.
- Don't beat yourself up if you get it wrong!

I hope you've enjoyed reading this post, expect more Ruby soon!

Thanks for reading!

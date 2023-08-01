---
title: "Coding Problems Part 2 - zigzags! 📈"
date: "2021-11-21"
description: "Who knew trying to create a zigzag from a string could be so difficult?"
image: https://images.unsplash.com/photo-1432821596592-e2c18b78144f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2070&q=80
---

![Desk](https://images.unsplash.com/photo-1432821596592-e2c18b78144f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2070&q=80)

Welcome to part two of my coding problems series. Today, we’ll be looking at an interesting problem that had me scratching my head, it got to a point where I needed to look at the solution to the problem.

However, it was a learning experience which I think I learnt some handy tricks to do in Python.

As always, you can take a look at the repo I have for this problem [here](https://github.com/JB-26/DailyCodingProblem) (and be sure to check the commit history!)

Here’s the problem:

> Given a string and a number of lines (k), print the string in zigzag form.  
> In zigzag, characters are printed out diagonally from top left to bottom right until reaching the k line, then back up to top right, and so on.  
>   
> Example:  
> Sentence is “thisisazigzag” and k = 4 will print:  
>   
> t        a           g  
>   
>  h     s   z       a  
>   
>   I  I       I   z  
>   
>    s           g  

I originally thought that was was going to be a problem that I could solve. But the more I thought about it, I realised that this was going to be a difficult problem to solve.

Originally I approached the problem in several ways:

* Convert  the sentence to a list, then iterate over each item in the list with spaces and print them to the console. But I realised that this wasn’t possible as I need to descend and ascend to from the zigzag.
* Then I went down the route of concatenating parts of the zigzag to a string. But still needed to think of how to make the zigzag descend and ascend when needed.

After several attempts (and several days), I decided to take a look at the answer and I could feel my mind unlock something about programming that I had been working towards for a while.

The biggest obstacle for me on this problem was on how to approach ascending and descending to build the zigzag.

The solution suggested the following
* Create a list of empty strings which is the length of the sentence that was provided.
* Check if descending if the current row through oscillation back to the starting point.
* If it’s descending, add spaces, else remove spaces.

The part of how to create the list made something click in my brain on understanding programming.

```
line = [" " for _ in range(sentenceLength)]
```

Creating the list using a for statement made a lot of sense. I decided to take another stab at trying to figure out an algorithm for adding and removing spaces. I couldn’t get far as I struggled of getting all the needed characters for each line with the appropriate spacing.

That’s where things get slightly complex.

For calculating the spaces needed, the following algorithm is suggested.

```
# function for getting spaces
def get_spaces(row, desc, k):
    # calculate the maximum space length
    spaceLength = (k - 1) * 2 - 1

    # check if descending (add spaces)
    if desc:
        spaces = spaceLength - row * 2
    # or if ascending (remove spaces)
    else:
        spaces = spaceLength - (k - 1 - row) * 2

    return spaces
```

The maximum space length is calculated by: 
* Taking the number of lines (k) and subtracting 1
* Multiplying by 2
* Subtracting by 1

If the descending boolean value was true,  then spaces are added. If it’s false, then spaces are removed. 

For checking if it’s descending:

```
# function for checking if descending
def is_desc(index, k):
    # back to the starting point - will return true or false
    # compares calculated result to the sentence length - 1
    return index % (2 * (k - 1)) < k - 1
```

This will take the current row of the zigzag and the number of lines. And calculate if the current row (calculating the remainder, multiplying it by the number of lines minus one) and if that value is less than the number of lines minus one. This will return a boolean.

So, let’s put this all together!

```
# THE PROBLEM
# Given a string and a number of lines (k), print the string in zigzag form.
# In zigzag, characters are printed out diagonally from top left to bottom right until reaching the k line, then back up to top right, and so on.
# Example
# Sentence is "thisisazigzag" and k = 4 will print:
#
# t        a           g
#  h     s   z       a
#   i  i       i   z
#    s           g

# create string
sentence = "thisisazigzag"
# number of lines
k = 4

def zigzag(sentence, k):
    # get sentence length
    sentenceLength = len(sentence)

    for row in range(k):
        i = row
        # creates a list of spaces (strings)
        line = [" " for _ in range(sentenceLength)]

        # this while loop takes the list and populates it with the correct value from the sentence (on both sides of the zigzag)
        while i < sentenceLength:
            # check if zigzag is descending or not
            line[i] = sentence[i]
            desc = is_desc(i, k)
            newSpaces = get_spaces(row, desc, k)
            i += newSpaces + 1

        print("".join(line))

# function for getting spaces
def get_spaces(row, desc, k):
    # calculate the maximum space length
    spaceLength = (k - 1) * 2 - 1

    # check if descending (add spaces)
    if desc:
        spaces = spaceLength - row * 2
    # or if ascending (remove spaces)
    else:
        spaces = spaceLength - (k - 1 - row) * 2
    return spaces

# function for checking if descending
def is_desc(index, k):
    # back to the starting point - will return true or false
    # compares calculated result to the sentence length - 1
    return index % (2 * (k - 1)) < k - 1

zigzag(sentence, k)
```

So that’s the zigzag! I learnt a lot on _how_ to approach a problem. What’s important is that attempting to solve it allowed me to explore different ideas and expand my knowledge.

Trying to solve these problems is a good way of testing on how much you know of a language. It’s all well and good making small applications but these problems challenges your thinking.

Next time, why should you start a blog?

Thanks for reading! 👏
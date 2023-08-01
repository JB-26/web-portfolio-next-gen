---
title: "Coding Problems - Part 1"
date: "2021-10-19"
description: "Solving coding problems!"
image: https://images.unsplash.com/photo-1539627831859-a911cf04d3cd?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1742&q=80
---

![Problem solving](https://images.unsplash.com/photo-1539627831859-a911cf04d3cd?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1742&q=80)

This week, I decided to take a look at solving (or trying to) coding problems!

It's all well and good understanding the syntax and building applications but I wanted to challenge myself by attempting to solve some coding problems. In the first part of this series, I'll be taking a look at some problems and showing you how I solved them. It's good to tackle these sorts of problems, I find it engages you to _think_ and you could learn something new!

If you want to take a look at the code for each of the problems, check out the repo on [GitHub!](https://github.com/JB-26/DailyCodingProblem) The language used to solve these problems is Python.

If you solve these problems, please do share your solution!

Let's jump in with the first problem!

### Get products of all elements in an Array

_The problem_
> Given an array of integers, return a new array such that each element at index i of the new array is the product of all the numbers in the original array except the one at i
>
> Example: an array of 1, 2, 3, 4, 5 will return 120, 60, 40, 30, 24

Okay, shouldn't be too bad.

Here's how I solved this problem.

```
arry = [1,2,3,4,5]
# this will return 120, 60, 40, 30, 24

# function 
def productArray(arry):
    # array for calculations
    calculateArry = []
    arryLength = len(arry)
    print(f"Length of array - {arryLength}")

    for position in arry:
        print("Print integer in position")
        print(position)

        # copy the array
        arryCopy = arry.copy()

        # get the index position of element
        indexPostion = arryCopy.index(position)

        # remove the appropriate element in the array
        arryCopy.pop(indexPostion)

        # length of the copied array
        arryCopyLength = len(arryCopy)

        timesMultiplied = 1
        arryPostion = 0

        print("First calculation!")
        print(f"Value 1 - {arryCopy[arryPostion]}")
        print(f"Value 2 - {arryCopy[arryPostion + 1]}")
        newValue = arryCopy[arryPostion] * arryCopy[arryPostion + 1]

        while timesMultiplied < arryCopyLength - 1:
            print(f"Multiplying {newValue} by {arryCopy[arryPostion + 2]}")
            newValue = newValue * arryCopy[arryPostion + 2]
            timesMultiplied += 1
            arryPostion += 1
    
        # add the calculated value to a new array
        calculateArry.append(newValue)

    # return new array
    return calculateArry
    

# call function and print new array
sortedArry = productArray(arry)
print(sortedArry)
```

This might be a lot to take in so I'll break it down.

Here's how my thinking went for this:
- Copy the array to a new array and remove the element that we're using in the for loop. This prevents using the element in the loop in any calculations
- Store the length of the copied array in a new variable
- Create new variables to track the array position and the number of times multiplied
- Do a first calculation of the first two elements and store the result in a variable
- In a while loop, multiply the value by other elements in the array (and increment the times multiplied and the array position)
- Add the new value to the empty array
- After the loop has complete, return the new array!

This isn't the best way of solving it. There are _much_ better ways. But I'm glad that I was able to solve it!

### Finding number of smallest elements to the right.

_The problem_
> Given an array of integers, return a new array where each element in the new array is the number of smaller elements to the right of that element in the original input array.
>
> Example; [3, 4, 9, 6, 1] returns [1, 1, 2, 1, 0]

A unique problem involving arrays!

Here's my solution to the problem:

```
arry = [3, 4, 9, 6, 1]

def smaller_counts(arry):
    smallerArry = []

    for index, i in enumerate(arry):
        counter = 0
        # nested for loop when it reaches the end of the array it stops
        for x in arry[index + 1:]:
            if x < i:
                counter += 1
        smallerArry.append(counter)
    
    # return the new array
    return smallerArry
        

# call function
result = smaller_counts(arry)
print (f"Original input - {arry}")
print(f"Result - {result}")
```

So, the function creates an empty array to store the result. Then, in a for loop (with using enumerate to get the value and index), I use a nested for loop to loop through the array with a plus one to ensure the loop looks at the next value. This loop won't go out of bounds when looking at the next array if it's the last element in the array.

If the value from the first loop is less than the second value in the nested for loop, the increment the counter value. At the end of the loop, take the value of the counter and append it to the new array (which is then returned).

A good result!


### Locate the smallest window.

_The problem_
>Given an array of integers that are out of order, determine the bounds of the smallest window that must be sorted in order for the entire array to be sorted.
>
>The array, [3, 7, 5, 6, 9], should return (1,3)

This is a problem that I had to look at the answer for. I had a bit of trouble figuring this one out!

```
array = [3, 7, 5, 6, 9]

def window(array):
    # new variables that are empty
    left, right = None, None

    print(left)
    print(right)

    # sort the array to start with
    s = sorted(array)
    print(f"Unsorted - {array}")
    print(f"Sorted - {s}")

    # range will return a tuple of integers that represent the first and last of the number of elements in the array
    for i in range(len(array)):
        # print the value of i
        print(i)
        # if the element in the original array doesn't match the element in the sorted array AND left is None
        if array[i] != s[i] and left is None:
            # left will equal the index value
            left = i
        elif array[i] != s[i]:
            right = i
    
    #this will return a tuple
    return left, right

# run the function!
result = window(array=array)

print(result)
```

Since the result needs to be a tuple, two new variables that have the value of None are created (left and right). The array is then sorted into a new variable, the original array and sorted array will be compared. If the element in the original array doesn't match the element in the sorted array and left is none, then left is equal to the value. However, if the value in the original array doesn't match the value in the sorted array, then right will equal the value.

Once the loop has finished, then return the values of left and right.

I tripped up a few times in trying to figure how to calculate the bounds of the smallest window. However, I learnt from the solution which was good!

And that wraps up this weeks post!

I'll post some more coding problems soon.

Thanks for reading! 👍
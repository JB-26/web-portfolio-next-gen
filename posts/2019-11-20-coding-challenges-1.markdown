---
title:  "Coding Challenges - Part 1"
date:   '2019-11-20'
---

Recently, I've been reading [Cracking the Coding Interview](http://www.crackingthecodinginterview.com/) so I can practice at solving coding problems and puzzles, and for this new blog series I'm going to be exploring the problems from the book and attempt to solve them in different programming languages. It's a good way to practice in languages and a way to practice <i>thinking</i> in the correct way. Part 1 will be looking at three problems in C#.

The code for these problems can be found in the [repo](https://gitlab.com/JoshBl_/coding-challenges).

Let's get started with the first problem!

<h1>Is Unqiue</h1>

The problem is:

<i>Implement an algorithm to determine if a string has all unique characters. What if you cannot use additional data structures?</i>

Here's the code:

```
using System;

namespace IsUnique
{
    class Program
    {
        //this challenge is from 'Cracking the coding interview', 6th edition
        //challenge is - Is Unique.
        //implement an algorithm to determine if a string has all unique characters. What if you cannot use additional data structures?

        //new method, defined as a static string as it will return the result in a form of a string
        //argument is a string
        static string IsUniqueCharacters(string str)
        {
            //takes the passed in argument and converts it to a char array
            char[] array = str.ToCharArray();

            //now we sort the array - this sorts it into a one dimensional array
            Array.Sort(array);

            //for loop, as long as i is less than the array length - do the following (the increment by 1)
            for (int i = 0; i < array.Length -1; i++)
            {
                //if the adjacent element are NOT equal - move onto the next element!
                if (array[i] != array[i + 1])
                    //passes control to the next iteration of the for loop
                    continue;
                else
                    //if any character is not unique - return the following string
                    return "Not unique!";
            }
            //if all characters in the array are unique, return the following string
            return "Unique!";
        }
        static void Main(string[] args)
        {
            Console.Title = "Is Unique";
            Console.WriteLine("Coding challenge - Is Unqiue");
            Console.WriteLine(IsUniqueCharacters("New"));
            Console.WriteLine(IsUniqueCharacters("test"));
            Console.WriteLine(IsUniqueCharacters("AAAAA"));
            Console.WriteLine(IsUniqueCharacters("ABCD"));
        }
    }
}
```

This was an interesting problem to solve and I learnt a bit more about C# along the way after doing some research. I learnt about the 'continue' statement, which passes control to the next iteration of the for loop.
I'd start by taking the string and creating a char array based on the string that's passed in the argument. Then, I'd sort it into a one dimensional array.

The for loop is where the magic happens - as long as 'i' is less than the array length, compare an element in the array and compare it to element adjacent to it. If they are not equal, skip it, move onto the next element.

If it can't find any character that is not unqiue, it will return the message "Not unique!", but if it iterates through the whole array and all characters are unique, it will return the message "Unique!"

Great! Problem solved! ✔

Next problem!

<h1>Check Permutation</h1>

<i>Given two strings, write a method to decide if one is a permutation of the other.</i>

Here's the code:

```
using System;

namespace CheckPermutation
{
    class Program
    {
        //this challenge is from 'Cracking the coding interview', 6th edition
        //challenge is - Check Permutation
        //given two strings, write a method to decide if one is a permutation of the other

        //permutation method - takes a string as an argument
        //int s = start of index
        //int e = end of index
        private static void permutation (String str, int s, int e)
        {
            //if s and e are equal, print the string
            if (s == e)
            {
                Console.WriteLine(str);
            }
            else
            {
                //as long as i is less than or equal to the length of e, run the following 
                for (int i = s; i <= e; i++)
                {
                    str = swap(str, s, i);
                    //recursion - take the current value of the string and integers
                    permutation(str, s + 1, e);
                    str = swap(str, s, i);
                }
            }
        }
        
        //swap characters at postion
        //a = string 
        //i = position 1
        //j = position 2
        //this method will return a swapped string
        public static String swap (String a, int i, int j)
        {
            char temp;
            //new char array created based on input string
            char[] charArray = a.ToCharArray();
            //temp value is a letter of an array (int i)
            temp = charArray[i];
            //the letter held within i is swapped with j
            charArray[i] = charArray[j];
            //the letter held with j is swapped with the temp char variable
            charArray[j] = temp;
            //a new string is created based on the swap
            string s = new string(charArray);
            //return new string
            return s;
        }

        static void Main(string[] args)
        {
            Console.Title = "Check Permutation";
            Console.WriteLine("Check Permutation");

            //new string
            String str = "ABC";
            //integer value is length of string (so 3 in this case)
            int n = str.Length;
            //call method
            permutation(str, 0, n - 1);
        }
    }
}

```

So, what is string permutation? Good question, I didn't know myself at first. (Remember, I'm an aspiring junior dev!) Permutation is the rearrangement of the elements of an ordered list into a one-to-one correspondence with itself. So if I have the string 'ABC' - I want to see all the combination of this returned. So, it would return 'ABC', 'ACB', 'BAC', 'BCA', 'CBA', and 'CAB'.

So - this is a little tricky. The permutation method takes in three arguments. The string, the beginning of the index and the end of the index. It checks if the start and end are equal, if they are, then return the string. If not, it moves onto the for loop. This in turn calls the swap method.
This method takes the string and the index values as arguments. It starts by taking the string and creating a char array. A variable called temp holds the value of the array based on the value in i (a number in this case). Then, the letter held in the array is then swapped with the letter held in the position of j. A new string called s is then created based on the swap, this string is then returned.

Then, through recursion, the permutation method is called again. However, the beginning index is incremented by 1. So it will do the first if statement and find that both the index and end index values aren't the same, so it goes back to the for loop. And this will repeat until that both index values are the same - which will then return the value to the user.

At this point, it's completed the recursion call, and goes back to the swap method. This loop continues until i is greater than e.

Complex! I had to do some research myself to understand it.

Great! Problem solved! ✔

Our final problem for this post...

<h1>String Compression</h1>
<i>Implement a method to perform basic string compression using the counts of repeated characters (i.e. aabccccaaa would be a2b1c5a3), if the compressed string isn't smaller than the original string - return the original string. We can assume the string has uppercase and lowercase letters.</i>

Here's the code:

```
using System;

//this challenge is from 'Cracking the coding interview', 6th edition
//challenge is - String Compression
//Implement a method to perform basic string compression using the counts of repeated characters.
//i.e. aabccccaaa would be a2b1c5a3
//if the compressed string isn't smaller than the original string - return the original string
//we can assume the string has uppercase and lowercase letters

namespace StringCompression
{
    class Program
    {
        //output string defined
        public static string compressedString;
        public static int stringCompress(string input)
        {
            //count integer defined
            int count = 0;
            //take the input into a character array
            char[] array = input.ToCharArray();
            Console.WriteLine(array);

            //increment through each element
            for (int i = 0; i <= array.Length; i++)
            {
                Console.WriteLine(array);
            }
            return count;
        }

        static void Main(string[] args)
        {
            Console.WriteLine("String Compression");
            Console.WriteLine(stringCompress("aaabbc"));
        }
    }
}
```

So as you can tell, it's not done yet. That's because I haven't figured it out yet and researching this issue online hasn't been successful. I'm working on this and I'll post an update on this problem again in the future when I have a solution. Maybe you have an idea on how to solve this problem? 🤔 If you do, drop me a line!

I hope you've enjoyed this first part of this new series.

I'm not sure when the next part will be - but it'll be in the future!

Next time, I look at the most wanted language on StackOverflow - Python! 🐍

Thanks for reading!
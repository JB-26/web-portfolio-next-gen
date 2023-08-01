---
title: "Monitoring your bandwidth with Python! 📈"
date: "2021-01-02"
---

Happy new year! 🎉

To kick things off, I wanted to share a small side project I've been working on. This was listed as a challenge in my Python Udemy course so I thought I'd share my solution.

The challenge was to build an application that monitors your bandwidth, with the option of displaying a graph at the end.

If you want to see the code for this, click [here](https://gitlab.com/JoshBl_/python-bandwidth-monitor) for the code.

I used a mix of some Python modules and a little bit of data science to complete this.

There's several areas that I need to improve (such as error handling) but if you want to take a look at how the process of recording works, then read on!

## Modules used

For this challenege I used several modules:

* psutil

So this is the key module that will provide us with the information we need for monitoring the bytes we receive and send. This module can also provide information on the CPU, Memory, Disks and other system info. It's pretty amazing of how much it can do!

You can view more information for psutil [here](https://pypi.org/project/psutil/)

* matplotlib

Necessary for making a graph so we can plot the bytes received and sent onto the graph. A really powerful module with so many types of graphs and options to customise the graph (such as the line style and markers).

You can view more information for matplotlib [here](https://matplotlib.org/index.html)

* datetime

This is needed for getting the time from the user for when the program needs to stop recording network usage.

This module is already available in Python.

## Getting started

Let's understand first on how we actually capture network information with psutil.

So let's look at the documentation on the psutil website (see [here](https://psutil.readthedocs.io/en/latest/#network))

<blockquote>
Return network I/O statistics as a namedtuple including the following fields:

bytes_sent: number of bytes sent

bytes_recv: number of bytes received
</blockquote>

Interesting! So we can get the value for the number of bytes sent and received using those two fields. Let's keep this in mind!

What's important to note is that this will record the number of **bytes** - so if we want to show how many megabytes a user has used in a period of time then we need to do some maths to get it displayed in a readable manner.

So the way how I imagined this program works would be the following:
1. Get the current time
2. Ask the user what time should the program stop recording
3. Start recording 
4. Send the bytes sent and recieved to lists to be used in the graph
5. Stop recording once the specified time has been reached
6. Inform the user how much data was sent and received (measured in MB)
7. Display the graph

So let's grab the current time and format it

```
currentTime = datetime.datetime.now().time().strftime("%H:%M:%S")
```

The reason why we're formatting the time to be in HH:MM:SS will become clear in a little bit.

Also, let's create some lists

```
bytesSnt = []
bytesRec = []
bytesSntX = []
bytesRecY = []
```

The first two lists will be used to calculate (in MB) how much data was sent and received. The other two lists are for the graph created in matplotlib (where we won't be doing any calculations).

Let's move on to getting the time from the user for when the program should stop recording.

```
print('Set the time when you want the network monitoring to stop')
hour = int(input('Enter the hour - '))
minute = int(input('Enter the minute - '))
second = int(input('Enter the second - '))
setTime = datetime.time(hour,minute,second)
setTime = str(setTime)
```

Once we have the hour, minute and seconds from the user, we create a new variable (using the datetime module) which will hold the time from the user. This is then converted into a string.

Now that we have the time, we can begin the process of creating a graph with matplotlib.

```
plt.title(label=f'Bandwidth Usage from {currentTime} to {setTime}')
plt.xlabel('Bytes Sent')
plt.ylabel('Bytes Received')
print(f'Now monitoring network usage - monitoring will stop at {setTime}')
```

Now comes the part of recording the network usage from your machine!

```
while currentTime != setTime:
    currentTime = datetime.datetime.now().time().strftime("%H:%M:%S")
    bytesSnt.append(psutil.net_io_counters().bytes_sent / 1000000)
    bytesSntX.append(psutil.net_io_counters().bytes_sent)
    bytesRec.append(psutil.net_io_counters().bytes_recv / 1000000)
    bytesRecY.append(psutil.net_io_counters().bytes_recv)
```

I decided to go with a while loop which records the network usage until the time set by the user is reached.

The while loop itself will send the bytes sent and received to two lists.

* bytesSnt (while dividing the current value by 1,000,000 to convert to MB)
* bytesSntX for the matplotlib graph
* bytesRec (while dividing the current value by 1,000,000 to convert to MB)
* bytesRecY for the matplotlib graph

When the loop finishes, we need to display the results.

```
print('Monitoring complete!')
totalSent = int(sum(bytesSnt) / 1000000)
totalRec = int(sum(bytesRec) / 1000000)
print(f'You sent a total of {totalSent} MB')
print(f'You received a total of {totalRec} MB')
plt.plot(bytesSntX, bytesRecY)
plt.show()
```

We take the results for the total sent and received and divide the sum by 1,000,000 to work out the data in MB. As for the graph, it is displayed and looks something like this!

![matplotlib Screenshot](https://i.imgur.com/gzSPv9s.jpg)

And the console will display something like this!

```
Monitoring complete!
You sent a total of 133 MB
You received a total of 298 MB
```

And that's it! That's monitoring how much bandwidth you're using in Python. It's not finished yet, as there are a few areas that I could improve and clean up but it's interesting to track the data usage through psutil.

Be sure to check out the link to the repo to view the code.

Thanks for reading! 👋
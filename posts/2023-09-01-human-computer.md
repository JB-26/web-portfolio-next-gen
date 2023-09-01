---
title: "How AI is an opportunity for human and computer cooperation"
date: "2023-09-01" #YYYY-MM-DD
tags: ["Professional"]
---

Artificial intelligence is *everywhere* on the news and blogs around the world right now, for better or for worse. You can’t escape from it.

From how companies have agreed to safeguards, Hollywood writers going on strike because of the threat AI, a new research lab in [Tokyo](https://sakana.ai/), to even [BT planning to cut 55K jobs with up to a fifth being replaced by AI](https://www.bbc.co.uk/news/business-65631168) (which I think is a terrible idea). Not a day goes by without a new article about AI is being shared around the world. At times, it’s quite frightening at how fast AI development is going.

Sure, there is plenty of doom and gloom around how AI is going to automate jobs etc, but I think we should view AI as an opportunity to improve human and computer cooperation, and not to replace humans. I believe that the opportunity of improved human and computer cooperation will allow us to solve incredibly complex problems.

To back this hypothesis up, I decided to use ChatGPT (version 3.5) in helping me write parts of this website.

The areas that I used ChatGPT for this website are:

- Pagination on the blog page
- Implementing an RSS feed
- Pinned post feature
- Tags on posts

To be clear, I didn’t go to ChatGPT and say ‘give me the code for a blog, with styling, that’s built using NextJS that has pagination, RSS, pinned posts and tags on posts’. I built a large majority of this blog myself, but when it came to areas that I wasn’t confident in developing myself, I turned to AI for a helping hand.

The way I approached this was this:

- I provided ChatGPT a clear explanation of what I wanted, including what framework I was using.
- I provided ChatGPT of what I was working with (so I included code snippets)
- If I encountered an error, I’d share the error message with ChatGPT and work with it to debug the issue

And the end result was that, despite some small issues (and on one occasion, I corrected ChatGPT), you can see that pagination, an RSS feed, the pinned post feature and post tags are working correctly.

I was honestly surprised at how easy it was to work with ChatGPT to get these features working locally. I thought I’d have to spend hours working through error messages or rewording the question so that it could clearly understand what I wanted. I think the longest I spent debugging an issue with ChatGPT was probably twenty minutes.

I did, for an experiment, ask ChatGPT the following question:

> Can you write me the code for a blog built with NextJS?
> 

And it did bring back an example of a blog that was built with NextJS. But would I consider it something was ready for everyone to see? No, far from it. The response ChatGPT provided was extremely bare bones.

Take a look at this question I asked ChatGPT:

> I have a blog built with NextJS and I fetch my markdown posts like this:
>
> `code snippet here`
>
>How can I find a specific post by name?
 

In my question about finding a specific post by name, I provided ChatGPT the context of what I was working with. The answer I received improved the code I provided and was easy to implement.

Providing the context also improved the debug experience (because I am not the best engineer). I told ChatGPT what error I was getting and the code I had written. And majority of the time, ChatGPT told me what the issue was and how to solve it.

Here’s the [link](https://chat.openai.com/share/b133295e-88c8-47e1-b970-702d054de9a9) to the conversation I had with ChatGPT about implementing an RSS feed and here’s an example of the code it generated:

```jsx
import RSS from "rss";
import { metadata } from "../../components/page"; // Replace this with your site's metadata file

export async function generateRssFeed() {
    const baseUrl = metadata.siteUrl; // Replace this with your blog's base URL
    const feed = new RSS({
        title: metadata.title,
        description: metadata.description,
        feed_url: `${baseUrl}/rss.xml`,
        site_url: baseUrl,
        image_url: `${baseUrl}/favicon.ico`, // Replace this with your blog's favicon URL
        managingEditor: metadata.author,
        webMaster: metadata.author,
        language: metadata.language,
    });

    // Your code for generating the RSS feed items here...

    // Return the XML string for the RSS feed
    return feed.xml();
}

export default async function handler(req, res) {
    const feedXml = await generateRssFeed();
    res.setHeader("Content-Type", "text/xml");
    res.write(feedXml);
    res.end();
}
```

Not bad, right?

Sure, it’s not perfect. Asking ChatGPT to find a way to embed YouTube videos into a markdown file that uses `remark` is a scenario where it gets stuck. But, it did attempt it. This is something that I will need to revisit in the future.

Now some may ask, ***“If you were stuck with this to begin with, why didn’t you turn to Stack Overflow or something?”*** And my response to that question is the hostility of these communities is what drives me away. Why should I post a question and receive awful responses on something I’m trying to do? [Similarweb](https://www.similarweb.com/blog/insights/ai-news/stack-overflow-chatgpt/) found that traffic to Stack Overflow was down by 13.9% in March this year, which could be linked to the popularity of ChatGPT.

Greg Brockman gave a [TED talk](https://www.ted.com/talks/greg_brockman_the_inside_story_of_chatgpt_s_astonishing_potential) about the potential of ChatGPT and it really shows how these tools can enhance human and computer cooperation. In the talk, Greg said:

> I think this really shows the shape of something that we should expect to be much more common in the future, where we have humans and machines kind of very carefully and delicately designed in how they fit into a problem and how we want to solve that problem. We make sure that the humans are providing the management, the oversight, the feedback, and the machines are operating in a way that's inspectable and trustworthy. And together we're able to actually create even more trustworthy machines. And I think that over time, if we get this process right, we will be able to solve impossible problems.
> 

Towards the end of the talk, Greg said the following:

> And if there's one thing to take away from this talk, it's that this technology just looks different. Just different from anything people had anticipated. And so we all have to become literate. And that's, honestly, one of the reasons we released ChatGPT.
> 

And this is true, computer literacy is a life skill that is incredibly important today and for the future. The [Financial Times](https://www.ft.com/content/b1b710a1-6d12-43e5-8508-ae4584a7289a) reported that 10.7mn job postings requiring computer literacy ranged from HR roles to nursing. Microsoft released a [report](https://news.microsoft.com/en-gb/2021/11/17/universities-we-cant-solve-the-uks-digital-skills-gap-on-our-own/) about what work is needed to close the digital skills gap.

And hey, maybe this is a better time than ever to go back and read a post I wrote about [how we can solve the digital skills shortage.](https://www.joshblewitt.dev/posts/2021-04-02-digital-skills-shortage) Or even [why the Milton Keynes tech community is important.](https://www.joshblewitt.dev/posts/2023-03-26-MK-tech)

Let’s get back on track about the main topic of AI being an opportunity for human and computer cooperation. In my example for getting features on my blog, the human, had some knowledge, but required the cooperation of a computer to help with a more complex task.

The idea of human and computer cooperation isn’t new. In 2012, Shyam Sankar gave a [TED talk](https://www.ted.com/talks/shyam_sankar_the_rise_of_human_computer_cooperation) on the same subject. Shyam speaks on how we could improve human-computer symbiosis. We should design humans into the process, and not think about what the computer needs to do to solve the problem. 

Garry Kasparov, the famous chess grandmaster who played IBM’s Deep Blue, said in a [TED Talk](https://www.ted.com/talks/garry_kasparov_don_t_fear_intelligent_machines_work_with_them/transcript?autoplay=true) that:

> What I learned from my own experience is that we must face our fears if we want to get the most out of our technology, and we must conquer those fears if we want to get the best out of our humanity
> 

Garry also said the following regarding how in 2005, a pair of American chess players operating three PCs, won a chess tournament:

> A weak human player plus a machine plus a better process is superior to a very powerful machine alone, but more remarkably, is superior to a strong human player plus machine and an inferior process. This convinced me that we would need better interfaces to help us coach our machines towards more useful intelligence.
> 

And:

> Our technology excels at removing difficulties and uncertainties from our lives, and so we must seek out ever more difficult, ever more uncertain challenges. Machines have calculations. We have understanding. Machines have instructions. We have purpose. Machines have objectivity. We have passion. We should not worry about what our machines can do today. Instead, we should worry about what they still cannot do today, because we will need the help of the new, intelligent machines to turn our grandest dreams into reality.
> 

We do need to ensure that the development of AI is safe. The World Ethical Data Foundation [released](https://openletter.worldethicaldata.org/en/openletter/) a new framework for developing AI safely. The framework has a range of questions for people working an AI product, the working group and of the algorithms or models. I think it’s important that the industry does adopt a framework to ensure safe development of AI.

I saw recently that [Bletchley Park](https://www.bbc.co.uk/news/technology-66604123) is going to host the first summit on AI safety this November. It’s not known which world leaders will be attending this, but it’s a start which hopefully will get the ball rolling on safety.

Let’s take a look at the article I mentioned about BT cut jobs and replace them with AI again. Could you imagine what customer service would be like if it was run by ChatGPT *today*? It would be a disaster! AI would need to improve massively by the end of the 2020’s (which is when BT wants to complete it’s restructuring).

In fact, Meta's president of global affairs (and former deputy prime minister) Nick Clegg [said](https://www.bbc.co.uk/news/technology-66238004) the "hype has somewhat run ahead of the technology". And that current AI models are "quite stupid". 

Yejin Choi gave a [TED Talk](https://www.ted.com/talks/yejin_choi_why_ai_is_incredibly_smart_and_shockingly_stupid) about how smart ***and*** stupid AI can be. Towards the end of the talk, Yejin said this:

> We're now entering a new era in which AI is almost like a new intellectual species with unique strengths and weaknesses compared to humans. In order to make this powerful AI sustainable and humanistic, we need to teach AI common sense, norms and values.
> 

I also do wonder how much running an AI for BT would cost. Not just the cost of training the model but the cost of ***running*** the model to handle requests from customers. I’ve had some experience with cloud computing platforms such as Microsoft Azure and if you’re not careful, the cost of using these platforms can be very expensive.

If there’s anything that everyone should remember from this post, it’s this; calculators did not replace mathematicians, it only enhanced their work.
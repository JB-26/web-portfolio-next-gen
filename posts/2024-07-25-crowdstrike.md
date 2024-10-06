---
title: "Lessons everyone can learn from the Crowdstrike issue"
date: "2024-07-25" #YYYY-MM-DD
tags: ["Blog"]
ogImage: "public/images/opengraph-image.png"
description: "Let's not push to production."
---

On Friday 19th July 2024, airports, TV stations, banks, shops, healthcare and more around the world were disrupted after cybersecurity firm [Crowdstrike](https://www.crowdstrike.com/en-us/), deployed an update which impacted Windows. Crowdstrike later [said](https://www.crowdstrike.com/blog/statement-on-windows-sensor-update/) it had found a defect in the content update, a fix was deployed, and that Mac and Linux hosts were not impacted.

But since affected Windows machines were encountering the famous ‘Blue Screen of Death’, they couldn’t retrieve the update to resolve the issue, and would need to be started in safe mode. This would mean that *every* impacted machine would need to be *manually* fixed. This could take weeks to complete. Just think that someone needs to get to *each* computer affected, which is time consuming.

Microsoft said the issue impacted [8.5 Million devices](https://www.theverge.com/2024/7/20/24202527/crowdstrike-microsoft-windows-bsod-outage) and [created a tool](https://www.theverge.com/2024/7/21/24202883/microsoft-recovery-tool-windows-crowdstrike-issue-it-admins) to help IT admins recover from the issue. Meanwhile, Crowdstrike’s stock went down as a result of this issue and the CEO issued an [apology](https://www.crowdstrike.com/blog/to-our-customers-and-partners/). Plus, [scammers](https://www.wired.com/story/crowdstrike-outage-support-scams/) are now taking advantage of the situation.

Even now, airline [Delta](https://time.com/7002213/delta-under-investigation-department-of-transportation/) is still struggling to recover from the incident. The US Department of Transportation have opened an investigation into Delta to ensure they comply with passenger protection laws.

Crowdstrike have released a [post incident review](https://www.crowdstrike.com/falcon-content-update-remediation-and-guidance-hub/) about what happened and there are a few things that stood out to me.

First, the top level view of what happened:

> Template Instances are created and configured through the use of the Content Configuration System, which includes the Content Validator that performs validation checks on the content before it is published.
>
> On July 19, 2024, two additional IPC Template Instances were deployed. Due to a bug in the Content Validator, one of the two Template Instances passed validation despite containing problematic content data.

Second, what they were planning on doing going forward to stop this event happening again:

> **Software Resiliency and Testing**
>
> Improve Rapid Response Content testing by using testing types such as:
>
> - Local developer testing
> - Content update and rollback testing
> - Stress testing, fuzzing and fault injection
> - Stability testing
> - Content interface testing
> Add additional validation checks to the Content Validator for Rapid Response Content. A new check is in process to guard against this type of problematic content from being deployed in the future.
> Enhance existing error handling in the Content Interpreter.

> **Rapid Response Content Deployment**
> Implement a staggered deployment strategy for Rapid Response Content in which updates are gradually deployed to larger portions of the sensor base, starting with a canary deployment.
>
> Improve monitoring for both sensor and system performance, collecting feedback during Rapid Response Content deployment to guide a phased rollout.
>
> Provide customers with greater control over the delivery of Rapid Response Content updates by allowing granular selection of when and where these updates are deployed.
>
> Provide content update details via release notes, which customers can subscribe to.

It seems that Crowdstrike were *shooting from the hip* when it comes to providing content updates. And although it’s good that Crowdstrike are going to do the right level of testing going forward, what Crowdstrike described is something it should’ve been doing in the first place.

This defect caused immense disruption to so many businesses, with people taking [pictures](https://www.theverge.com/24202037/microsoft-crowdstrike-outage-blue-screen-error-photos) of the famous blue screen around the world, and there are a few key lessons that can be learned from this.

# Never release on a Friday.

Yes, never release on a Friday. I learnt about this rule when I was working in my second job while working with an eCommerce platform. No matter how small the update is, just don’t do it, do not release on a Friday. Even if there is a complete rollback plan, just don’t release on a Friday. It’s better to release on a Monday where everyone can take the time and monitor how the release goes. In case anything does go wrong, there is plenty of time in the week to rollback and fix the release.

# Test, Test, Test.

With someone who has had plenty of experience in software testing, this incident highlights the importance of testing. From Crowdstrike’s report, they were very reliant on automated testing.

So, insufficient testing or the wrong type of testing was performed. And Crowdstrike want to improve their testing going forward. Sure, having better and more testing is a good goal to have, but it’s never that simple. Applications now are large and complex and it won’t be possible to test *everything*. So what do you do? Seeing if the change meets the users’ requirements is a good starting point.

But with all things in development, there’s risk, which becomes more significant with a more complex system. What needs to be tested and how much something is tested must be related to the risk (the greater the risk, the better testing required).

And as this incident shows, that risk can lead to catastrophic results.

A good QA process should be a methodical examination using various techniques. Some of the key principles of testing is; that it shows the presence of defects, early testing saves time and money and exhaustive testing is impossible.

If something does go wrong, it’s a great opportunity to learn from it, make improvements and ensure it doesn’t happen again.

# It’s not you today, but it could be you tomorrow.

Sure, it was Crowdstrike today that caused global issues, but that doesn’t mean it won’t be an alternative tomorrow. These issues are rare, especially when it causes a global outage. But it could’ve been any cybersecurity firm that caused the issue.

Be sure to say thank you to those who worked hard to help restore Windows machines, it wasn’t an easy task to restore over 8 million machines. Just make sure though the way you thank them isn’t in the form of a [$10 Uber Eats gift card](https://techcrunch.com/2024/07/24/crowdstrike-offers-a-10-apology-gift-card-to-say-sorry-for-outage/?guccounter=2), especially when the outage caused roughly [$5.4bn in financial losses.](https://www.bbc.co.uk/news/articles/ce58p0048r0o)

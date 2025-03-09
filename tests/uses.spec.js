import { test, expect } from "@playwright/test";

test("Page loads successfully", async ({ page }) => {
  await page.goto("http://localhost:3000/uses"); // Update the URL as needed
  const title = await page.title();
  expect(title).toBe("Joshua Blewitt"); // Update with your actual site title
});

test("Check for important content", async ({ page }) => {
  await page.goto("http://localhost:3000/uses"); // Update the URL as needed

  // Check if the heading is present
  const heading = await page.textContent('[data-testid="heading1"]');
  expect(heading).toBe("Uses");

  // Check if paragraph is present
  const paragraph = await page.textContent('[data-testid="content"]');
  expect(paragraph).toBe(
    "If you’re wondering what I’m using on a daily basis for hardware and software, this page will answer your questions.HardwareMy main criteria when it comes to hardware is quality and efficiency. I believe that a product that I’m using should be built to last and should have acceptable performance to keep up with my workflow.ComputerI currently use an M2 Mac mini. It’s my first Mac which uses an ARM based system on a chip and I’m blown away by the performance of this thing. The compact design is also appealing, it sits nicely on my desk and looks great. Only regret is not getting 16GB of RAM.Keyboard and mouseI currently use a Logitech MX Master 3S for my mouse and a Logitech MX Mechanical Mini for my keyboard. Both are excellent products to use. Out of the two though, I like the mouse the most.MonitorI use a 24 inch LG Ultra HD monitor (I wish I knew the model number). It’s a nice monitor. Just wish it was slightly taller.PhoneI use an iPhone 16 Pro. I upgraded from my iPhone XS in March 2025, after a little over six years of use. Battery life was the biggest factor for me in upgrading. It is a huge upgrade for me in almost every way possible.CameraI use a Panasonic Lumix DMC-G7K. I am also using the stock 14-42mm lens. It's a fun camera to use. I want to take more photos with it when I go on trips. I am also planning on buying another lens at some point.GamingI use a Steam Deck as my main gaming device. Fantastic performance for a great price. I’ve taken the Deck on plane trips, used it to play games on a TV at my parents home over the holiday season, played it in hotel rooms and more. It plays my Steam library and retro games extremely well. Curious to see how the handheld PC market evolves over time as the technology improves.SoftwareMy main criteria when it comes to software is performance and value. Text EditorFor my IDE/text editor, I use  Zed. It’s incredibly quick, looks good and offers a decent (and growing) range of extensions. It’s free to use which is a plus. I will also give a shout-out to Sublime Text.The font I use in my text editor is JetBrains Mono.Photo EditorFor photo editing, I use Pixelmator Pro. With an attractive one time cost, plenty of great features and updates, it’s something to consider. Shame it’s only available for Mac, otherwise I’d suggest Affinity Photo.Web BrowserMy web browser of choice at the moment is Arc. It’s an interesting take on the web browser, so I’m giving it a spin. The mobile version of Arc is quite good as well. Note takingFor note taking, I use Notion. It’s free, offers great features, a handy mobile application and it’s very easy to use. I did think about using Obsidian, but Notion syncs across my devices for free.Version ControlFor working with Git, I use Fork as its a fast Git client.TravelFor travelling internationally (which happens at least once a year), I use Flighty. A fantastic application that gives you so much information about your flight. The live activity is incredibly useful when walking through an airport and you need to check your flight quickly.",
  );
});

import { test, expect } from '@playwright/test'

test('Page loads successfully', async ({ page }) => {
    await page.goto('http://localhost:3000/about'); // Update the URL as needed
    const title = await page.title();
    expect(title).toBe('Joshua Blewitt'); // Update with your actual site title
});


test('Check for important content', async ({ page }) => {
    await page.goto('http://localhost:3000/about'); // Update the URL as needed

    const heading = await page.textContent('[data-testid="intro"]');
    expect(heading).toBe("I'm an Application Analyst, hobbyist developer and problem solver.");
});

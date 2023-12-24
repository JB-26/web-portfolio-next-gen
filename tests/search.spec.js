import { test, expect } from '@playwright/test'

test('Page loads successfully', async ({ page }) => {
    await page.goto('http://localhost:3000/blog'); // Update the URL as needed
    
    // Replace with your actual CSS class names
    const searchBoxSelector = '[data-testid="search"]';
    const searchButtonSelector = '[data-testid="button"]';

    // Enter text into the search box
    await page.type(searchBoxSelector, 'Test');  // Use page.type for non-input elements

    // Click the search button
    await page.click(searchButtonSelector);

    // Wait for the search results or other actions after clicking the search button
    // Replace the following line with your actual logic
    await page.waitForTimeout(2000);

    const title = await page.title();
    expect(title).toBe('Joshua Blewitt'); // Update with your actual site title
});

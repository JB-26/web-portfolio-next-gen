import { test, expect } from '@playwright/test'

test('Page loads successfully', async ({ page }) => {
    await page.goto('http://localhost:3000/tags/Professional'); // Update the URL as needed
    const title = await page.title();
    expect(title).toBe('Professional'); // Update with your actual site title
});


test('Check for important content', async ({ page }) => {
    await page.goto('http://localhost:3000/tags/Professional'); // Update the URL as needed

    const tag_heading = await page.textContent('[data-testid="tag-heading"]');
    expect(tag_heading).toBe("Posts tagged with Professional");
});

import { test, expect } from '@playwright/test'

test('Page loads successfully', async ({ page }) => {
    await page.goto('http://localhost:3000/test'); // Update the URL as needed
    const title = await page.title();
    expect(title).toBe('Page not found · Joshua Blewitt');
});


test('Check for important content', async ({ page }) => {
    await page.goto('http://localhost:3000/test'); // Update the URL as needed

    const error_heading = await page.textContent('[data-testid="error-heading"]');
    expect(error_heading).toBe("You've found the error page!");
});

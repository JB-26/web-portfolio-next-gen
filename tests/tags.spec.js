import { test, expect } from '@playwright/test'

test('Page loads successfully', async ({ page }) => {
    await page.goto('http://localhost:3000/tags/Professional'); // Update the URL as needed
    const title = await page.title();
    expect(title).toBe('Posts tagged Professional · Joshua Blewitt');
});


test('Check for important content', async ({ page }) => {
    await page.goto('http://localhost:3000/tags/Professional'); // Update the URL as needed

    const tag_heading = await page.textContent('[data-testid="tag-heading"]');
    expect(tag_heading).toBe("Posts tagged with Professional");
});

// --- Redesign: the tag page now reuses the blog index's row treatment --------

const TAG_URL = 'http://localhost:3000/tags/Professional';

test('Tag page lists posts with dates and reading times', async ({ page }) => {
    await page.goto(TAG_URL);

    const rows = page.locator('[data-testid="post-list-item"]');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // Every row links to a real post and carries a reading time.
    for (let i = 0; i < count; i++) {
        await expect(rows.nth(i)).toHaveAttribute('href', /^\/posts\/.+/);
    }
    const readingTimes = page.locator('[data-testid="post-reading-time"]');
    await expect(readingTimes).toHaveCount(count);
    await expect(readingTimes.first()).toContainText('min read');
});

test('Tag page counter matches the number of rows shown', async ({ page }) => {
    await page.goto(TAG_URL);

    const rows = await page.locator('[data-testid="post-list-item"]').count();
    await expect(page.locator('[data-testid="post-counter"]')).toHaveText(
        `${rows} posts`,
    );
});

test('Tag page links back to the blog', async ({ page }) => {
    await page.goto(TAG_URL);

    await expect(
        page.getByRole('link', { name: '← Back to blog' }),
    ).toHaveAttribute('href', '/blog');
});

test('Tag pills on a post lead to a working tag page', async ({ page }) => {
    await page.goto('http://localhost:3000/posts/2025-01-30-scrum');

    const pill = page.locator('article a[href^="/tags/"]').first();
    const href = await pill.getAttribute('href');
    await pill.click();

    await expect(page).toHaveURL(`http://localhost:3000${href}`);
    await expect(page.locator('[data-testid="tag-heading"]')).toContainText(
        'Posts tagged with',
    );
    await expect(
        page.locator('[data-testid="post-list-item"]').first(),
    ).toBeVisible();
});

test('Tag page has no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(TAG_URL);

    await expect
        .poll(() =>
            page.evaluate(
                () =>
                    document.documentElement.scrollWidth >
                    document.documentElement.clientWidth,
            ),
        )
        .toBe(false);
});

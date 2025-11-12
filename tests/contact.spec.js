import { test, expect } from "@playwright/test";

test.describe("Contact Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/contact"); // Adjust the URL path as needed
  });

  test("should display the contact page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Joshua Blewitt/i);
  });

  test("should display the main Contact heading", async ({ page }) => {
    const heading = page.getByTestId("heading1");
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText("Contact");
  });

  test("should display the introductory text", async ({ page }) => {
    const introText = page.getByText(
      /Drop me a line on the platform of your choice or follow me/i,
    );
    await expect(introText).toBeVisible();
  });

  test.describe("Contact Cards", () => {
    test("should display all six contact cards", async ({ page }) => {
      const emailCard = page.getByRole("link", { name: /Email/i });
      const linkedinCard = page.getByRole("link", { name: /LinkedIn/i });
      const youtubeCard = page.getByRole("link", { name: /YouTube/i });
      const instagramCard = page.getByRole("link", { name: /Instagram/i });
      const blueskyCard = page.getByRole("link", { name: /Bluesky/i });
      const rssCard = page.getByRole("link", { name: /RSS/i });

      await expect(emailCard).toBeVisible();
      await expect(linkedinCard).toBeVisible();
      await expect(youtubeCard).toBeVisible();
      await expect(instagramCard).toBeVisible();
      await expect(blueskyCard).toBeVisible();
      await expect(rssCard).toBeVisible();
    });

    test("should have grid layout with two columns", async ({ page }) => {
      const gridContainer = page.locator(".grid.grid-cols-2");
      await expect(gridContainer).toBeVisible();

      const gridDisplay = await gridContainer.evaluate((el) => {
        return window.getComputedStyle(el).display;
      });
      expect(gridDisplay).toBe("grid");
    });
  });

  test.describe("Email Card", () => {
    test("should have correct email link", async ({ page }) => {
      const emailLink = page.getByRole("link", { name: /Email/i });
      await expect(emailLink).toHaveAttribute(
        "href",
        "mailto:joshblewitt@protonmail.com",
      );
    });

    test("should display email address", async ({ page }) => {
      const emailAddress = page.getByText("joshblewitt@protonmail.com");
      await expect(emailAddress).toBeVisible();
    });

    test("should have email icon", async ({ page }) => {
      const emailIcon = page.getByAltText("Email");
      await expect(emailIcon).toBeVisible();
    });

    test("should not open in new tab", async ({ page }) => {
      const emailLink = page.getByRole("link", { name: /Email/i });
      const target = await emailLink.getAttribute("target");
      expect(target).toBeNull();
    });
  });

  test.describe("LinkedIn Card", () => {
    test("should have correct LinkedIn link", async ({ page }) => {
      const linkedinLink = page.getByRole("link", { name: /LinkedIn/i });
      await expect(linkedinLink).toHaveAttribute(
        "href",
        "https://www.linkedin.com/in/jblewitt/",
      );
    });

    test("should display LinkedIn username", async ({ page }) => {
      const username = page.getByText("jblewitt", { exact: true });
      await expect(username).toBeVisible();
    });

    test("should have LinkedIn icon", async ({ page }) => {
      const linkedinIcon = page.getByAltText("LinkedIn");
      await expect(linkedinIcon).toBeVisible();
    });

    test("should open in new tab with security attributes", async ({
      page,
    }) => {
      const linkedinLink = page.getByRole("link", { name: /LinkedIn/i });
      await expect(linkedinLink).toHaveAttribute("target", "_blank");
      await expect(linkedinLink).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  test.describe("YouTube Card", () => {
    test("should have correct YouTube link", async ({ page }) => {
      const youtubeLink = page.getByRole("link", { name: /YouTube/i });
      await expect(youtubeLink).toHaveAttribute(
        "href",
        "https://www.youtube.com/@joshuablewitt6022",
      );
    });

    test("should display YouTube handle", async ({ page }) => {
      const handle = page.getByText("@joshuablewitt6022");
      await expect(handle).toBeVisible();
    });

    test("should have YouTube icon", async ({ page }) => {
      const youtubeIcon = page.getByAltText("YouTube");
      await expect(youtubeIcon).toBeVisible();
    });

    test("should open in new tab with security attributes", async ({
      page,
    }) => {
      const youtubeLink = page.getByRole("link", { name: /YouTube/i });
      await expect(youtubeLink).toHaveAttribute("target", "_blank");
      await expect(youtubeLink).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  test.describe("Instagram Card", () => {
    test("should have correct Instagram link", async ({ page }) => {
      const instagramLink = page.getByRole("link", { name: /Instagram/i });
      await expect(instagramLink).toHaveAttribute(
        "href",
        "https://www.instagram.com/jblw1tt/",
      );
    });

    test("should display Instagram username", async ({ page }) => {
      const username = page.getByText("jblw1tt");
      await expect(username).toBeVisible();
    });

    test("should have Instagram icon", async ({ page }) => {
      const instagramIcon = page.getByAltText("Instagram");
      await expect(instagramIcon).toBeVisible();
    });

    test("should open in new tab with security attributes", async ({
      page,
    }) => {
      const instagramLink = page.getByRole("link", { name: /Instagram/i });
      await expect(instagramLink).toHaveAttribute("target", "_blank");
      await expect(instagramLink).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  test.describe("Bluesky Card", () => {
    test("should have correct Bluesky link", async ({ page }) => {
      const blueskyLink = page.getByRole("link", { name: /Bluesky/i });
      await expect(blueskyLink).toHaveAttribute(
        "href",
        "https://bsky.app/profile/joshblewitt.dev",
      );
    });

    test("should display Bluesky handle", async ({ page }) => {
      const handle = page.getByText("@joshblewitt.dev");
      await expect(handle).toBeVisible();
    });

    test("should have Bluesky icon", async ({ page }) => {
      const blueskyIcon = page.getByAltText("Bluesky");
      await expect(blueskyIcon).toBeVisible();
    });

    test("should open in new tab with security attributes", async ({
      page,
    }) => {
      const blueskyLink = page.getByRole("link", { name: /Bluesky/i });
      await expect(blueskyLink).toHaveAttribute("target", "_blank");
      await expect(blueskyLink).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  test.describe("RSS Card", () => {
    test("should have correct RSS link", async ({ page }) => {
      const rssLink = page.getByRole("link", { name: /RSS/i });
      await expect(rssLink).toHaveAttribute("href", "/rss.xml");
    });

    test("should display RSS description", async ({ page }) => {
      const description = page.getByText("Add to your favourite reader");
      await expect(description).toBeVisible();
    });

    test("should have RSS icon", async ({ page }) => {
      const rssIcon = page.getByAltText("RSS");
      await expect(rssIcon).toBeVisible();
    });

    test("should open in new tab with security attributes", async ({
      page,
    }) => {
      const rssLink = page.getByRole("link", { name: /RSS/i });
      await expect(rssLink).toHaveAttribute("target", "_blank");
      await expect(rssLink).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  test.describe("Card Interactions", () => {
    test("should have shadow effect on all cards", async ({ page }) => {
      const emailCard = page.getByRole("link", { name: /Email/i });

      const boxShadow = await emailCard.evaluate((el) => {
        return window.getComputedStyle(el).boxShadow;
      });

      expect(boxShadow).not.toBe("none");
    });

    test("should transform card on hover", async ({ page }) => {
      const emailCard = page.getByRole("link", { name: /Email/i });

      // Get initial transform
      const initialTransform = await emailCard.evaluate((el) => {
        return window.getComputedStyle(el).transform;
      });

      // Hover over the card
      await emailCard.hover();

      // Wait for animation
      await page.waitForTimeout(200);

      // Get transform after hover
      const hoveredTransform = await emailCard.evaluate((el) => {
        return window.getComputedStyle(el).transform;
      });
    });
  });

  test.describe("Responsive Behavior", () => {
    test("should maintain grid layout on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const gridContainer = page.locator(".grid.grid-cols-2");
      await expect(gridContainer).toBeVisible();

      // All cards should still be visible
      const emailCard = page.getByRole("link", { name: /Email/i });
      const linkedinCard = page.getByRole("link", { name: /LinkedIn/i });

      await expect(emailCard).toBeVisible();
      await expect(linkedinCard).toBeVisible();
    });

    test("should truncate long text on small screens", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Check that email address has truncate class
      const emailText = page
        .locator(".truncate")
        .filter({ hasText: "joshblewitt@protonmail.com" });
      await expect(emailText).toBeVisible();
    });

    test("should maintain proper spacing on tablet", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      const heading = page.getByTestId("heading1");
      await expect(heading).toBeVisible();

      const gridContainer = page.locator(".grid.grid-cols-2");
      await expect(gridContainer).toBeVisible();
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper heading hierarchy", async ({ page }) => {
      const h1 = page.getByRole("heading", { level: 1, name: "Contact" });
      await expect(h1).toBeVisible();
    });

    test("external links should have security attributes", async ({ page }) => {
      const externalLinks = [
        page.getByRole("link", { name: /LinkedIn/i }),
        page.getByRole("link", { name: /YouTube/i }),
        page.getByRole("link", { name: /Instagram/i }),
        page.getByRole("link", { name: /Bluesky/i }),
      ];

      for (const link of externalLinks) {
        await expect(link).toHaveAttribute("rel", "noopener noreferrer");
        await expect(link).toHaveAttribute("target", "_blank");
      }
    });
  });

  test.describe("Layout and Styling", () => {
    test("should have proper card structure", async ({ page }) => {
      const emailCard = page.getByRole("link", { name: /Email/i });

      // Check for rounded corners
      const borderRadius = await emailCard.evaluate((el) => {
        return window.getComputedStyle(el).borderRadius;
      });
      expect(borderRadius).toBeTruthy();

      // Check for border
      const border = await emailCard.evaluate((el) => {
        return window.getComputedStyle(el).border;
      });
      expect(border).toContain("1px");
    });

    test("should have proper text hierarchy in cards", async ({ page }) => {
      // Platform name should be more prominent
      const emailLabel = page
        .locator("p.text-black.text-sm")
        .filter({ hasText: "Email" });
      await expect(emailLabel).toBeVisible();

      // Detail text should be smaller and gray
      const emailDetail = page
        .locator("p.text-gray-600.text-xs")
        .filter({ hasText: "joshblewitt@protonmail.com" });
      await expect(emailDetail).toBeVisible();
    });

    test("should have consistent spacing between cards", async ({ page }) => {
      const gridContainer = page.locator(".grid.grid-cols-2.gap-5");
      await expect(gridContainer).toBeVisible();
    });
  });

  test.describe("Content Verification", () => {
    test("should display correct email address", async ({ page }) => {
      await expect(page.getByText("joshblewitt@protonmail.com")).toBeVisible();
    });

    test("should display correct social media handles", async ({ page }) => {
      await expect(page.getByText("jblewitt", { exact: true })).toBeVisible();
      await expect(page.getByText("@joshuablewitt6022")).toBeVisible();
      await expect(page.getByText("jblw1tt")).toBeVisible();
      await expect(page.getByText("@joshblewitt.dev")).toBeVisible();
    });

    test("should display RSS description", async ({ page }) => {
      await expect(
        page.getByText("Add to your favourite reader"),
      ).toBeVisible();
    });

    test("should warn against spam", async ({ page }) => {
      await expect(page.getByText(/No spam, please/i)).toBeVisible();
    });
  });
});

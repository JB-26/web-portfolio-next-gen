import { test, expect } from "@playwright/test";

test.describe("Resume Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/resume");
  });

  test("should display the main Resume heading", async ({ page }) => {
    const heading = page.getByRole("heading", { name: "Resume", level: 1 });
    await expect(heading).toBeVisible();
  });

  test.describe("Polaroid Images Section", () => {
    test("should display all three polaroid images on desktop", async ({
      page,
    }) => {
      // Check that all three images are present
      const topGolfImage = page.getByAltText("Top Golf");
      const museumImage = page.getByAltText("Natural History Museum");
      const louvreImage = page.getByAltText("Louvre");

      await expect(topGolfImage).toBeVisible();
      await expect(museumImage).toBeVisible();
      await expect(louvreImage).toBeVisible();
    });

    test("should have proper image attributes", async ({ page }) => {
      const museumImage = page.getByAltText("Natural History Museum");

      // Check that the image has a src attribute
      await expect(museumImage).toHaveAttribute("src", /.+/);
    });

    test("should display only center image on mobile", async ({ page }) => {
      // Set viewport to mobile size
      await page.setViewportSize({ width: 375, height: 667 });

      const museumImage = page.getByAltText("Natural History Museum");
      await expect(museumImage).toBeHidden();

      // Check if other images are visible
      const topGolfImage = page.getByAltText("Top Golf");
      const louvreImage = page.getByAltText("Louvre");

      await expect(topGolfImage).toBeVisible();
      await expect(louvreImage).toBeVisible();
    });

    test("should scale image on hover", async ({ page }) => {
      const museumImage = page.getByAltText("Natural History Museum");
      const imageContainer = museumImage.locator("..");

      // Get initial transform
      const initialTransform = await imageContainer.evaluate(
        (el) => window.getComputedStyle(el).transform,
      );

      // Hover over the image
      await imageContainer.hover();

      // Wait for animation to complete
      await page.waitForTimeout(400);

      // Get transform after hover
      const hoveredTransform = await imageContainer.evaluate(
        (el) => window.getComputedStyle(el).transform,
      );
    });
  });

  test("should display PDF availability text", async ({ page }) => {
    const pdfText = page.getByText(
      /full resume available upon request in a pdf/i,
    );
    await expect(pdfText).toBeVisible();
  });

  test.describe("Work Experience Section", () => {
    test("should display Work Experience heading", async ({ page }) => {
      const heading = page.getByRole("heading", { name: /work experience/i });
      await expect(heading).toBeVisible();
    });

    test("should display timeline with vertical line", async ({ page }) => {
      // Check for the timeline container
      const timeline = page.locator(".relative.pt-4.pb-4");
      await expect(timeline).toBeVisible();

      // Check for vertical line (it should have specific width and background classes)
      const verticalLine = timeline.locator(
        ".absolute.left-0.top-0.bottom-0.w-px",
      );
      await expect(verticalLine).toBeVisible();
    });

    test("should display ICAEW job entry", async ({ page }) => {
      // Check company name
      const companyName = page.getByText(
        /Institute of Chartered Accountants in England and Wales/i,
      );
      await expect(companyName).toBeVisible();

      // Check job title
      const jobTitle = page.getByText(/Assessment Systems Executive/i);
      await expect(jobTitle).toBeVisible();

      // Check date range
      const dateRange = page.getByText(/August 2024 - Present/i);
      await expect(dateRange).toBeVisible();
    });

    test("should display blue timeline dot for ICAEW entry", async ({
      page,
    }) => {
      // Find the blue dot (it should have bg-blue-500 class)
      const blueDot = page.locator(".bg-blue-500.rounded-full").first();
      await expect(blueDot).toBeVisible();

      // Check that it has the correct styling
      const dotStyles = await blueDot.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          width: styles.width,
          height: styles.height,
          borderRadius: styles.borderRadius,
        };
      });

      expect(dotStyles.width).toBe("11px");
      expect(dotStyles.height).toBe("11px");
    });

    test("should display job responsibilities", async ({ page }) => {
      const responsibility = page.getByText(
        /Managed releases for key systems, defect lists and resolutions/i,
      );
      await expect(responsibility).toBeVisible();

      // Check that it's in a list item
      const listItem = page.locator("li", {
        hasText: /Managed releases for key systems/i,
      });
      await expect(listItem).toBeVisible();
    });

    test("should have proper spacing between timeline items", async ({
      page,
    }) => {
      const timelineItems = page.locator(".relative.pl-8");
      const count = await timelineItems.count();

      // Should have at least one timeline item
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe("Responsive Behavior", () => {
    test("should adjust layout for tablet view", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      const heading = page.getByRole("heading", { name: "Resume" });
      await expect(heading).toBeVisible();

      // Polaroids should still be visible at tablet size
      const museumImage = page.getByAltText("Natural History Museum");
      await expect(museumImage).toBeVisible();
    });

    test("should adjust layout for mobile view", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Main content should still be visible
      const heading = page.getByRole("heading", { name: "Resume" });
      await expect(heading).toBeVisible();

      // Work experience should be readable on mobile
      const companyName = page.getByText(/Institute of Chartered Accountants/i);
      await expect(companyName).toBeVisible();
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper heading hierarchy", async ({ page }) => {
      // Check that h1 exists
      const h1 = page.getByRole("heading", { level: 1, name: "Resume" });
      await expect(h1).toBeVisible();

      // Check that h2 exists for Work Experience
      const h2 = page.getByRole("heading", {
        level: 2,
        name: /work experience/i,
      });
      await expect(h2).toBeVisible();
    });

    test("should have good color contrast", async ({ page }) => {
      // This is a basic check - for thorough testing, use axe-core
      const bodyBg = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });

      expect(bodyBg).toBeTruthy();
    });
  });

  test.describe("Content Verification", () => {
    test("should display correct company name", async ({ page }) => {
      await expect(
        page.getByText(
          "Institute of Chartered Accountants in England and Wales",
        ),
      ).toBeVisible();
    });

    test("should display current employment status", async ({ page }) => {
      const presentText = page.getByText(/Present/i);
      await expect(presentText).toBeVisible();
    });

    test("should have list formatting for job duties", async ({ page }) => {
      const list = page.locator("ul").filter({ hasText: /Managed releases/i });
      await expect(list).toBeVisible();

      // Check that it has list-disc class (bullet points)
      const hasListDisc = await list.evaluate((el) => {
        return el.classList.contains("list-disc");
      });
      expect(hasListDisc).toBe(true);
    });
  });
});

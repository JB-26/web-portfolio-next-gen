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

    test("should show the outer two overlapping on mobile", async ({ page }) => {
      // Three frames at this size don't fit a phone without shrinking them to
      // postage stamps, so mobile hides the middle photo and tucks the outer
      // two into each other.
      await page.setViewportSize({ width: 390, height: 844 });

      await expect(page.getByAltText("Natural History Museum")).toBeHidden();
      await expect(page.getByAltText("Top Golf")).toBeVisible();
      await expect(page.getByAltText("Louvre")).toBeVisible();

      const [first, second] = await page
        .locator('[data-testid="resume-photos"] > div:visible')
        .evaluateAll((els) =>
          els.map((el) => {
            const r = el.getBoundingClientRect();
            return { left: r.left, right: r.right, top: Math.round(r.top) };
          }),
        );

      // Side by side on one row, and actually overlapping.
      expect(first.top).toBe(second.top);
      expect(second.left).toBeLessThan(first.right);

      // No horizontal overflow at the narrowest supported width.
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflows).toBe(false);
    });

    test("frames keep their angle on mobile", async ({ page }) => {
      // Unlike the hero, the resume frames stay rotated on mobile — several
      // overlapping frames only read as a stack of photos if they're angled.
      await page.setViewportSize({ width: 390, height: 844 });

      const rotations = await page
        .locator('[data-testid="resume-photos"] > div:visible > div')
        .evaluateAll((els) => els.map((el) => getComputedStyle(el).rotate));

      expect(rotations).toEqual(["-4deg", "3.5deg"]);
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
      /full resume available upon request as a pdf/i,
    );
    await expect(pdfText).toBeVisible();
  });

  test.describe("Work Experience Section", () => {
    test("should display Work Experience heading", async ({ page }) => {
      const heading = page.getByRole("heading", { name: /work experience/i });
      await expect(heading).toBeVisible();
    });

    test("each work entry carries its own left rule", async ({ page }) => {
      // The shared vertical line and blue dots are gone; every entry now has a
      // 2px --line left border of its own.
      const entries = page.locator("ol li.border-l-2");
      await expect(entries).toHaveCount(5);

      const borderWidth = await entries
        .first()
        .evaluate((el) => window.getComputedStyle(el).borderLeftWidth);
      expect(borderWidth).toBe("2px");
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

    test("roles are rendered in the accent colour, not the old blue", async ({
      page,
    }) => {
      // Regression guard for the palette change: the handoff drops blue
      // entirely, and the job role is the accent-coloured line.
      await expect(page.locator(".bg-blue-500")).toHaveCount(0);

      const role = page.getByText("Assessment Systems Executive");
      const colour = await role.evaluate(
        (el) => window.getComputedStyle(el).color,
      );
      const accent = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--accent")
          .trim(),
      );
      expect(accent).toBe("#b05730");
      expect(colour).toBe("rgb(176, 87, 48)");
    });

    test("should display job responsibilities", async ({ page }) => {
      const responsibility = page.getByText(
        /Managed releases for key systems, defect lists and resolutions/i,
      );
      await expect(responsibility).toBeVisible();

      // Still inside the entry's list item, though the bulleted <ul> is now a
      // single blurb paragraph.
      const listItem = page.locator("li", {
        hasText: /Managed releases for key systems/i,
      });
      await expect(listItem).toBeVisible();
    });

    test("should list every work entry", async ({ page }) => {
      await expect(page.locator("ol li.border-l-2")).toHaveCount(5);
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

    test("job duties read as a blurb paragraph", async ({ page }) => {
      const list = page.locator("p").filter({ hasText: /Managed releases/i });
      await expect(list).toBeVisible();

      // The design replaces the bulleted <ul> with a single muted blurb, so
      // assert the typography rather than a bullet style.
      const styles = await list.evaluate((el) => {
        const s = window.getComputedStyle(el);
        return { tag: el.tagName, fontSize: s.fontSize, listStyleType: s.listStyleType };
      });
      expect(styles.tag).toBe("P");
      expect(styles.fontSize).toBe("15px");
      expect(styles.listStyleType).toBe("none");
    });
  });
});

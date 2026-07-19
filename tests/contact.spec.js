import { test, expect } from "@playwright/test";

// Cards no longer carry icons, so their accessible name is the platform name
// plus the handle rather than the old icon alt text ("Email Contact Icon").
const card = (page, name) =>
  page.locator('[data-testid="contact-card"]').filter({ hasText: name });

const CHANNELS = [
  {
    name: "Email",
    handle: "joshblewitt@protonmail.com",
    href: "mailto:joshblewitt@protonmail.com",
    external: false,
  },
  {
    name: "LinkedIn",
    handle: "jblewitt",
    href: "https://www.linkedin.com/in/jblewitt/",
    external: true,
  },
  {
    name: "YouTube",
    handle: "@joshuablewitt6022",
    href: "https://www.youtube.com/@joshuablewitt6022",
    external: true,
  },
  {
    name: "Instagram",
    handle: "jblw1tt",
    href: "https://www.instagram.com/jblw1tt/",
    external: true,
  },
  {
    name: "Bluesky",
    handle: "@joshblewitt.dev",
    href: "https://bsky.app/profile/joshblewitt.dev",
    external: true,
  },
  {
    name: "RSS",
    handle: "Add to your favourite reader",
    href: "/rss.xml",
    external: true,
  },
];

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
      await expect(page.locator('[data-testid="contact-card"]')).toHaveCount(6);
      for (const { name } of CHANNELS) {
        await expect(card(page, name)).toBeVisible();
      }
    });

    test("should lay the cards out as a grid", async ({ page }) => {
      const grid = page.locator('[data-testid="contact-card"]').first().locator("..");
      await expect(grid).toHaveCSS("display", "grid");
      await expect(grid).toHaveCSS("gap", "16px");
    });

    test("cards carry no icons", async ({ page }) => {
      // The handoff drops the icon set the previous cards used; this guards
      // against one creeping back in.
      await expect(
        page.locator('[data-testid="contact-card"] img'),
      ).toHaveCount(0);
    });
  });

  // One parameterised block replaces six near-identical describe blocks.
  for (const { name, handle, href, external } of CHANNELS) {
    test.describe(`${name} Card`, () => {
      test(`should have the correct ${name} link`, async ({ page }) => {
        await expect(card(page, name)).toHaveAttribute("href", href);
      });

      test(`should display the ${name} handle`, async ({ page }) => {
        await expect(card(page, name)).toContainText(handle);
      });

      if (external) {
        test("should open in a new tab with security attributes", async ({
          page,
        }) => {
          await expect(card(page, name)).toHaveAttribute("target", "_blank");
          await expect(card(page, name)).toHaveAttribute(
            "rel",
            "noopener noreferrer",
          );
        });
      } else {
        test("should not open in a new tab", async ({ page }) => {
          await expect(card(page, name)).not.toHaveAttribute("target", "_blank");
        });
      }
    });
  }

  test.describe("Card Interactions", () => {
    test("cards have no shadow — the design reserves those for polaroids", async ({
      page,
    }) => {
      await expect(card(page, "Email")).toHaveCSS("box-shadow", "none");
    });

    test("hovering a card turns its border to the accent", async ({ page }) => {
      const emailCard = card(page, "Email");

      const before = await emailCard.evaluate(
        (el) => getComputedStyle(el).borderColor,
      );
      await emailCard.hover();
      await expect
        .poll(async () =>
          emailCard.evaluate((el) => getComputedStyle(el).borderColor),
        )
        .not.toBe(before);
    });
  });

  test.describe("Responsive Behavior", () => {
    test("should collapse to a single column on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });

      const lefts = await page
        .locator('[data-testid="contact-card"]')
        .evaluateAll((els) =>
          els.map((el) => Math.round(el.getBoundingClientRect().left)),
        );
      expect(new Set(lefts).size).toBe(1);

      const overflows = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(overflows).toBe(false);
    });

    test("long handles wrap rather than overflow their card", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });

      const fits = await card(page, "Email").evaluate((el) => {
        const handle = el.lastElementChild;
        return (
          Math.round(handle.getBoundingClientRect().right) <=
          Math.round(el.getBoundingClientRect().right)
        );
      });
      expect(fits).toBe(true);
    });

    test("should show two columns on tablet and up", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      const lefts = await page
        .locator('[data-testid="contact-card"]')
        .evaluateAll((els) =>
          els.map((el) => Math.round(el.getBoundingClientRect().left)),
        );
      expect(new Set(lefts).size).toBe(2);
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper heading hierarchy", async ({ page }) => {
      const h1 = page.getByRole("heading", { level: 1, name: "Contact" });
      await expect(h1).toBeVisible();
    });

    test("external links should have security attributes", async ({ page }) => {
      for (const { name } of CHANNELS.filter((c) => c.external)) {
        await expect(card(page, name)).toHaveAttribute(
          "rel",
          "noopener noreferrer",
        );
        await expect(card(page, name)).toHaveAttribute("target", "_blank");
      }
    });

    test("every card is reachable as a link with a meaningful name", async ({
      page,
    }) => {
      for (const { name, handle } of CHANNELS) {
        const link = page.getByRole("link", {
          name: new RegExp(`${name}\\s+${handle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
        });
        await expect(link).toHaveCount(1);
      }
    });
  });

  test.describe("Layout and Styling", () => {
    test("should have proper card structure", async ({ page }) => {
      const emailCard = card(page, "Email");
      await expect(emailCard).toHaveCSS("border-radius", "12px");
      await expect(emailCard).toHaveCSS("border-top-width", "1px");
    });

    test("should have proper text hierarchy in cards", async ({ page }) => {
      const emailCard = card(page, "Email");
      const [platform, handle] = await emailCard.evaluate((el) => {
        const [name, detail] = el.children;
        const read = (n) => {
          const s = getComputedStyle(n);
          return {
            fontSize: s.fontSize,
            fontWeight: s.fontWeight,
            mono: s.fontFamily.includes("Spline Sans Mono"),
          };
        };
        return [read(name), read(detail)];
      });

      // Platform name is the prominent line; the handle sits in the mono face
      // used for metadata across the site.
      expect(platform.fontSize).toBe("16px");
      expect(Number(platform.fontWeight)).toBeGreaterThanOrEqual(600);
      expect(platform.mono).toBe(false);

      expect(handle.fontSize).toBe("13.5px");
      expect(handle.mono).toBe(true);
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

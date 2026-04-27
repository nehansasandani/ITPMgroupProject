import { test, expect } from "@playwright/test";

const authUser = { id: "user-20", fullName: "Rater User", role: "STUDENT" };
const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,PATCH,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
const apiRoute = /http:\/\/(localhost|127\.0\.0\.1):5000\/api\/.*/;

async function seedAuth(page) {
  await page.addInitScript((user) => {
    localStorage.setItem("token", "test-token");
    localStorage.setItem("user", JSON.stringify(user));
  }, authUser);
}

test("fills and submits rating form", async ({ page }) => {
  await seedAuth(page);

  await page.route(apiRoute, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    if (method === "OPTIONS") return route.fulfill({ status: 204, headers: corsHeaders });

    if (path === "/api/users/me" && method === "GET") {
      return route.fulfill({ status: 200, headers: corsHeaders, contentType: "application/json", body: JSON.stringify({ user: authUser }) });
    }

    if (path === "/api/ratings" && method === "POST") {
      return route.fulfill({ status: 200, headers: corsHeaders, contentType: "application/json", body: JSON.stringify({ message: "ok" }) });
    }

    if (path === "/api/notifications/unread/count" && method === "GET") {
      return route.fulfill({ status: 200, headers: corsHeaders, contentType: "application/json", body: JSON.stringify({ count: 0 }) });
    }

    return route.fulfill({ status: 404, headers: corsHeaders, contentType: "application/json", body: JSON.stringify({ message: `No mock for ${method} ${path}` }) });
  });

  await page.goto('/rate', { waitUntil: 'domcontentloaded' });

  // select category -> sub -> skill
  await page.locator('label:has-text("Category")').locator('..').locator('select').first().selectOption('Programming');
  const subSelect = page.locator('label:has-text("Sub Category")').locator('..').locator('select').first();
  await expect(subSelect).toBeEnabled({ timeout: 5000 });
  await subSelect.selectOption('Frontend');
  await page.locator('label:has-text("Skill")').locator('..').locator('select').first().selectOption('React');

  // Rate each criterion by clicking the appropriate star buttons (stable index-based)
  const stars = page.locator('button:has-text("★")');
  // wait for all stars to render (5 stars × 4 criteria = 20)
  await expect(stars).toHaveCount(20, { timeout: 10000 });
  // buttons are rendered in order: 5 stars per criterion
  const indexes = [4, 9, 14, 19];
  for (const idx of indexes) {
    // click directly with force and a short timeout to avoid flaky scrolls
    await stars.nth(idx).click({ force: true, timeout: 5000 });
  }

  await page.getByPlaceholder('Share your experience working with this person...').fill('Great collaborator.');

  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/ratings') && r.request().method() === 'POST'),
    page.getByRole('button', { name: 'Submit Rating' }).click(),
  ]);

  await expect(page.getByText('Rating Submitted!')).toBeVisible();
});

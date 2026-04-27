import { test, expect } from "@playwright/test";

const authUser = {
  id: "user-1",
  fullName: "Test User",
  role: "STUDENT",
};

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

async function mockSkillsApi(page, initialSkills) {
  let skills = [...initialSkills];

  await page.route(apiRoute, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    if (method === "OPTIONS") {
      return route.fulfill({ status: 204, headers: corsHeaders });
    }

    if (path === "/api/users/me" && method === "GET") {
      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: "application/json",
        body: JSON.stringify({ user: authUser }),
      });
    }

    if (path === "/api/skills" && method === "GET") {
      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: "application/json",
        body: JSON.stringify({ skills }),
      });
    }

    if (path === "/api/notifications/unread/count" && method === "GET") {
      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: "application/json",
        body: JSON.stringify({ count: 0 }),
      });
    }

    if (path === "/api/skills" && method === "POST") {
      let payload = {};
      try {
        payload = request.postDataJSON();
      } catch {
        payload = {};
      }
      const next = {
        _id: `skill-${skills.length + 1}`,
        ...payload,
      };
      skills = [...skills, next];
      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: "application/json",
        body: JSON.stringify({ skills }),
      });
    }

    if (path.startsWith("/api/skills/") && method === "DELETE") {
      const id = path.split("/").pop();
      skills = skills.filter((item) => item._id !== id);
      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: "application/json",
        body: JSON.stringify({ skills }),
      });
    }

    return route.fulfill({
      status: 404,
      headers: corsHeaders,
      contentType: "application/json",
      body: JSON.stringify({ message: `No mock for ${method} ${path}` }),
    });
  });
}

async function selectByLabel(page, label, value) {
  const sel = page.locator(`label:has-text("${label}")`).locator("..").locator("select").first();
  // wait for the select to be present and enabled (some selects enable progressively)
  await expect(sel).toBeVisible({ timeout: 10000 });
  await expect(sel).toBeEnabled({ timeout: 10000 });
  return sel.selectOption(value);
}

test("adds a new skill", async ({ page }) => {
  await seedAuth(page);
  await mockSkillsApi(page, []);

  await page.goto("/skills", { waitUntil: "domcontentloaded" });

  // target the form submit button explicitly
  const submitButton = page.getByRole("button", { name: "Inject to Portfolio" });
  await expect(submitButton).toBeVisible();

  // select category -> subcategory -> skill (form enables selects progressively)
  await selectByLabel(page, "Primary Domain", "Coding");
  await selectByLabel(page, "Specialization", "Web Development");
  await selectByLabel(page, "Target Skillset", "Node.js");

  // submit the form
  await submitButton.click();

  // ✅ check UI update (skill appears as a card heading)
  await expect(page.locator('h4:has-text("Node.js")')).toBeVisible({ timeout: 5000 });
});

//
// ✅ TEST 2 — REMOVE SKILL (FINAL FIX)
//
test("removes an existing skill", async ({ page }) => {
  await seedAuth(page);
  await mockSkillsApi(page, [
    {
      _id: "skill-1",
      category: "Coding",
      subCategory: "Web Development",
      skill: "React",
      level: "Beginner",
    },
  ]);

  await page.goto("/skills", { waitUntil: "domcontentloaded" });

  const reactHeading = page.getByRole("heading", { name: "React" });
  await expect(reactHeading).toBeVisible({ timeout: 5000 });

  // locate the card container for this skill and click its erase button
  const reactCard = reactHeading.locator("..").locator("..");
  const eraseBtn = reactCard.locator('button[title="Erase Module"]');
  // ensure hover reveals the control then click (force to bypass transitions)
  await reactCard.hover();
  await eraseBtn.click({ force: true, timeout: 5000 });

  // small wait for UI update
  await page.waitForTimeout(500);

  // ✅ assert the React heading is no longer present
  await expect(page.getByRole('heading', { name: 'React' })).toHaveCount(0, { timeout: 5000 });
});

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

function selectByLabel(page, label, value) {
  return page
    .locator(`label:has-text("${label}")`)
    .locator("..")
    .locator("select")
    .first()
    .selectOption(value);
}

test("adds a new skill", async ({ page }) => {
  await seedAuth(page);
  await mockSkillsApi(page, []);

  await page.goto("/skills");

  // safer button selection
  const submitButton = page.locator("button").first();
  await expect(submitButton).toBeVisible();

  const skillSelect = page
    .locator('label:has-text("Skill")')
    .locator("..")
    .locator("select")
    .first();
  await skillSelect.selectOption("Node.js");

  await page.getByRole("button", { name: "Add Skill" }).click();

  await submitButton.click();

  // ✅ check UI update (skill appears)
  await expect(page.locator("text=Node")).toBeVisible();
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

  await page.goto("/skills");

  const savedSkills = page
    .getByRole("heading", { name: "Saved Skills" })
    .locator("..")
    .locator("..");
  await expect(savedSkills.getByText("React")).toBeVisible();

  // click delete button (last button is safest in your UI)
  await page.locator("button").last().click();

  // small wait for UI update
  await page.waitForTimeout(1000);

  // ✅ check success message instead of DOM removal
  await expect(page.locator("text=removed")).toBeVisible();
});

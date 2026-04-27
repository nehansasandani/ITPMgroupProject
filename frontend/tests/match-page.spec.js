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

test("loads matches and sends a request", async ({ page }) => {
  const taskId = "task-1";
  const tasks = [
    {
      _id: taskId,
      title: "Build React UI",
      skillRequired: "React",
      status: "OPEN",
    },
    {
      _id: "task-2",
      title: "Write docs",
      skillRequired: "Documentation",
      status: "COMPLETED",
    },
  ];

  let requestSent = false;

  await seedAuth(page);

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

    if (path === "/api/tasks/mine" && method === "GET") {
      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: "application/json",
        body: JSON.stringify(tasks),
      });
    }

    if (path === `/api/match/candidates/${taskId}` && method === "GET") {
      const candidate = {
        user: {
          _id: "helper-1",
          fullName: "Nimal Silva",
          studentId: "STU-1001",
          reputation: 4.4,
        },
        skillLevel: "Intermediate",
        isAvailable: true,
        hasRequest: requestSent,
        score: 88,
      };
      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: "application/json",
        body: JSON.stringify({
          taskSkill: "React",
          candidates: [candidate],
        }),
      });
    }

    if (path === `/api/match/top-helper/${taskId}` && method === "GET") {
      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: "application/json",
        body: JSON.stringify({
          topHelper: {
            _id: "helper-1",
            fullName: "Nimal Silva",
          },
        }),
      });
    }

    if (path === "/api/match/request" && method === "POST") {
      requestSent = true;
      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: "application/json",
        body: JSON.stringify({ message: "sent" }),
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

    return route.fulfill({
      status: 404,
      headers: corsHeaders,
      contentType: "application/json",
      body: JSON.stringify({ message: `No mock for ${method} ${path}` }),
    });
  });

  await page.goto("/match");

  await expect(page.getByRole("heading", { name: "Skill Matching" })).toBeVisible();
  await expect(page.getByText(`Selected task ID: ${taskId}`)).toBeVisible();

  await page.getByRole("button", { name: "Find Matches" }).click();

  await expect(page.getByText("Matching helpers loaded successfully.")).toBeVisible();
  await expect(page.getByText("Nimal Silva").first()).toBeVisible();

  await page.getByRole("button", { name: "Send Match Request" }).first().click();

  await expect(page.getByText("Match request sent.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Requested" })).toBeVisible();
});

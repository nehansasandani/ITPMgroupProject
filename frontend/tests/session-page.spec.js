import { test, expect } from "@playwright/test";

const authUser = {
  id: "user-2",
  fullName: "Helper User",
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

test("shows session details and sends chat messages", async ({ page }) => {
  const taskId = "task-1";
  const sessionId = "session-1";

  const session = {
    _id: sessionId,
    status: "ACTIVE",
    mode: "ONLINE",
    venue: "Zoom",
    startedAt: "2025-01-10T10:00:00.000Z",
    endedAt: null,
    task: {
      _id: taskId,
      title: "Build React UI",
      description: "Create a dashboard view for the matching flow.",
      expectedOutcome: "Responsive UI with helper cards.",
      urgency: "NORMAL",
      category: "CODING",
      skillRequired: "React",
      mode: "ONLINE",
      duration: 90,
      deadlineDays: 3,
    },
    poster: {
      _id: "user-1",
      fullName: "Asha Perera",
      studentId: "STU-2001",
      reputation: 4.6,
      completedTasksCount: 5,
    },
    helper: {
      _id: authUser.id,
      fullName: authUser.fullName,
      studentId: "STU-2002",
      reputation: 4.3,
      completedTasksCount: 4,
    },
  };

  let messages = [
    {
      _id: "msg-1",
      content: "Hello, ready to start?",
      createdAt: "2025-01-10T10:05:00.000Z",
      sender: {
        _id: "user-1",
        fullName: "Asha Perera",
      },
    },
  ];

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

    if (path === `/api/match/session/${taskId}` && method === "GET") {
      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: "application/json",
        body: JSON.stringify({ session }),
      });
    }

    if (path === `/api/messages/${sessionId}` && method === "GET") {
      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: "application/json",
        body: JSON.stringify({ messages }),
      });
    }

    if (path === `/api/messages/${sessionId}` && method === "POST") {
      let payload = {};
      try {
        payload = request.postDataJSON();
      } catch {
        payload = {};
      }
      messages = [
        ...messages,
        {
          _id: `msg-${messages.length + 1}`,
          content: payload.content || "",
          createdAt: new Date().toISOString(),
          sender: {
            _id: authUser.id,
            fullName: authUser.fullName,
          },
        },
      ];
      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: "application/json",
        body: JSON.stringify({ message: "sent" }),
      });
    }

    console.error(`missing API mock for ${method} ${path}`);
    return route.fulfill({
      status: 404,
      headers: corsHeaders,
      contentType: "application/json",
      body: JSON.stringify({ message: `No mock for ${method} ${path}` }),
    });
  });

  await page.goto(`/session/${taskId}`);

  await expect(page.getByRole("heading", { name: "Session" })).toBeVisible();
  await expect(page.getByText("Session Active")).toBeVisible();
  await expect(page.getByRole("button", { name: "Mark Complete" })).toBeVisible();
  await expect(page.getByText("Build React UI")).toBeVisible();

  const chatInput = page.getByPlaceholder("Type a message… (Enter to send)");
  await chatInput.fill("I can start now.");
  await page.getByRole("button", { name: "Send" }).click();

  await expect(page.getByText("I can start now.")).toBeVisible();
});

import { test, expect } from "@playwright/test";

const authUser = { id: "user-10", fullName: "Leader User", role: "STUDENT" };
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

test("loads leaderboard and shows top performer", async ({ page }) => {
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

    if (path === "/api/reputation/leaderboard" && method === "GET") {
      const leaders = [
        { userId: { fullName: "Ana Silva" }, score: 92, badges: ["Top Contributor"] },
        { userId: { fullName: "Nimal Silva" }, score: 88, badges: [] },
      ];
      return route.fulfill({ status: 200, headers: corsHeaders, contentType: "application/json", body: JSON.stringify(leaders) });
    }

    if (path === "/api/notifications/unread/count" && method === "GET") {
      return route.fulfill({ status: 200, headers: corsHeaders, contentType: "application/json", body: JSON.stringify({ count: 0 }) });
    }

    return route.fulfill({ status: 404, headers: corsHeaders, contentType: "application/json", body: JSON.stringify({ message: `No mock for ${method} ${path}` }) });
  });

  // block large image/font requests to reduce test flakiness on CI/Windows
  await page.route('**/*.{png,jpg,jpeg,svg,webp}', (r) => r.fulfill({ status: 204, body: '' }));

  await page.goto('/leaderboard', { waitUntil: 'networkidle' });

  // ensure the leaderboard data has been rendered; avoid short text matches
  await expect(page.getByRole('heading', { name: 'Ana Silva' })).toBeVisible({ timeout: 10000 });
});

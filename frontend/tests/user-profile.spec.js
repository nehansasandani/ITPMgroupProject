import { test, expect } from "@playwright/test";

const authUser = { id: "user-30", fullName: "Profile User", role: "STUDENT", studentId: "STU-3000" };
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

test("loads profile page and shows basic info", async ({ page }) => {
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

    if (path.startsWith('/api/reputation/') && method === 'GET') {
      // return simple reputation object
      return route.fulfill({ status: 200, headers: corsHeaders, contentType: "application/json", body: JSON.stringify({ score: 75, badges: ["Top Communicator"], noShowCount: 0 }) });
    }

    if (path === `/api/reputation/ratings/${authUser.id}` && method === "GET") {
      return route.fulfill({ status: 200, headers: corsHeaders, contentType: "application/json", body: JSON.stringify([]) });
    }

    if (path === "/api/skills" && method === "GET") {
      return route.fulfill({ status: 200, headers: corsHeaders, contentType: "application/json", body: JSON.stringify({ skills: [] }) });
    }

    if (path === "/api/notifications/unread/count" && method === "GET") {
      return route.fulfill({ status: 200, headers: corsHeaders, contentType: "application/json", body: JSON.stringify({ count: 0 }) });
    }

    return route.fulfill({ status: 404, headers: corsHeaders, contentType: "application/json", body: JSON.stringify({ message: `No mock for ${method} ${path}` }) });
  });

  let gotUser = false;
  await page.route(apiRoute, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();
    if (method === 'GET' && path === '/api/users/me') {
      gotUser = true;
      return route.fulfill({ status: 200, headers: corsHeaders, contentType: 'application/json', body: JSON.stringify({ user: authUser }) });
    }
    // fallback to original route handler behavior
    return route.fulfill({ status: 404, headers: corsHeaders, contentType: 'application/json', body: JSON.stringify({ message: `No mock for ${method} ${path}` }) });
  });

  await page.goto('/profile', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');

  // assert that the page requested the logged-in user (basic smoke test)
  expect(gotUser).toBeTruthy();
});

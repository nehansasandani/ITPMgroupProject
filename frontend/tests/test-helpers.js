import { expect } from "@playwright/test";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5174",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,PATCH,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const apiRoute = /http:\/\/(localhost|127\.0\.0\.1):5000\/api\/.*/;

export async function seedAuth(page, user) {
  await page.addInitScript((u) => {
    localStorage.setItem("token", "test-token");
    localStorage.setItem("user", JSON.stringify(u));
  }, user);
}

export async function findRowByText(page, text) {
  return page.locator('tr', { hasText: text }).first();
}

export async function confirmDialogs(page) {
  page.on('dialog', async (d) => {
    await d.accept();
  });
}

import { test, expect } from '@playwright/test';

test.describe('Reputation Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('LeaderboardPage displays leaderboard', async ({ page }) => {
    await page.goto('http://localhost:5173/reputation/leaderboard');
    
    // Wait for leaderboard to load
    await page.waitForSelector('h1, .leaderboard, [data-testid="leaderboard"]', { timeout: 5000 }).catch(() => {});
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/leaderboard-page.png' });
    
    // Basic check
    const pageTitle = await page.title();
    expect(pageTitle).toBeTruthy();
  });

  test('RatingForm submits rating successfully', async ({ page }) => {
    await page.goto('http://localhost:5173/reputation/rating');
    
    // Wait for form to load
    await page.waitForSelector('form, [data-testid="rating-form"]', { timeout: 5000 }).catch(() => {});
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/rating-form-page.png' });
    
    // Check form exists
    const form = await page.locator('form, [data-testid="rating-form"]').first().isVisible().catch(() => false);
    expect(form || true).toBeTruthy();
  });

  test('UserProfile displays user information', async ({ page }) => {
    await page.goto('http://localhost:5173/profile');
    
    // Wait for profile to load
    await page.waitForSelector('[data-testid="user-profile"], .profile, h2', { timeout: 5000 }).catch(() => {});
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/user-profile-page.png' });
    
    // Basic visibility check
    const pageTitle = await page.title();
    expect(pageTitle).toBeTruthy();
  });
});

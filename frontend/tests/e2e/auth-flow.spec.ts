import { expect, type BrowserContext, test } from '@playwright/test';

const apiBaseUrl = process.env.E2E_API_BASE_URL ?? 'http://localhost:8080/api';
const refreshCookieName = 'sportzone_refresh_token';

async function getRefreshCookie(context: BrowserContext) {
  const cookies = await context.cookies();
  return cookies.find((cookie) => cookie.name === refreshCookieName);
}

test('login, restore session, refresh token, and logout use secure cookie auth flow', async ({
  page,
  context,
}) => {
  await page.goto('/login');

  await page.getByLabel('Email or phone').fill('user@sportbooking.local');
  await page.locator('input#password').fill('Password@123');

  const loginResponsePromise = page.waitForResponse(
    (response) => response.url().includes('/api/auth/login') && response.request().method() === 'POST',
  );

  await page.getByRole('button', { name: /log in/i }).click();

  const loginResponse = await loginResponsePromise;
  expect(loginResponse.ok()).toBe(true);

  const loginBody = await loginResponse.json();
  expect(loginBody.data.accessToken).toBeTruthy();
  expect(loginBody.data.refreshToken).toBeUndefined();

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('button', { name: /demo user/i })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Login' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Register' })).toHaveCount(0);

  const localStorageAuthKeys = await page.evaluate(() =>
    Object.keys(window.localStorage).filter((key) => /auth|token|credential|session/i.test(key)),
  );
  expect(localStorageAuthKeys).toEqual([]);

  const loginCookie = await getRefreshCookie(context);
  expect(loginCookie).toBeDefined();
  expect(loginCookie?.httpOnly).toBe(true);

  const sessionResponsePromise = page.waitForResponse(
    (response) => response.url().includes('/api/auth/session') && response.request().method() === 'POST',
  );
  await page.reload();

  const sessionResponse = await sessionResponsePromise;
  expect(sessionResponse.ok()).toBe(true);

  const sessionBody = await sessionResponse.json();
  expect(sessionBody.data.accessToken).toBeTruthy();
  expect(sessionBody.data.refreshToken).toBeUndefined();
  await expect(page.getByRole('button', { name: /demo user/i })).toBeVisible();

  const cookieBeforeRefresh = await getRefreshCookie(context);
  expect(cookieBeforeRefresh).toBeDefined();

  const refreshResult = await page.evaluate(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    return {
      ok: response.ok,
      status: response.status,
      body: await response.json(),
    };
  }, apiBaseUrl);

  expect(refreshResult.ok).toBe(true);
  expect(refreshResult.body.data.accessToken).toBeTruthy();
  expect(refreshResult.body.data.refreshToken).toBeUndefined();

  const cookieAfterRefresh = await getRefreshCookie(context);
  expect(cookieAfterRefresh).toBeDefined();
  expect(cookieAfterRefresh?.httpOnly).toBe(true);
  expect(cookieAfterRefresh?.value).not.toBe(cookieBeforeRefresh?.value);

  await page.getByRole('button', { name: /demo user/i }).click();
  await page.getByRole('menuitem', { name: /logout/i }).click();

  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
  await expect(page.getByRole('button', { name: /demo user/i })).toHaveCount(0);
  expect(await getRefreshCookie(context)).toBeUndefined();

  const sessionAfterLogout = await page.evaluate(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/auth/session`, {
      method: 'POST',
      credentials: 'include',
    });

    return response.status;
  }, apiBaseUrl);

  expect(sessionAfterLogout).toBe(401);
});

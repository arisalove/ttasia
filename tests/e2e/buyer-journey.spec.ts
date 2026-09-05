import { test, expect } from '@playwright/test';

/**
 * Smoke test for the core buyer journey: log in with a demo account, browse
 * the catalogue, add a product to cart, and complete checkout. Runs against
 * demo mode (the default when NEXT_PUBLIC_DEMO_MODE is unset), so it needs no
 * external services — just `npm run dev` (started automatically by
 * playwright.config.ts's webServer).
 */
test.describe('Buyer journey', () => {
  test('can log in, add a product to cart, and check out', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('buyer@demo.taptap.my');
    await page.getByLabel('Password').fill('demo1234');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL(/\/buyer\/dashboard/);

    await page.goto('/buyer/catalogue');
    await expect(page.getByRole('heading', { name: /catalogue/i })).toBeVisible();

    const firstAddToCart = page.getByRole('button', { name: 'Add to cart' }).first();
    await expect(firstAddToCart).toBeVisible();
    await firstAddToCart.click();

    await page.goto('/buyer/cart');
    await expect(page.getByText(/RM/).first()).toBeVisible();

    const checkoutButton = page.getByRole('button', { name: /proceed to checkout/i });
    if (await checkoutButton.count()) {
      await checkoutButton.click();
    } else {
      await page.goto('/buyer/checkout');
    }

    await expect(page.getByText('Fulfilment', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Place order' }).click();

    await expect(page).toHaveURL(/\/buyer\/order-confirmation\//);
    await expect(page.getByText(/order/i).first()).toBeVisible();
  });

  test('supplier can view their orders dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('tawaufresh@demo.taptap.my');
    await page.getByLabel('Password').fill('demo1234');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL(/\/supplier\/dashboard/);
    await page.goto('/supplier/orders');
    await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible();
  });

  test('admin can view the verification queue', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@demo.taptap.my');
    await page.getByLabel('Password').fill('demo1234');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await page.goto('/admin/verification');
    await expect(page.getByRole('heading', { name: 'Verification queue' })).toBeVisible();
  });
});

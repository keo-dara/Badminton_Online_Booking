import { test, expect } from "@playwright/test";

test.describe("navigation", () => {
  test.beforeEach("Go to sale Page", async ({ page }) => {
    await page.goto("/product");
  });

  test("product navigation", async ({ page }) => {
    const productMenuItem = page.getByTestId("menu-item-product");
    await expect(productMenuItem).toBeVisible();
    await expect(productMenuItem).toBeEnabled();
    await expect(page.getByTestId("search-input")).toBeVisible();
    await expect(page.getByTestId("btn-search")).toBeVisible();
    await expect(page.getByTestId("btn-product-add")).toBeVisible();
    await expect(page.getByTestId("table-product")).toBeVisible();
  });

  test("product form", async ({ page }) => {
    await page.getByTestId("btn-product-add").click();
    expect(await page.getByTestId("p-name").isVisible()).toBe(true);
    expect(await page.getByTestId("p-price").isVisible()).toBe(true);
  });

  test("create product", async ({ page }) => {
    await page.getByTestId("btn-product-add").click();
    await page.getByPlaceholder("ឈ្មោះ").fill("product1");
    await page.getByPlaceholder("តម្លៃ").fill("12");
    await page.getByTestId("submit-product-info").click();
  });
});
// trigger update

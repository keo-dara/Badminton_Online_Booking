import { test, expect } from "@playwright/test";

test.describe("draft order", () => {
  test.beforeEach("Add to item", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[data-testid="dashboard"]');
    const product1 = page.getByTestId("products-sale1");
    await product1.click();
    const btnAdd = page.getByTestId("add-qty");
    const btnIncrease = page.getByTestId("increase-qty");
    await btnIncrease.click();
    await btnIncrease.click();
    await btnAdd.click();
  });

  test("item visible", async ({ page }) => {
    const item = page.getByTestId("item-sale0");
    expect(await item.isVisible()).toBe(true);
  });

  test("click draft", async ({ page }) => {
    const btnDraft = page.getByTestId("draft-item-btn");
    await btnDraft.click();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const item = page.getByTestId("item-sale0");
    expect(await item.isVisible()).toBe(false);
  });
});

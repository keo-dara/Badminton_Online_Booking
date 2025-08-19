import { test, expect } from "@playwright/test";

test.describe("navigation", () => {
  test.beforeEach("Go to sale Page", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[data-testid="dashboard"]');
  });

  test("main sale navigation", async ({ page }) => {
    expect(await page.getByTestId("dashboard").isVisible()).toBe(true);
  });

  test("show dialog qty and dismiss", async ({ page }) => {
    const product1 = page.getByTestId("products-sale1");
    expect(await product1.isVisible()).toBe(true);
    await product1.click();
    const dismissQty = page.getByTestId("close-change-qty");
    expect(await dismissQty.isVisible()).toBe(true);
    await dismissQty.click();
  });

  test("change qty work", async ({ page }) => {
    const product1 = page.getByTestId("products-sale1");
    expect(await product1.isVisible()).toBe(true);
    await product1.click();

    const btnIncrease = page.getByTestId("increase-qty");
    expect(await btnIncrease.isVisible()).toBe(true);

    const btnDecrease = page.getByTestId("decrease-qty");
    expect(await btnDecrease.isVisible()).toBe(true);
    const inputQty = page.getByTestId("qty-input-value");
    expect(await inputQty.isVisible()).toBe(true);
    expect(await inputQty.inputValue()).toBe("0");

    await btnIncrease.click();
    await btnIncrease.click();
    expect(await inputQty.inputValue()).toBe("2");
    await btnDecrease.click();
    expect(await inputQty.inputValue()).toBe("1");
  });

  test("add qty work", async ({ page }) => {
    const product1 = page.getByTestId("products-sale1");
    await product1.click();
    const btnAdd = page.getByTestId("add-qty");
    const btnIncrease = page.getByTestId("increase-qty");
    await btnIncrease.click();
    await btnIncrease.click();
    await btnAdd.click();
    const item = page.getByTestId("item-sale0");
    expect(await item.isVisible()).toBe(true);
  });
});

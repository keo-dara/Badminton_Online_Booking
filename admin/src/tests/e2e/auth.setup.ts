import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join("", "./playwright/.auth/user.json");

setup("authentication", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("username").isVisible();

  await page.getByPlaceholder("ឈ្មោះអ្នកប្រើប្រាស់").fill("admin");
  await page.getByPlaceholder("លេខសម្ងាត់").fill("12345678");
  await page.getByTestId("loginbutton").click();
  await page.waitForSelector('[data-testid="dashboard"]');
  await page.context().storageState({ path: authFile });
});

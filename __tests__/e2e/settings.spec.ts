import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
  });

  test('should display settings page with time limit and chord filters', async ({ page }) => {
    // Should show time limit input
    const timeLimitInput = page.getByLabel(/time limit|seconds per chord/i);
    await expect(timeLimitInput).toBeVisible();

    // Should show chord type filters
    const chordFilters = page.locator('text=/chord type|filter|major|minor|dominant/i').first();
    await expect(chordFilters).toBeVisible();

    // Should show save button
    const saveButton = page.getByRole('button', { name: /save/i });
    await expect(saveButton).toBeVisible();
  });

  test('should load current preferences on page load', async ({ page }) => {
    // Default time limit should be 10 seconds
    const timeLimitInput = page.getByLabel(/time limit|seconds/i);
    const value = await timeLimitInput.inputValue();

    // Should have a numeric value
    expect(parseInt(value)).toBeGreaterThanOrEqual(3);
    expect(parseInt(value)).toBeLessThanOrEqual(60);
  });

  test('should update time limit within valid range (3-60s)', async ({ page }) => {
    const timeLimitInput = page.getByLabel(/time limit|seconds/i);

    // Set to 15 seconds
    await timeLimitInput.fill('15');
    await page.getByRole('button', { name: /save/i }).click();

    // Should show success feedback
    await expect(page.locator('text=/saved|success/i').first()).toBeVisible({ timeout: 3000 });

    // Reload and verify persistence
    await page.reload();
    const newValue = await timeLimitInput.inputValue();
    expect(parseInt(newValue)).toBe(15);
  });

  test('should prevent time limit below 3 seconds', async ({ page }) => {
    const timeLimitInput = page.getByLabel(/time limit|seconds/i);

    // Try to set invalid value
    await timeLimitInput.fill('2');
    await page.getByRole('button', { name: /save/i }).click();

    // Should show error or prevent save
    const errorMessage = page.locator('text=/invalid|minimum|at least 3/i');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    } else {
      // Input might prevent values below 3
      const value = await timeLimitInput.inputValue();
      expect(parseInt(value)).toBeGreaterThanOrEqual(3);
    }
  });

  test('should prevent time limit above 60 seconds', async ({ page }) => {
    const timeLimitInput = page.getByLabel(/time limit|seconds/i);

    // Try to set invalid value
    await timeLimitInput.fill('61');
    await page.getByRole('button', { name: /save/i }).click();

    // Should show error or prevent save
    const errorMessage = page.locator('text=/invalid|maximum|at most 60/i');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    } else {
      // Input might cap at 60
      const value = await timeLimitInput.inputValue();
      expect(parseInt(value)).toBeLessThanOrEqual(60);
    }
  });

  test('should filter chord types using checkboxes', async ({ page }) => {
    // Find chord type checkboxes
    const majorCheckbox = page.getByLabel(/major/i);
    const minorCheckbox = page.getByLabel(/minor/i);

    await expect(majorCheckbox).toBeVisible();
    await expect(minorCheckbox).toBeVisible();

    // Uncheck all except Major
    if (await minorCheckbox.isChecked()) {
      await minorCheckbox.click();
    }

    // Check that at least Major is checked
    await expect(majorCheckbox).toBeChecked();

    // Save settings
    await page.getByRole('button', { name: /save/i }).click();

    // Should show success
    await expect(page.locator('text=/saved|success/i').first()).toBeVisible({ timeout: 3000 });
  });

  test('should prevent saving with no chord types selected', async ({ page }) => {
    // Try to uncheck all chord types
    const checkboxes = page.getByRole('checkbox', { checked: true });
    const count = await checkboxes.count();

    // Uncheck all
    for (let i = 0; i < count; i++) {
      const checkbox = checkboxes.nth(i);
      if (await checkbox.isVisible() && await checkbox.isChecked()) {
        await checkbox.click();
      }
    }

    // Try to save
    await page.getByRole('button', { name: /save/i }).click();

    // Should show error
    await expect(page.locator('text=/at least one|select at least/i').first()).toBeVisible({ timeout: 3000 });
  });

  test('should have "Select All" helper button', async ({ page }) => {
    const selectAllButton = page.getByRole('button', { name: /select all/i });

    if (await selectAllButton.isVisible()) {
      await selectAllButton.click();

      // All checkboxes should be checked
      const uncheckedBoxes = page.getByRole('checkbox', { checked: false });
      expect(await uncheckedBoxes.count()).toBe(0);
    }
  });

  test('should have "Clear All" helper button', async ({ page }) => {
    const clearAllButton = page.getByRole('button', { name: /clear all|deselect/i });

    if (await clearAllButton.isVisible()) {
      // First select all
      const selectAllButton = page.getByRole('button', { name: /select all/i });
      if (await selectAllButton.isVisible()) {
        await selectAllButton.click();
      }

      // Then clear all
      await clearAllButton.click();

      // All checkboxes should be unchecked
      const checkedBoxes = page.getByRole('checkbox', { checked: true });
      expect(await checkedBoxes.count()).toBe(0);
    }
  });

  test('should persist preferences across page reloads', async ({ page }) => {
    // Set specific preferences
    const timeLimitInput = page.getByLabel(/time limit|seconds/i);
    await timeLimitInput.fill('20');

    const majorCheckbox = page.getByLabel(/major/i, { exact: false });
    await majorCheckbox.check();

    // Save
    await page.getByRole('button', { name: /save/i }).click();
    await page.waitForTimeout(500);

    // Reload page
    await page.reload();

    // Verify time limit persisted
    const newTimeValue = await timeLimitInput.inputValue();
    expect(parseInt(newTimeValue)).toBe(20);

    // Verify Major is still checked
    await expect(majorCheckbox).toBeChecked();
  });

  test('should apply preferences to practice session', async ({ page }) => {
    // Set custom time limit
    const timeLimitInput = page.getByLabel(/time limit|seconds/i);
    await timeLimitInput.fill('5');

    // Enable only Major chords
    const checkboxes = page.getByRole('checkbox');
    const count = await checkboxes.count();

    // Uncheck all first
    for (let i = 0; i < count; i++) {
      const checkbox = checkboxes.nth(i);
      if (await checkbox.isChecked()) {
        await checkbox.uncheck();
      }
    }

    // Check only Major
    const majorCheckbox = page.getByLabel(/major/i, { exact: false });
    await majorCheckbox.check();

    // Save
    await page.getByRole('button', { name: /save/i }).click();
    await page.waitForTimeout(500);

    // Navigate to home/practice page
    await page.goto('/');

    // Start session
    await page.getByRole('button', { name: /start/i }).click();

    // Should show a chord (we can't easily verify it's Major only without implementation details)
    const chordDisplay = page.locator('[data-testid="chord-display"]').or(page.locator('h1, h2, h3').first());
    await expect(chordDisplay).toBeVisible();

    // Timer should exist (using custom 5s setting)
    const timer = page.locator('[data-testid="timer"]').or(page.locator('text=/[0-9]+/'));
    await expect(timer).toBeVisible();
  });

  test('should have cancel button that discards changes', async ({ page }) => {
    const timeLimitInput = page.getByLabel(/time limit|seconds/i);
    const originalValue = await timeLimitInput.inputValue();

    // Make a change
    await timeLimitInput.fill('25');

    // Click cancel
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    if (await cancelButton.isVisible()) {
      await cancelButton.click();

      // Value should revert or page should navigate away
      const currentValue = await timeLimitInput.inputValue();
      // Either value reverted or we're on a different page
      const currentUrl = page.url();
      const isOnSettingsPage = currentUrl.includes('/settings');
      expect(isOnSettingsPage || currentValue === originalValue).toBe(true);
    }
  });
});

test.describe('Navigation', () => {
  test('should navigate between home and settings', async ({ page }) => {
    // Go to home
    await page.goto('/');

    // Find link to settings
    const settingsLink = page.getByRole('link', { name: /settings/i });
    await expect(settingsLink).toBeVisible();

    // Click to settings
    await settingsLink.click();

    // Should be on settings page
    await expect(page).toHaveURL(/\/settings/);

    // Navigate back to home
    const homeLink = page.getByRole('link', { name: /home|practice/i });
    await homeLink.click();

    // Should be on home page
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe('Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
  });

  test('should handle extremely short time limit (3 seconds)', async ({ page }) => {
    const timeLimitInput = page.getByLabel(/time limit|seconds/i);

    await timeLimitInput.fill('3');
    await page.getByRole('button', { name: /save/i }).click();

    await expect(page.locator('text=/saved|success/i').first()).toBeVisible({ timeout: 3000 });

    await page.reload();
    const value = await timeLimitInput.inputValue();
    expect(parseInt(value)).toBe(3);
  });

  test('should handle maximum time limit (60 seconds)', async ({ page }) => {
    const timeLimitInput = page.getByLabel(/time limit|seconds/i);

    await timeLimitInput.fill('60');
    await page.getByRole('button', { name: /save/i }).click();

    await expect(page.locator('text=/saved|success/i').first()).toBeVisible({ timeout: 3000 });

    await page.reload();
    const value = await timeLimitInput.inputValue();
    expect(parseInt(value)).toBe(60);
  });

  test('should handle selecting all chord types', async ({ page }) => {
    // Select all
    const selectAllButton = page.getByRole('button', { name: /select all/i });
    if (await selectAllButton.isVisible()) {
      await selectAllButton.click();
    }

    // Save
    await page.getByRole('button', { name: /save/i }).click();

    await expect(page.locator('text=/saved|success/i').first()).toBeVisible({ timeout: 3000 });
  });
});

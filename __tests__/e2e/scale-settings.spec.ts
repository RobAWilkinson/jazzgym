import { test, expect } from '@playwright/test';

test.describe('Scale Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/scales-settings');
  });

  test('should display settings page with time limit and scale filters', async ({ page }) => {
    // Should show time limit input
    const timeLimitInput = page.getByLabel(/time limit|seconds per scale/i);
    await expect(timeLimitInput).toBeVisible();

    // Should show scale type filters
    const scaleFilters = page.locator('text=/scale type|filter|major|minor|dorian/i').first();
    await expect(scaleFilters).toBeVisible();

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

    // Should show error
    const errorMessage = page.locator('text=/must be between 3 and 60/i');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });

  test('should prevent time limit above 60 seconds', async ({ page }) => {
    const timeLimitInput = page.getByLabel(/time limit|seconds/i);

    // Try to set invalid value
    await timeLimitInput.fill('61');
    await page.getByRole('button', { name: /save/i }).click();

    // Should show error
    const errorMessage = page.locator('text=/must be between 3 and 60/i');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });

  test('should filter scale types using checkboxes', async ({ page }) => {
    // Find scale type checkboxes
    const majorCheckbox = page.getByLabel(/^major$/i, { exact: false });
    const minorCheckbox = page.getByLabel(/natural minor/i);

    await expect(majorCheckbox).toBeVisible();
    await expect(minorCheckbox).toBeVisible();

    // Toggle scale type
    await majorCheckbox.click();
    await page.waitForTimeout(300);

    // Save settings
    await page.getByRole('button', { name: /save/i }).click();

    // Should show success
    await expect(page.locator('text=/saved|success/i').first()).toBeVisible({ timeout: 3000 });
  });

  test('should prevent saving with no scale types selected', async ({ page }) => {
    // Get all checked checkboxes
    const checkboxes = page.getByRole('checkbox', { checked: true });
    const count = await checkboxes.count();

    // Try to uncheck all except one, then uncheck the last one
    // The component should prevent the last checkbox from being unchecked
    for (let i = 0; i < count; i++) {
      const checkbox = checkboxes.nth(0);
      if (await checkbox.isVisible()) {
        await checkbox.click();
        await page.waitForTimeout(200);
      }
    }

    // Should show error or have at least one checkbox still checked
    const remainingChecked = await page.getByRole('checkbox', { checked: true }).count();
    expect(remainingChecked).toBeGreaterThanOrEqual(1);

    // If we try to save with one type selected, it should work
    await page.getByRole('button', { name: /save/i }).click();

    // Should either save successfully or show no error about empty selection
    const emptyError = page.locator('text=/at least one/i');
    const isEmpty = await emptyError.isVisible();

    if (!isEmpty) {
      // Saved successfully
      await expect(page.locator('text=/saved|success/i').first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('should have "Select All" helper button', async ({ page }) => {
    const selectAllButton = page.getByRole('button', { name: /select all/i });

    await expect(selectAllButton).toBeVisible();
    await selectAllButton.click();

    // All checkboxes should be checked
    const totalCheckboxes = await page.getByRole('checkbox').count();
    const checkedCheckboxes = await page.getByRole('checkbox', { checked: true }).count();

    expect(checkedCheckboxes).toBe(totalCheckboxes);
  });

  test('should have "Clear All" helper button', async ({ page }) => {
    const clearAllButton = page.getByRole('button', { name: /clear all/i });

    if (await clearAllButton.isVisible()) {
      // First select all
      const selectAllButton = page.getByRole('button', { name: /select all/i });
      if (await selectAllButton.isVisible()) {
        await selectAllButton.click();
        await page.waitForTimeout(300);
      }

      // Then clear all
      await clearAllButton.click();
      await page.waitForTimeout(300);

      // Should have exactly 1 checkbox checked (minimum requirement)
      const checkedBoxes = page.getByRole('checkbox', { checked: true });
      expect(await checkedBoxes.count()).toBe(1);
    }
  });

  test('should persist preferences across page reloads', async ({ page }) => {
    // Set specific preferences
    const timeLimitInput = page.getByLabel(/time limit|seconds/i);
    await timeLimitInput.fill('20');

    // Ensure at least Major is checked
    const majorCheckbox = page.getByLabel(/^major$/i, { exact: false });
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

    // Enable only Major scales using Select All then keeping only Major
    const selectAllButton = page.getByRole('button', { name: /select all/i });
    await selectAllButton.click();
    await page.waitForTimeout(300);

    // Uncheck all except Major
    const scaleTypes = ['Natural Minor', 'Harmonic Minor', 'Melodic Minor', 'Dorian', 'Mixolydian', 'Altered', 'Lydian', 'Phrygian', 'Locrian'];
    for (const type of scaleTypes) {
      const checkbox = page.getByLabel(new RegExp(type, 'i'));
      if (await checkbox.isVisible() && await checkbox.isChecked()) {
        await checkbox.click();
        await page.waitForTimeout(100);
      }
    }

    // Verify only Major is checked
    const majorCheckbox = page.getByLabel(/^major$/i, { exact: false });
    await expect(majorCheckbox).toBeChecked();

    // Save
    await page.getByRole('button', { name: /save/i }).click();
    await page.waitForTimeout(500);

    // Navigate to scale practice page
    await page.goto('/scales');

    // Start session
    await page.getByRole('button', { name: /start/i }).click();

    // Should show a scale
    const scaleDisplay = page.locator('[data-testid="scale-display"]');
    await expect(scaleDisplay).toBeVisible({ timeout: 5000 });

    // Timer should exist
    const timer = page.locator('[data-testid="countdown-timer"]');
    await expect(timer).toBeVisible();
  });

  test('should have cancel button that discards changes', async ({ page }) => {
    const timeLimitInput = page.getByLabel(/time limit|seconds/i);
    const originalValue = await timeLimitInput.inputValue();

    // Make a change
    await timeLimitInput.fill('25');

    // Click cancel
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await cancelButton.click();

    // Value should revert
    const currentValue = await timeLimitInput.inputValue();
    expect(currentValue).toBe(originalValue);
  });

  test('should navigate back to practice page', async ({ page }) => {
    const backButton = page.getByRole('button', { name: /back to practice/i });
    await expect(backButton).toBeVisible();

    await backButton.click();

    // Should navigate to scales page
    await expect(page).toHaveURL(/\/scales$/);
  });
});

test.describe('Scale Type Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/scales-settings');
  });

  test('should filter with single scale type (only Major)', async ({ page }) => {
    // Deselect all except Major
    const selectAllButton = page.getByRole('button', { name: /select all/i });
    await selectAllButton.click();
    await page.waitForTimeout(300);

    const scaleTypes = ['Natural Minor', 'Harmonic Minor', 'Melodic Minor', 'Dorian', 'Mixolydian', 'Altered', 'Lydian', 'Phrygian', 'Locrian'];
    for (const type of scaleTypes) {
      const checkbox = page.getByLabel(new RegExp(type, 'i'));
      if (await checkbox.isVisible() && await checkbox.isChecked()) {
        await checkbox.click();
        await page.waitForTimeout(100);
      }
    }

    // Save
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.locator('text=/saved|success/i').first()).toBeVisible({ timeout: 3000 });

    // Verify Major is still checked after save
    const majorCheckbox = page.getByLabel(/^major$/i, { exact: false });
    await expect(majorCheckbox).toBeChecked();
  });

  test('should filter with multiple scale types', async ({ page }) => {
    // Select only Major and Harmonic Minor
    const clearAllButton = page.getByRole('button', { name: /clear all/i });
    await clearAllButton.click();
    await page.waitForTimeout(300);

    const majorCheckbox = page.getByLabel(/^major$/i, { exact: false });
    const harmonicMinorCheckbox = page.getByLabel(/harmonic minor/i);

    await majorCheckbox.check();
    await page.waitForTimeout(200);
    await harmonicMinorCheckbox.check();
    await page.waitForTimeout(200);

    // Save
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.locator('text=/saved|success/i').first()).toBeVisible({ timeout: 3000 });

    // Verify both are checked
    await expect(majorCheckbox).toBeChecked();
    await expect(harmonicMinorCheckbox).toBeChecked();
  });
});

test.describe('Preference Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/scales-settings');
  });

  test('should maintain preferences after multiple saves', async ({ page }) => {
    const timeLimitInput = page.getByLabel(/time limit|seconds/i);

    // First save
    await timeLimitInput.fill('15');
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.locator('text=/saved|success/i').first()).toBeVisible({ timeout: 3000 });

    // Second save with different value
    await timeLimitInput.fill('20');
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.locator('text=/saved|success/i').first()).toBeVisible({ timeout: 3000 });

    // Reload and verify last saved value
    await page.reload();
    const finalValue = await timeLimitInput.inputValue();
    expect(parseInt(finalValue)).toBe(20);
  });
});

test.describe('Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/scales-settings');
  });

  test('should handle selecting all 10 scale types', async ({ page }) => {
    const selectAllButton = page.getByRole('button', { name: /select all/i });
    await selectAllButton.click();
    await page.waitForTimeout(300);

    // Save
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.locator('text=/saved|success/i').first()).toBeVisible({ timeout: 3000 });

    // Verify all are still checked
    const totalCheckboxes = await page.getByRole('checkbox').count();
    const checkedCheckboxes = await page.getByRole('checkbox', { checked: true }).count();
    expect(checkedCheckboxes).toBe(totalCheckboxes);
  });

  test('should handle minimum time limit (3 seconds)', async ({ page }) => {
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
});

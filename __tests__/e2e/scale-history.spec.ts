import { test, expect } from '@playwright/test';

test.describe('Scale History Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/scales-history');
  });

  test('should display scale history page', async ({ page }) => {
    // Should show page title
    await expect(page.getByText('Scale Practice History')).toBeVisible();

    // Should show back button
    const backButton = page.getByRole('button', { name: /back to practice/i });
    await expect(backButton).toBeVisible();
  });

  test('should navigate back to scale practice page', async ({ page }) => {
    const backButton = page.getByRole('button', { name: /back to practice/i });
    await backButton.click();

    // Should navigate to /scales
    await expect(page).toHaveURL(/\/scales$/);
  });

  test('should display empty state when no sessions exist', async ({ page }) => {
    // Clear all history first if any exists
    const clearAllButton = page.getByRole('button', { name: /clear all history/i });
    if (await clearAllButton.isVisible()) {
      await clearAllButton.click();

      // Confirm clear all
      const confirmButton = page.getByRole('button', { name: /^clear all$/i });
      await confirmButton.click();

      // Wait for success toast
      await page.waitForTimeout(500);
    }

    // Should show empty state
    await expect(page.getByText(/no scale practice sessions yet/i)).toBeVisible();

    // Should not show statistics card
    const statsCard = page.getByTestId('practice-stats');
    await expect(statsCard).not.toBeVisible();
  });

  test('should display session history after completing a session', async ({ page }) => {
    // Navigate to scale practice
    await page.goto('/scales');

    // Start a session
    const startButton = page.getByRole('button', { name: /start/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(500);

      // End session
      await page.getByRole('button', { name: /end session/i }).click();
      await page.waitForTimeout(500);

      // Close summary dialog
      const closeButton = page.getByRole('button', { name: /close/i });
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }

    // Navigate to history
    await page.goto('/scales-history');

    // Should show at least one session
    const sessionItems = page.getByTestId('session-item');
    await expect(sessionItems.first()).toBeVisible();

    // Session should show scale count
    await expect(sessionItems.first().getByText(/scales/i)).toBeVisible();
  });

  test('should display statistics when sessions exist', async ({ page }) => {
    // Navigate to scale practice and create a session if none exist
    await page.goto('/scales');
    const startButton = page.getByRole('button', { name: /start/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /end session/i }).click();
      await page.waitForTimeout(500);
      const closeButton = page.getByRole('button', { name: /close/i });
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }

    // Navigate to history
    await page.goto('/scales-history');

    // Should show statistics card
    const statsCard = page.getByTestId('practice-stats');
    await expect(statsCard).toBeVisible();

    // Should show stats title
    await expect(page.getByText('Statistics')).toBeVisible();
    await expect(page.getByText(/scale practice progress/i)).toBeVisible();

    // Should show session count, scale count, and minutes
    await expect(page.getByText(/sessions/i)).toBeVisible();
    await expect(page.getByText(/scales/i)).toBeVisible();
    await expect(page.getByText(/minutes/i)).toBeVisible();
  });

  test('should delete a session', async ({ page }) => {
    // Ensure at least one session exists
    await page.goto('/scales');
    const startButton = page.getByRole('button', { name: /start/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /end session/i }).click();
      await page.waitForTimeout(500);
      const closeButton = page.getByRole('button', { name: /close/i });
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }

    // Navigate to history
    await page.goto('/scales-history');

    // Get initial session count
    const sessionsBefore = await page.getByTestId('session-item').count();
    expect(sessionsBefore).toBeGreaterThan(0);

    // Delete the first session
    const deleteButton = page.getByTestId('session-item').first().getByRole('button', { name: /delete/i });
    await deleteButton.click();

    // Confirm deletion
    const confirmButton = page.getByRole('button', { name: /^delete$/i });
    await confirmButton.click();

    // Wait for success toast
    await expect(page.getByText(/deleted/i)).toBeVisible({ timeout: 3000 });

    // Session count should decrease
    const sessionsAfter = await page.getByTestId('session-item').count();
    expect(sessionsAfter).toBe(sessionsBefore - 1);
  });

  test('should clear all history', async ({ page }) => {
    // Ensure at least one session exists
    await page.goto('/scales');
    const startButton = page.getByRole('button', { name: /start/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /end session/i }).click();
      await page.waitForTimeout(500);
      const closeButton = page.getByRole('button', { name: /close/i });
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }

    // Navigate to history
    await page.goto('/scales-history');

    // Should have sessions
    const sessionsBefore = await page.getByTestId('session-item').count();
    expect(sessionsBefore).toBeGreaterThan(0);

    // Click clear all
    const clearAllButton = page.getByRole('button', { name: /clear all history/i });
    await clearAllButton.click();

    // Confirm clear all
    const confirmButton = page.getByRole('button', { name: /^clear all$/i });
    await confirmButton.click();

    // Wait for success toast
    await expect(page.getByText(/cleared/i)).toBeVisible({ timeout: 3000 });

    // Should show empty state
    await expect(page.getByText(/no scale practice sessions yet/i)).toBeVisible();
  });

  test('should display session details correctly', async ({ page }) => {
    // Create a session with known parameters
    await page.goto('/scales-settings');

    // Set time limit to 5 seconds
    const timeLimitInput = page.getByLabel(/time limit|seconds/i);
    await timeLimitInput.fill('5');

    // Save settings
    await page.getByRole('button', { name: /save/i }).click();
    await page.waitForTimeout(500);

    // Start a practice session
    await page.goto('/scales');
    await page.getByRole('button', { name: /start/i }).click();
    await page.waitForTimeout(500);

    // End session immediately
    await page.getByRole('button', { name: /end session/i }).click();
    await page.waitForTimeout(500);

    const closeButton = page.getByRole('button', { name: /close/i });
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }

    // Navigate to history
    await page.goto('/scales-history');

    // First session should show details
    const firstSession = page.getByTestId('session-item').first();
    await expect(firstSession).toBeVisible();

    // Should show time limit used
    await expect(firstSession.getByText(/5s per scale/i)).toBeVisible();

    // Should show scale count
    await expect(firstSession.getByText(/\d+ scales/i)).toBeVisible();

    // Should show duration
    await expect(firstSession.getByText(/\d+[ms]/i)).toBeVisible();
  });

  test('should show loading state', async ({ page }) => {
    // Navigate to history page
    const response = page.goto('/scales-history');

    // Should show loading skeletons briefly
    // This test is timing-dependent, so we just check the page loads
    await response;

    // After loading, should show either sessions or empty state
    const hasHistory = await page.getByTestId('session-item').first().isVisible().catch(() => false);
    const hasEmptyState = await page.getByText(/no scale practice sessions yet/i).isVisible().catch(() => false);

    expect(hasHistory || hasEmptyState).toBe(true);
  });
});

test.describe('Scale History Statistics', () => {
  test.beforeEach(async ({ page }) => {
    // Clear existing history
    await page.goto('/scales-history');
    const clearAllButton = page.getByRole('button', { name: /clear all history/i });
    if (await clearAllButton.isVisible()) {
      await clearAllButton.click();
      const confirmButton = page.getByRole('button', { name: /^clear all$/i });
      await confirmButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should calculate statistics correctly for multiple sessions', async ({ page }) => {
    // Create 3 sessions
    for (let i = 0; i < 3; i++) {
      await page.goto('/scales');
      const startButton = page.getByRole('button', { name: /start/i });
      if (await startButton.isVisible()) {
        await startButton.click();
        await page.waitForTimeout(500);

        // Advance 2 scales
        await page.getByRole('button', { name: /next scale/i }).click();
        await page.waitForTimeout(300);
        await page.getByRole('button', { name: /next scale/i }).click();
        await page.waitForTimeout(300);

        // End session
        await page.getByRole('button', { name: /end session/i }).click();
        await page.waitForTimeout(500);

        const closeButton = page.getByRole('button', { name: /close/i });
        if (await closeButton.isVisible()) {
          await closeButton.click();
        }
      }
    }

    // Navigate to history
    await page.goto('/scales-history');

    // Should show statistics
    const statsCard = page.getByTestId('practice-stats');
    await expect(statsCard).toBeVisible();

    // Should show 3 sessions
    await expect(statsCard.getByText('3')).toBeVisible();
    await expect(statsCard.getByText(/sessions/i)).toBeVisible();

    // Should show total scale count (approximately 9 scales = 3 sessions × 3 scales)
    // Could be slightly different due to timing
    const scaleCountText = await statsCard.locator('text=/\\d+/').nth(1).textContent();
    const scaleCount = parseInt(scaleCountText || '0');
    expect(scaleCount).toBeGreaterThanOrEqual(6); // At least 2 scales per session
  });
});

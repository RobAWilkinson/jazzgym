import { test, expect } from '@playwright/test';

test.describe('Mode Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display mode selector on home page', async ({ page }) => {
    // Should show both mode cards
    const chordMode = page.getByTestId('mode-chord');
    const scaleMode = page.getByTestId('mode-scale');

    await expect(chordMode).toBeVisible();
    await expect(scaleMode).toBeVisible();

    // Should show title and descriptions
    await expect(page.getByText('JazzGym Practice')).toBeVisible();
    await expect(page.getByText('Chord Practice')).toBeVisible();
    await expect(page.getByText('Scale Practice')).toBeVisible();
  });

  test('should navigate to chord practice when chord mode selected', async ({ page }) => {
    const chordMode = page.getByTestId('mode-chord');
    await chordMode.click();

    // Should navigate to /chords
    await expect(page).toHaveURL(/\/chords$/);

    // Should show chord practice page
    await expect(page.getByText(/Ready to Practice Chords/i)).toBeVisible();
  });

  test('should navigate to scale practice when scale mode selected', async ({ page }) => {
    const scaleMode = page.getByTestId('mode-scale');
    await scaleMode.click();

    // Should navigate to /scales
    await expect(page).toHaveURL(/\/scales$/);

    // Should show scale practice page
    await expect(page.getByText(/Ready to Practice Scales/i)).toBeVisible();
  });

  test('should switch from chord to scale practice', async ({ page }) => {
    // Start with chord practice
    await page.getByTestId('mode-chord').click();
    await expect(page).toHaveURL(/\/chords$/);

    // Navigate to scale practice via navigation
    await page.getByRole('link', { name: /^Scales$/i }).click();
    await expect(page).toHaveURL(/\/scales$/);

    // Should show scale practice page
    await expect(page.getByText(/Ready to Practice Scales/i)).toBeVisible();
  });

  test('should switch from scale to chord practice', async ({ page }) => {
    // Start with scale practice
    await page.getByTestId('mode-scale').click();
    await expect(page).toHaveURL(/\/scales$/);

    // Navigate to chord practice via navigation
    await page.getByRole('link', { name: /^Chords$/i }).click();
    await expect(page).toHaveURL(/\/chords$/);

    // Should show chord practice page
    await expect(page.getByText(/Ready to Practice Chords/i)).toBeVisible();
  });

  test('should navigate back to home page from chord practice', async ({ page }) => {
    // Go to chord practice
    await page.getByTestId('mode-chord').click();
    await expect(page).toHaveURL(/\/chords$/);

    // Click home link
    await page.getByRole('link', { name: /^Home$/i }).click();
    await expect(page).toHaveURL(/\/$/);

    // Should show mode selector again
    await expect(page.getByTestId('mode-chord')).toBeVisible();
    await expect(page.getByTestId('mode-scale')).toBeVisible();
  });

  test('should navigate back to home page from scale practice', async ({ page }) => {
    // Go to scale practice
    await page.getByTestId('mode-scale').click();
    await expect(page).toHaveURL(/\/scales$/);

    // Click home link
    await page.getByRole('link', { name: /^Home$/i }).click();
    await expect(page).toHaveURL(/\/$/);

    // Should show mode selector again
    await expect(page.getByTestId('mode-chord')).toBeVisible();
    await expect(page.getByTestId('mode-scale')).toBeVisible();
  });
});

test.describe('Separate Histories', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have separate navigation links for chord and scale history', async ({ page }) => {
    const chordHistoryLink = page.getByRole('link', { name: /Chord History/i });
    const scaleHistoryLink = page.getByRole('link', { name: /Scale History/i });

    await expect(chordHistoryLink).toBeVisible();
    await expect(scaleHistoryLink).toBeVisible();
  });

  test('should navigate to chord history page', async ({ page }) => {
    await page.getByRole('link', { name: /Chord History/i }).click();

    await expect(page).toHaveURL(/\/history$/);
    await expect(page.getByText('Practice History')).toBeVisible();
  });

  test('should navigate to scale history page', async ({ page }) => {
    await page.getByRole('link', { name: /Scale History/i }).click();

    await expect(page).toHaveURL(/\/scales-history$/);
    await expect(page.getByText('Scale Practice History')).toBeVisible();
  });

  test('chord session should not appear in scale history', async ({ page }) => {
    // Create a chord practice session
    await page.goto('/chords');

    // Start session
    const startButton = page.getByRole('button', { name: /start/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(500);

      // End session immediately
      await page.getByRole('button', { name: /end session/i }).click();
      await page.waitForTimeout(500);

      // Close summary
      const closeButton = page.getByRole('button', { name: /close/i });
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }

    // Navigate to scale history
    await page.goto('/scales-history');

    // If there are no scale sessions, should show empty state
    // If there are scale sessions, they should all say "scales" not "chords"
    const sessionItems = page.getByTestId('session-item');
    const count = await sessionItems.count();

    if (count === 0) {
      // Empty state should be shown
      await expect(page.getByText(/no scale practice sessions yet/i)).toBeVisible();
    } else {
      // All sessions should reference "scales" not "chords"
      for (let i = 0; i < count; i++) {
        const item = sessionItems.nth(i);
        await expect(item.getByText(/scales/i)).toBeVisible();
        await expect(item.getByText(/chords/i)).not.toBeVisible();
      }
    }
  });

  test('scale session should not appear in chord history', async ({ page }) => {
    // Create a scale practice session
    await page.goto('/scales');

    // Start session
    const startButton = page.getByRole('button', { name: /start/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(500);

      // End session immediately
      await page.getByRole('button', { name: /end session/i }).click();
      await page.waitForTimeout(500);

      // Close summary
      const closeButton = page.getByRole('button', { name: /close/i });
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }

    // Navigate to chord history
    await page.goto('/history');

    // If there are no chord sessions, should show empty state
    // If there are chord sessions, they should all say "chords" not "scales"
    const sessionItems = page.getByTestId('session-item');
    const count = await sessionItems.count();

    if (count === 0) {
      // Empty state should be shown
      await expect(page.getByText(/no practice sessions yet/i)).toBeVisible();
    } else {
      // All sessions should reference "chords" not "scales"
      for (let i = 0; i < count; i++) {
        const item = sessionItems.nth(i);
        await expect(item.getByText(/chords/i)).toBeVisible();
        await expect(item.getByText(/scales/i)).not.toBeVisible();
      }
    }
  });
});

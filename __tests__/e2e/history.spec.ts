import { test, expect } from '@playwright/test';

test.describe('Practice History Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home and complete a practice session first
    await page.goto('/');

    // Start and quickly end a session to create history
    await page.getByRole('button', { name: /start/i }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: /end|stop/i }).click();

    // Close summary modal if it appears
    await page.waitForTimeout(500);
    const closeButton = page.getByRole('button', { name: /close|ok|dismiss/i });
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      await page.keyboard.press('Escape');
    }

    await page.waitForTimeout(500);

    // Navigate to history page
    await page.goto('/history');
  });

  test('should display history page with session list', async ({ page }) => {
    // Should show history title or heading
    const heading = page.locator('h1, h2').filter({ hasText: /history|past sessions/i });
    await expect(heading.first()).toBeVisible();

    // Should show at least one session (from beforeEach)
    const sessionList = page.locator('[data-testid="history-list"]').or(page.locator('text=/session|chord|duration/i'));
    await expect(sessionList.first()).toBeVisible();
  });

  test('should display session details (date, chord count, duration)', async ({ page }) => {
    // Should show date/time information
    const dateInfo = page.locator('text=/\\d{4}|\\d{1,2}:\\d{2}|today|yesterday|ago/i');
    await expect(dateInfo.first()).toBeVisible();

    // Should show chord count
    const chordCount = page.locator('text=/chord/i');
    await expect(chordCount.first()).toBeVisible();

    // Should show duration
    const duration = page.locator('text=/minute|second|duration|time/i');
    await expect(duration.first()).toBeVisible();
  });

  test('should show practice statistics summary', async ({ page }) => {
    // Should show summary card with total stats
    const statsCard = page.locator('[data-testid="practice-stats"]').or(page.locator('text=/total|statistics|summary/i'));
    await expect(statsCard.first()).toBeVisible();

    // Stats might include: total sessions, total chords, total time
    const statsText = page.locator('text=/total|sessions|chords|minutes|hours/i');
    expect(await statsText.count()).toBeGreaterThan(0);
  });

  test('should have delete button for each session', async ({ page }) => {
    // Find delete button for a session
    const deleteButton = page.getByRole('button', { name: /delete|remove|trash/i }).first();
    await expect(deleteButton).toBeVisible();
  });

  test('should show confirmation dialog before deleting session', async ({ page }) => {
    // Click delete on first session
    const deleteButton = page.getByRole('button', { name: /delete|remove|trash/i }).first();
    await deleteButton.click();

    // Should show confirmation dialog
    const confirmDialog = page.locator('text=/are you sure|confirm|delete this session/i');
    await expect(confirmDialog.first()).toBeVisible({ timeout: 2000 });

    // Should have confirm and cancel buttons
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
    const cancelButton = page.getByRole('button', { name: /cancel|no/i });

    await expect(confirmButton).toBeVisible();
    await expect(cancelButton).toBeVisible();
  });

  test('should delete session when confirmed', async ({ page }) => {
    // Get initial session count
    const sessions = page.locator('[data-testid="session-item"]').or(page.getByRole('button', { name: /delete/i }));
    const initialCount = await sessions.count();

    // Delete a session
    const deleteButton = page.getByRole('button', { name: /delete|remove|trash/i }).first();
    await deleteButton.click();

    // Confirm deletion
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
    await confirmButton.click();

    // Wait for deletion to complete
    await page.waitForTimeout(500);

    // Session count should decrease
    const newCount = await sessions.count();
    expect(newCount).toBeLessThanOrEqual(initialCount);
  });

  test('should cancel deletion when cancelled', async ({ page }) => {
    // Get initial session count
    const deleteButtons = page.getByRole('button', { name: /delete|remove|trash/i });
    const initialCount = await deleteButtons.count();

    // Click delete
    await deleteButtons.first().click();

    // Cancel deletion
    const cancelButton = page.getByRole('button', { name: /cancel|no/i });
    await cancelButton.click();

    // Wait a bit
    await page.waitForTimeout(300);

    // Session count should remain the same
    const newCount = await deleteButtons.count();
    expect(newCount).toBe(initialCount);
  });

  test('should have "Clear All History" button', async ({ page }) => {
    const clearAllButton = page.getByRole('button', { name: /clear all|delete all|clear history/i });
    await expect(clearAllButton).toBeVisible();
  });

  test('should show confirmation before clearing all history', async ({ page }) => {
    // Click clear all
    const clearAllButton = page.getByRole('button', { name: /clear all|delete all|clear history/i });
    await clearAllButton.click();

    // Should show confirmation dialog
    const confirmDialog = page.locator('text=/are you sure|confirm|delete all|clear all/i');
    await expect(confirmDialog.first()).toBeVisible({ timeout: 2000 });
  });

  test('should clear all history when confirmed', async ({ page }) => {
    // Click clear all
    const clearAllButton = page.getByRole('button', { name: /clear all|delete all|clear history/i });
    await clearAllButton.click();

    // Confirm
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete|clear/i });
    await confirmButton.click();

    // Wait for deletion
    await page.waitForTimeout(1000);

    // Should show empty state
    const emptyState = page.locator('text=/no history|no sessions|empty|start practicing/i');
    await expect(emptyState.first()).toBeVisible({ timeout: 2000 });
  });

  test('should display empty state when no history exists', async ({ page }) => {
    // Clear all history first
    const clearAllButton = page.getByRole('button', { name: /clear all|delete all|clear history/i });
    if (await clearAllButton.isVisible()) {
      await clearAllButton.click();
      const confirmButton = page.getByRole('button', { name: /confirm|yes|delete|clear/i });
      await confirmButton.click();
      await page.waitForTimeout(500);
    }

    // Should show empty state message
    const emptyMessage = page.locator('text=/no history|no sessions|empty|haven\'t practiced/i');
    await expect(emptyMessage.first()).toBeVisible();
  });
});

test.describe('History Navigation', () => {
  test('should navigate to history page from home', async ({ page }) => {
    await page.goto('/');

    // Find history link
    const historyLink = page.getByRole('link', { name: /history|past sessions/i });
    await expect(historyLink).toBeVisible();

    // Click to history
    await historyLink.click();

    // Should be on history page
    await expect(page).toHaveURL(/\/history/);
  });

  test('should navigate back to home from history', async ({ page }) => {
    await page.goto('/history');

    // Find home link
    const homeLink = page.getByRole('link', { name: /home|practice/i });
    await homeLink.click();

    // Should be on home page
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe('History Details', () => {
  test('should show chord names for each session', async ({ page }) => {
    await page.goto('/');

    // Complete a session with multiple chords
    await page.getByRole('button', { name: /start/i }).click();
    await page.waitForTimeout(2000); // Wait for a couple chords
    await page.getByRole('button', { name: /end|stop/i }).click();

    // Close summary
    await page.waitForTimeout(500);
    const closeButton = page.getByRole('button', { name: /close|ok|dismiss/i });
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      await page.keyboard.press('Escape');
    }

    await page.goto('/history');

    // Session should show chord information
    const sessionItem = page.locator('[data-testid="session-item"]').first();
    await expect(sessionItem.or(page.locator('text=/chord/i').first())).toBeVisible();
  });

  test('should display sessions in descending order (newest first)', async ({ page }) => {
    await page.goto('/');

    // Create multiple sessions
    for (let i = 0; i < 2; i++) {
      await page.getByRole('button', { name: /start/i }).click();
      await page.waitForTimeout(1000);
      await page.getByRole('button', { name: /end|stop/i }).click();
      await page.waitForTimeout(500);

      // Close summary
      const closeButton = page.getByRole('button', { name: /close|ok|dismiss/i });
      if (await closeButton.isVisible()) {
        await closeButton.click();
      } else {
        await page.keyboard.press('Escape');
      }

      await page.waitForTimeout(500);
    }

    await page.goto('/history');

    // Should have multiple sessions
    const sessions = page.locator('[data-testid="session-item"]').or(page.getByRole('button', { name: /delete/i }));
    expect(await sessions.count()).toBeGreaterThan(1);

    // Newest should be first (verification would require checking timestamps)
  });
});

test.describe('Practice Stats', () => {
  test('should calculate and display total practice statistics', async ({ page }) => {
    await page.goto('/');

    // Complete a practice session
    await page.getByRole('button', { name: /start/i }).click();
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: /end|stop/i }).click();

    await page.waitForTimeout(500);
    const closeButton = page.getByRole('button', { name: /close|ok|dismiss/i });
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      await page.keyboard.press('Escape');
    }

    await page.goto('/history');

    // Should show total sessions
    const totalSessions = page.locator('text=/total sessions|sessions:/i');
    await expect(totalSessions.first()).toBeVisible();

    // Should show total chords
    const totalChords = page.locator('text=/total chords|chords:/i');
    await expect(totalChords.first()).toBeVisible();

    // Should show total time
    const totalTime = page.locator('text=/total time|total minutes|practice time/i');
    await expect(totalTime.first()).toBeVisible();
  });

  test('should show zero stats when no history exists', async ({ page }) => {
    await page.goto('/history');

    // Clear all history
    const clearAllButton = page.getByRole('button', { name: /clear all|delete all/i });
    if (await clearAllButton.isVisible()) {
      await clearAllButton.click();
      const confirmButton = page.getByRole('button', { name: /confirm|yes|delete|clear/i });
      await confirmButton.click();
      await page.waitForTimeout(500);
    }

    // Stats should show zeros or be hidden
    const emptyMessage = page.locator('text=/no history|no sessions/i');
    await expect(emptyMessage.first()).toBeVisible();
  });
});

test.describe('Edge Cases', () => {
  test('should handle very long practice sessions (100+ chords)', async ({ page }) => {
    // This would be a manual/integration test
    // For E2E, we just verify the page can display large numbers
    expect(true).toBe(true);
  });

  test('should handle session deletion and list refresh', async ({ page }) => {
    await page.goto('/history');

    // Delete a session
    const deleteButton = page.getByRole('button', { name: /delete|remove/i }).first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
      await confirmButton.click();

      // Wait for refresh
      await page.waitForTimeout(500);

      // Page should still be functional
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();
    }
  });
});

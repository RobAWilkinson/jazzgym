import { test, expect } from '@playwright/test';

test.describe('Scale Practice Session', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/scales');
  });

  test('should display start screen before session begins', async ({ page }) => {
    // Should show heading
    await expect(page.locator('h2').filter({ hasText: /Ready to Practice Scales/i })).toBeVisible();

    // Should show start button
    const startButton = page.getByRole('button', { name: /start practice/i });
    await expect(startButton).toBeVisible();

    // Should show time limit info
    await expect(page.locator('text=/Time limit.*per scale/i')).toBeVisible();
  });

  test('should start a scale practice session and display first scale', async ({ page }) => {
    // Start session
    const startButton = page.getByRole('button', { name: /start practice/i });
    await startButton.click();

    // Should show scale display
    const scaleDisplay = page.locator('[data-testid="scale-display"]');
    await expect(scaleDisplay).toBeVisible({ timeout: 5000 });

    // Should show a scale name (e.g., "C Major", "F# Harmonic Minor")
    const scaleText = await scaleDisplay.textContent();
    expect(scaleText).toMatch(/[A-G][#b]?\s+(Major|Natural Minor|Harmonic Minor|Melodic Minor|Dorian|Mixolydian|Altered|Lydian|Phrygian|Locrian)/i);

    // Should show timer
    const timer = page.locator('[data-testid="countdown-timer"]');
    await expect(timer).toBeVisible();

    // Should show controls
    await expect(page.getByRole('button', { name: /next scale/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /end session/i })).toBeVisible();

    // Should show scales completed count
    await expect(page.locator('text=/Scales completed.*0/i')).toBeVisible();
  });

  test('should auto-advance to next scale when timer expires', async ({ page }) => {
    // Set a short time limit for faster testing (if settings page exists)
    // For now, we'll just test the auto-advance behavior

    await page.getByRole('button', { name: /start practice/i }).click();

    const scaleDisplay = page.locator('[data-testid="scale-display"]');
    await expect(scaleDisplay).toBeVisible({ timeout: 5000 });

    // Get first scale name
    const firstScale = await scaleDisplay.textContent();

    // Wait for timer to expire and auto-advance (max wait: 15 seconds)
    // The timer should auto-advance when it hits 0
    await page.waitForTimeout(12000); // Wait up to 12 seconds (accounting for 10s default + buffer)

    // Check if scale changed or count increased
    const scalesCompletedText = await page.locator('text=/Scales completed/i').textContent();
    expect(scalesCompletedText).toMatch(/Scales completed.*[1-9]/);
  });

  test('should manually advance to next scale', async ({ page }) => {
    await page.getByRole('button', { name: /start practice/i }).click();

    const scaleDisplay = page.locator('[data-testid="scale-display"]');
    await expect(scaleDisplay).toBeVisible({ timeout: 5000 });

    // Get first scale
    const firstScale = await scaleDisplay.textContent();

    // Click "Next Scale" button
    await page.getByRole('button', { name: /next scale/i }).click();

    // Wait a moment for the scale to change
    await page.waitForTimeout(500);

    // Verify scales completed increased
    await expect(page.locator('text=/Scales completed.*1/i')).toBeVisible();

    // Scale should have changed (with high probability, but not guaranteed)
    // We just verify a scale is still displayed
    const secondScale = await scaleDisplay.textContent();
    expect(secondScale).toMatch(/[A-G][#b]?\s+(Major|Natural Minor|Harmonic Minor|Melodic Minor|Dorian|Mixolydian|Altered|Lydian|Phrygian|Locrian)/i);
  });

  test('should advance through multiple scales', async ({ page }) => {
    await page.getByRole('button', { name: /start practice/i }).click();

    await expect(page.locator('[data-testid="scale-display"]')).toBeVisible({ timeout: 5000 });

    const nextButton = page.getByRole('button', { name: /next scale/i });

    // Advance through 5 scales
    for (let i = 1; i <= 5; i++) {
      await nextButton.click();
      await page.waitForTimeout(300);

      // Verify count increased
      await expect(page.locator(`text=/Scales completed.*${i}/i`)).toBeVisible();
    }
  });

  test('should end session and show summary', async ({ page }) => {
    await page.getByRole('button', { name: /start practice/i }).click();

    await expect(page.locator('[data-testid="scale-display"]')).toBeVisible({ timeout: 5000 });

    // Practice a few scales
    const nextButton = page.getByRole('button', { name: /next scale/i });
    await nextButton.click();
    await page.waitForTimeout(300);
    await nextButton.click();
    await page.waitForTimeout(300);

    // End session
    await page.getByRole('button', { name: /end session/i }).click();

    // Should show summary dialog
    const summary = page.locator('[data-testid="session-summary"]');
    await expect(summary).toBeVisible({ timeout: 3000 });

    // Summary should show scales practiced
    await expect(summary.locator('text=/Scales Practiced/i')).toBeVisible();
    await expect(summary.locator('text=/[3-9]/').first()).toBeVisible(); // At least 3 scales (1 initial + 2 advanced)

    // Summary should show duration
    await expect(summary.locator('text=/Duration/i')).toBeVisible();
  });

  test('should close summary and return to start screen', async ({ page }) => {
    await page.getByRole('button', { name: /start practice/i }).click();
    await expect(page.locator('[data-testid="scale-display"]')).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: /end session/i }).click();

    const summary = page.locator('[data-testid="session-summary"]');
    await expect(summary).toBeVisible({ timeout: 3000 });

    // Close summary
    const closeButton = summary.getByRole('button', { name: /close/i });
    await closeButton.click();

    // Should return to start screen
    await expect(page.getByRole('button', { name: /start practice/i })).toBeVisible();
  });

  test('should support keyboard shortcuts', async ({ page }) => {
    // Start with Space key
    await page.keyboard.press('Space');

    await expect(page.locator('[data-testid="scale-display"]')).toBeVisible({ timeout: 5000 });

    // Advance with Space
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    await expect(page.locator('text=/Scales completed.*1/i')).toBeVisible();

    // Advance with Enter
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    await expect(page.locator('text=/Scales completed.*2/i')).toBeVisible();

    // End with Escape
    await page.keyboard.press('Escape');

    await expect(page.locator('[data-testid="session-summary"]')).toBeVisible({ timeout: 3000 });
  });

  test('should prevent consecutive duplicate scales', async ({ page }) => {
    await page.getByRole('button', { name: /start practice/i }).click();

    const scaleDisplay = page.locator('[data-testid="scale-display"]');
    await expect(scaleDisplay).toBeVisible({ timeout: 5000 });

    const scales: string[] = [];
    const nextButton = page.getByRole('button', { name: /next scale/i });

    // Collect first scale
    scales.push((await scaleDisplay.textContent()) || '');

    // Advance through 10 scales and check no consecutive duplicates
    for (let i = 0; i < 10; i++) {
      await nextButton.click();
      await page.waitForTimeout(300);

      const currentScale = (await scaleDisplay.textContent()) || '';
      scales.push(currentScale);

      // Check that current scale is different from previous
      if (i > 0) {
        expect(currentScale).not.toBe(scales[scales.length - 2]);
      }
    }
  });
});

test.describe('Timer Countdown and Auto-Advance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/scales');
  });

  test('should display countdown timer during session', async ({ page }) => {
    await page.getByRole('button', { name: /start practice/i }).click();

    const timer = page.locator('[data-testid="countdown-timer"]');
    await expect(timer).toBeVisible({ timeout: 5000 });

    // Timer should show a number
    const timerText = await timer.textContent();
    expect(timerText).toMatch(/\d+/);
  });

  test('should reset timer when manually advancing', async ({ page }) => {
    await page.getByRole('button', { name: /start practice/i }).click();

    const timer = page.locator('[data-testid="countdown-timer"]');
    await expect(timer).toBeVisible({ timeout: 5000 });

    // Wait a few seconds
    await page.waitForTimeout(3000);

    // Get timer value
    const timerBefore = await timer.textContent();

    // Manually advance
    await page.getByRole('button', { name: /next scale/i }).click();
    await page.waitForTimeout(500);

    // Timer should have reset (should show higher value than before)
    const timerAfter = await timer.textContent();

    // Parse numbers (removing any non-digit characters)
    const valueBefore = parseInt(timerBefore?.replace(/\D/g, '') || '0');
    const valueAfter = parseInt(timerAfter?.replace(/\D/g, '') || '0');

    expect(valueAfter).toBeGreaterThan(valueBefore);
  });
});

test.describe('Session Summary', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/scales');
  });

  test('should show accurate scale count in summary', async ({ page }) => {
    await page.getByRole('button', { name: /start practice/i }).click();
    await expect(page.locator('[data-testid="scale-display"]')).toBeVisible({ timeout: 5000 });

    // Practice exactly 3 scales (advance 2 times from initial scale)
    const nextButton = page.getByRole('button', { name: /next scale/i });
    await nextButton.click();
    await page.waitForTimeout(300);
    await nextButton.click();
    await page.waitForTimeout(300);

    // Verify count before ending
    await expect(page.locator('text=/Scales completed.*2/i')).toBeVisible();

    // End session
    await page.getByRole('button', { name: /end session/i }).click();

    const summary = page.locator('[data-testid="session-summary"]');
    await expect(summary).toBeVisible({ timeout: 3000 });

    // Summary should show 3 total scales (2 completed + 1 current)
    const scalesText = await summary.locator('text=/Scales Practiced/i').locator('..').textContent();
    expect(scalesText).toMatch(/3/);
  });

  test('should calculate duration based on scales practiced', async ({ page }) => {
    await page.getByRole('button', { name: /start practice/i }).click();
    await expect(page.locator('[data-testid="scale-display"]')).toBeVisible({ timeout: 5000 });

    // End immediately (1 scale, ~10 seconds = 0.2 minutes)
    await page.getByRole('button', { name: /end session/i }).click();

    const summary = page.locator('[data-testid="session-summary"]');
    await expect(summary).toBeVisible({ timeout: 3000 });

    // Duration should be visible
    const durationText = await summary.locator('text=/Duration/i').locator('..').textContent();
    expect(durationText).toMatch(/\d+(\.\d+)?\s*min/);
  });

  test('should show completion message for scale practice', async ({ page }) => {
    await page.getByRole('button', { name: /start practice/i }).click();
    await expect(page.locator('[data-testid="scale-display"]')).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: /end session/i }).click();

    const summary = page.locator('[data-testid="session-summary"]');
    await expect(summary).toBeVisible({ timeout: 3000 });

    // Should mention scales (not chords)
    await expect(summary.locator('text=/practicing your scales/i')).toBeVisible();
  });
});

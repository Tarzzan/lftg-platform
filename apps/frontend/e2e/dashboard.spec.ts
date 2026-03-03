import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('affiche le tableau de bord avec les statistiques', async ({ page }) => {
    // Titre principal
    await expect(page.getByRole('heading', { name: /tableau de bord/i })).toBeVisible();

    // Cards de statistiques
    await expect(page.locator('[data-testid="stat-card"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('affiche la barre de navigation latérale', async ({ page }) => {
    // Logo LFTG
    await expect(page.getByText('LFTG Platform')).toBeVisible();

    // Sections de navigation
    await expect(page.getByText('Animaux & Couvées')).toBeVisible();
    await expect(page.getByText('Stock')).toBeVisible();
    await expect(page.getByText('Formation')).toBeVisible();
    await expect(page.getByText('Médical')).toBeVisible();
  });

  test('ouvre la palette de commandes avec Ctrl+K', async ({ page }) => {
    // Déclencher Cmd+K
    await page.keyboard.press('Control+k');

    // La palette doit s'ouvrir
    await expect(page.getByPlaceholder(/rechercher un animal/i)).toBeVisible();

    // Fermer avec Escape
    await page.keyboard.press('Escape');
    await expect(page.getByPlaceholder(/rechercher un animal/i)).not.toBeVisible();
  });

  test('navigue vers la page animaux', async ({ page }) => {
    await page.getByRole('link', { name: /animaux/i }).first().click();
    await expect(page).toHaveURL('/admin/animaux/liste');
    await expect(page.getByRole('heading', { name: /animaux/i })).toBeVisible();
  });

  test('navigue vers le suivi médical', async ({ page }) => {
    await page.getByRole('link', { name: /suivi médical/i }).click();
    await expect(page).toHaveURL('/admin/medical');
    await expect(page.getByRole('heading', { name: /suivi médical/i })).toBeVisible();
  });

  test('affiche les graphiques Recharts', async ({ page }) => {
    // Attendre le chargement des graphiques
    await page.waitForSelector('.recharts-wrapper', { timeout: 15000 });
    const charts = page.locator('.recharts-wrapper');
    await expect(charts.first()).toBeVisible();
  });
});

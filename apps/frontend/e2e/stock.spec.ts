import { test, expect } from '@playwright/test';

test.describe('Gestion du stock', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/stock/articles');
    await page.waitForLoadState('networkidle');
  });

  test('affiche la page des articles', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /articles/i })).toBeVisible();
  });

  test('affiche les filtres de recherche', async ({ page }) => {
    await expect(page.getByPlaceholder(/rechercher/i).first()).toBeVisible();
  });

  test('ouvre le modal de création d\'article', async ({ page }) => {
    await page.getByRole('button', { name: /nouvel article/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('filtre par catégorie', async ({ page }) => {
    const categorySelect = page.locator('select').first();
    await categorySelect.selectOption({ index: 1 });
    await page.waitForTimeout(300);
    await expect(page.locator('body')).not.toContainText('Erreur');
  });
});

test.describe('Import CSV', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/import');
    await page.waitForLoadState('networkidle');
  });

  test('affiche la page d\'import', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /import csv/i })).toBeVisible();
  });

  test('affiche les 3 types d\'import', async ({ page }) => {
    await expect(page.getByText('Animaux')).toBeVisible();
    await expect(page.getByText('Articles stock')).toBeVisible();
    await expect(page.getByText('Utilisateurs')).toBeVisible();
  });

  test('affiche les colonnes attendues pour chaque type', async ({ page }) => {
    // Type animaux (par défaut)
    await expect(page.getByText('name *')).toBeVisible();
    await expect(page.getByText('species_name *')).toBeVisible();

    // Changer vers stock
    await page.getByText('Articles stock').click();
    await expect(page.getByText('quantity')).toBeVisible();

    // Changer vers users
    await page.getByText('Utilisateurs').click();
    await expect(page.getByText('email *')).toBeVisible();
  });

  test('affiche la zone de dépôt de fichier', async ({ page }) => {
    await expect(page.getByText(/glissez votre fichier csv/i)).toBeVisible();
  });
});

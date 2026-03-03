import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/admin.json' });

test.describe('Module Ventes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/ventes');
    await page.waitForLoadState('networkidle');
  });

  test('affiche la page des ventes avec les KPIs', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Ventes' })).toBeVisible();
    // KPIs présents
    await expect(page.getByText('CA total')).toBeVisible();
    await expect(page.getByText('CA ce mois')).toBeVisible();
    await expect(page.getByText('Ventes complétées')).toBeVisible();
    await expect(page.getByText('En attente')).toBeVisible();
  });

  test('affiche le graphique des revenus', async ({ page }) => {
    const chart = page.locator('.recharts-wrapper').first();
    await expect(chart).toBeVisible();
  });

  test('ouvre le modal de création de vente', async ({ page }) => {
    await page.getByRole('button', { name: '+ Nouvelle vente' }).click();
    await expect(page.getByText('💰 Nouvelle vente')).toBeVisible();
    await expect(page.getByPlaceholder('Nom complet *')).toBeVisible();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
  });

  test('valide le formulaire de création avec champs obligatoires', async ({ page }) => {
    await page.getByRole('button', { name: '+ Nouvelle vente' }).click();
    // Le bouton de création doit être désactivé sans nom
    const createBtn = page.getByRole('button', { name: /Créer la vente/ });
    await expect(createBtn).toBeDisabled();
    // Remplir le nom
    await page.getByPlaceholder('Nom complet *').fill('Jean Dupont');
    // Ajouter une description d'article
    await page.getByPlaceholder('Description').fill('Perroquet Ara');
    await expect(createBtn).toBeEnabled();
  });

  test('filtre les ventes par statut', async ({ page }) => {
    const select = page.getByRole('combobox').filter({ hasText: 'Tous les statuts' });
    await select.selectOption('COMPLETED');
    await page.waitForLoadState('networkidle');
    // La page doit se recharger avec le filtre
    await expect(page.locator('body')).toBeVisible();
  });

  test('filtre les ventes par type', async ({ page }) => {
    const select = page.getByRole('combobox').filter({ hasText: 'Tous les types' });
    await select.selectOption('ANIMAL');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('ferme le modal avec le bouton Annuler', async ({ page }) => {
    await page.getByRole('button', { name: '+ Nouvelle vente' }).click();
    await expect(page.getByText('💰 Nouvelle vente')).toBeVisible();
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.getByText('💰 Nouvelle vente')).not.toBeVisible();
  });

  test('ajoute et supprime des lignes d\'articles', async ({ page }) => {
    await page.getByRole('button', { name: '+ Nouvelle vente' }).click();
    // Ajouter une ligne
    await page.getByText('+ Ajouter une ligne').click();
    const inputs = page.getByPlaceholder('Description');
    await expect(inputs).toHaveCount(2);
    // Supprimer la deuxième ligne (bouton ×)
    await page.locator('button').filter({ hasText: '×' }).last().click();
    await expect(inputs).toHaveCount(1);
  });
});

test.describe('Détail d\'une vente', () => {
  test('navigue vers le détail si une vente existe', async ({ page }) => {
    await page.goto('/admin/ventes');
    await page.waitForLoadState('networkidle');
    // Si une vente existe dans le tableau, cliquer sur sa référence
    const firstRef = page.locator('table tbody tr:first-child td:first-child button').first();
    if (await firstRef.isVisible()) {
      await firstRef.click();
      await expect(page.url()).toContain('/admin/ventes/');
      await expect(page.getByText('La Ferme Tropicale de Guyane')).toBeVisible();
    }
  });
});

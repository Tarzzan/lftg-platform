import { test, expect } from '@playwright/test';

test.describe('Gestion des animaux', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/animaux/liste');
    await page.waitForLoadState('networkidle');
  });

  test('affiche la liste des animaux', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /animaux/i })).toBeVisible();
    // Attendre que la liste se charge
    await page.waitForTimeout(1000);
  });

  test('filtre les animaux par recherche', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/rechercher/i).first();
    await searchInput.fill('Perroquet');
    await page.waitForTimeout(500);
    // Vérifier que le filtre est appliqué (pas d'erreur)
    await expect(page.locator('body')).not.toContainText('Erreur');
  });

  test('ouvre le modal de création d\'animal', async ({ page }) => {
    await page.getByRole('button', { name: /nouvel animal/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/créer un animal/i)).toBeVisible();
  });

  test('ferme le modal avec Escape', async ({ page }) => {
    await page.getByRole('button', { name: /nouvel animal/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('navigue vers la page espèces', async ({ page }) => {
    await page.goto('/admin/animaux/especes');
    await expect(page.getByRole('heading', { name: /espèces/i })).toBeVisible();
  });

  test('navigue vers la page couvées', async ({ page }) => {
    await page.goto('/admin/animaux/couvees');
    await expect(page.getByRole('heading', { name: /couvées/i })).toBeVisible();
  });
});

test.describe('Détail animal', () => {
  test('affiche les onglets de la fiche animal', async ({ page }) => {
    // On navigue vers un animal (l'ID réel sera fourni par le seed)
    await page.goto('/admin/animaux/liste');
    await page.waitForLoadState('networkidle');

    // Si des animaux existent, cliquer sur le premier
    const firstAnimalLink = page.locator('a[href*="/admin/animaux/"]').first();
    const count = await firstAnimalLink.count();

    if (count > 0) {
      await firstAnimalLink.click();
      await page.waitForLoadState('networkidle');

      // Vérifier les onglets
      await expect(page.getByRole('button', { name: /fiche/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /historique médical/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /vaccinations/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /traitements/i })).toBeVisible();
    }
  });
});

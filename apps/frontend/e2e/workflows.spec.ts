import { test, expect } from '@playwright/test';

test.describe('Workflows', () => {
  test('affiche la liste des workflows', async ({ page }) => {
    await page.goto('/admin/workflows');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /workflows/i })).toBeVisible();
  });

  test('navigue vers l\'éditeur de workflow', async ({ page }) => {
    await page.goto('/admin/workflows/editor');
    await page.waitForLoadState('networkidle');

    // L'éditeur doit afficher le canvas et la palette
    await expect(page.getByText(/nouveau workflow/i)).toBeVisible();
    await expect(page.getByText(/étapes disponibles/i)).toBeVisible();
  });

  test('l\'éditeur contient les étapes de départ et de fin', async ({ page }) => {
    await page.goto('/admin/workflows/editor');
    await page.waitForLoadState('networkidle');

    // Les étapes Début et Fin doivent être présentes
    await expect(page.getByText('Début')).toBeVisible();
    await expect(page.getByText('Fin')).toBeVisible();
  });

  test('peut ajouter une étape d\'approbation', async ({ page }) => {
    await page.goto('/admin/workflows/editor');
    await page.waitForLoadState('networkidle');

    // Cliquer sur "Approbation" dans la palette
    await page.getByText('Approbation').first().click();

    // Une nouvelle étape doit apparaître dans la liste
    await expect(page.getByText('Étapes (3)')).toBeVisible();
  });

  test('peut modifier le nom du workflow', async ({ page }) => {
    await page.goto('/admin/workflows/editor');
    await page.waitForLoadState('networkidle');

    const nameInput = page.locator('input[value="Nouveau workflow"]');
    await nameInput.fill('Workflow de test');
    await expect(nameInput).toHaveValue('Workflow de test');
  });
});

test.describe('Calendrier médical', () => {
  test('affiche le calendrier', async ({ page }) => {
    await page.goto('/admin/medical/calendrier');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /calendrier des soins/i })).toBeVisible();
  });

  test('peut naviguer entre les mois', async ({ page }) => {
    await page.goto('/admin/medical/calendrier');
    await page.waitForLoadState('networkidle');

    // Bouton mois suivant
    const nextBtn = page.locator('button').filter({ has: page.locator('svg') }).nth(1);
    await nextBtn.click();
    await page.waitForTimeout(200);

    // Vérifier que le mois a changé (pas d'erreur)
    await expect(page.locator('body')).not.toContainText('Erreur');
  });
});

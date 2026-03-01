import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/admin.json' });

test.describe('Module Médical', () => {
  test('affiche le tableau de bord médical', async ({ page }) => {
    await page.goto('/admin/medical');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /Suivi médical/i })).toBeVisible();
  });

  test('affiche le calendrier des soins', async ({ page }) => {
    await page.goto('/admin/medical/calendrier');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /Calendrier/i })).toBeVisible();
    // Navigation mois présente
    await expect(page.getByRole('button', { name: '←' })).toBeVisible();
    await expect(page.getByRole('button', { name: '→' })).toBeVisible();
  });

  test('navigue entre les mois dans le calendrier', async ({ page }) => {
    await page.goto('/admin/medical/calendrier');
    await page.waitForLoadState('networkidle');
    const heading = await page.getByRole('heading').filter({ hasText: /\d{4}/ }).first().textContent();
    await page.getByRole('button', { name: '→' }).click();
    const newHeading = await page.getByRole('heading').filter({ hasText: /\d{4}/ }).first().textContent();
    expect(heading).not.toBe(newHeading);
  });
});

test.describe('Module Enclos', () => {
  test('affiche la page des enclos', async ({ page }) => {
    await page.goto('/admin/animaux/enclos');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /Enclos/i })).toBeVisible();
  });

  test('bascule entre vue grille et vue carte', async ({ page }) => {
    await page.goto('/admin/animaux/enclos');
    await page.waitForLoadState('networkidle');
    // Bouton vue carte présent
    const mapBtn = page.getByRole('button', { name: /Carte/i });
    const gridBtn = page.getByRole('button', { name: /Grille/i });
    if (await mapBtn.isVisible()) {
      await mapBtn.click();
      await expect(gridBtn).toBeVisible();
    }
  });

  test('ouvre le modal de création d\'enclos', async ({ page }) => {
    await page.goto('/admin/animaux/enclos');
    await page.waitForLoadState('networkidle');
    const addBtn = page.getByRole('button', { name: /Nouvel enclos/i });
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await expect(page.getByText(/Créer un enclos/i)).toBeVisible();
    }
  });
});

test.describe('Dashboard personnalisable', () => {
  test('affiche le bouton Personnaliser', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: /Personnaliser/i })).toBeVisible();
  });

  test('active le mode édition', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /Personnaliser/i }).click();
    await expect(page.getByRole('button', { name: /Terminer/i })).toBeVisible();
  });

  test('masque et réaffiche un widget', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /Personnaliser/i }).click();
    // Survoler un widget pour voir le bouton ×
    const widget = page.locator('.group').first();
    await widget.hover();
    const closeBtn = widget.locator('button').filter({ hasText: '×' });
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      // Le widget doit être masqué et un bouton pour le réajouter doit apparaître
      await expect(page.getByRole('button', { name: /\+/ }).first()).toBeVisible();
    }
  });

  test('quitte le mode édition', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /Personnaliser/i }).click();
    await page.getByRole('button', { name: /Terminer/i }).click();
    await expect(page.getByRole('button', { name: /Personnaliser/i })).toBeVisible();
  });
});

test.describe('Documentation API', () => {
  test('affiche la page de documentation API', async ({ page }) => {
    await page.goto('/admin/docs');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /Documentation API/i })).toBeVisible();
    await expect(page.getByText('LFTG Platform v4.0.0')).toBeVisible();
  });

  test('affiche les modules avec leurs endpoints', async ({ page }) => {
    await page.goto('/admin/docs');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Auth')).toBeVisible();
    await expect(page.getByText('Animaux')).toBeVisible();
    await expect(page.getByText('Stock')).toBeVisible();
    await expect(page.getByText('Ventes')).toBeVisible();
  });

  test('affiche les liens vers la spec JSON et Swagger UI', async ({ page }) => {
    await page.goto('/admin/docs');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('link', { name: /JSON Spec/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Ouvrir Swagger UI/i })).toBeVisible();
  });
});

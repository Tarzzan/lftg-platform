import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '.auth/user.json');

/**
 * Setup E2E : authentification et sauvegarde du state
 * Ce setup s'exécute une seule fois avant tous les tests
 */
setup('authenticate', async ({ page }) => {
  // Naviguer vers la page de login
  await page.goto('/login');

  // Attendre que le formulaire soit visible
  await expect(page.getByRole('heading', { name: /connexion/i })).toBeVisible({ timeout: 10000 });

  // Remplir le formulaire
  await page.getByLabel(/email/i).fill(process.env.E2E_USER_EMAIL || 'admin@lftg.fr');
  await page.getByLabel(/mot de passe/i).fill(process.env.E2E_USER_PASSWORD || 'Admin1234!');

  // Soumettre
  await page.getByRole('button', { name: /se connecter/i }).click();

  // Attendre la redirection vers le dashboard
  await page.waitForURL('/admin', { timeout: 15000 });
  await expect(page.getByText(/tableau de bord/i)).toBeVisible();

  // Sauvegarder le state d'authentification
  await page.context().storageState({ path: authFile });
});

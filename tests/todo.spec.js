import { test, expect } from '@playwright/test';

const app = 'http://app';

test('sirve cabeceras HTTP defensivas compatibles con la SPA', async ({ request }) => {
  const response = await request.get(app);
  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-security-policy']).toContain("default-src 'self'");
  expect(response.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(response.headers()['content-security-policy']).not.toContain('unsafe-inline');
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(response.headers()['x-frame-options']).toBe('DENY');
});

test.beforeEach(async ({ page }) => {
  await page.goto(app);
  await page.evaluate(() => { try { localStorage.clear(); } catch {} });
  await page.reload();
});

test('muestra estado inicial y valida títulos', async ({ page }) => {
  await expect(page.getByText('Aún no tienes tareas')).toBeVisible();
  await page.getByRole('button', { name: 'Añadir tarea' }).click();
  await expect(page.getByText('Escribe un título para la tarea.')).toBeVisible();
  await page.getByLabel('Título de la tarea').fill('a'.repeat(121));
  await page.getByRole('button', { name: 'Añadir tarea' }).click();
  await expect(page.getByText('El título no puede superar los 120 caracteres.')).toBeVisible();
  await page.getByLabel('Título de la tarea').fill('   Comprar pan   ');
  await page.getByRole('button', { name: 'Añadir tarea' }).click();
  await expect(page.getByText('Comprar pan')).toBeVisible();
});

test('completa, edita, filtra, elimina y conserva al recargar', async ({ page }) => {
  await page.getByLabel('Título de la tarea').fill('Primera tarea');
  await page.getByRole('button', { name: 'Añadir tarea' }).click();
  await page.getByLabel('Título de la tarea').fill('Segunda tarea');
  await page.getByRole('button', { name: 'Añadir tarea' }).click();
  const first = page.locator('.task').filter({ hasText: 'Primera tarea' });
  await first.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Completadas' }).click();
  await expect(first).toBeVisible();
  await page.getByRole('button', { name: 'Pendientes' }).click();
  await expect(page.getByText('Segunda tarea')).toBeVisible();
  await page.getByRole('button', { name: 'Todas' }).click();
  await first.getByRole('button', { name: 'Editar' }).click();
  await page.getByLabel('Editar título').fill('Tarea editada');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByText('Tarea editada')).toBeVisible();
  await page.getByText('Tarea editada').locator('..').getByRole('button', { name: 'Eliminar' }).click();
  await expect(page.getByText('Tarea editada')).toHaveCount(0);
  await page.reload();
  await expect(page.getByText('Segunda tarea')).toBeVisible();
});

test('permite marcar y desmarcar con teclado y distingue visualmente el estado', async ({ page }) => {
  const title = page.locator('#task-title');
  await title.fill('Tarea accesible');
  await title.press('Enter');

  const task = page.locator('.task').filter({ hasText: 'Tarea accesible' });
  const checkbox = task.getByRole('checkbox');
  await checkbox.focus();
  await checkbox.press('Space');
  await expect(task).toHaveClass(/completed/);
  await expect(task.locator('.task-title')).toHaveCSS('text-decoration-line', 'line-through');
  await expect(checkbox).toHaveAttribute('aria-label', /Marcar como pendiente/);

  await checkbox.focus();
  await checkbox.press('Space');
  await expect(task).not.toHaveClass(/completed/);
  await expect(task.locator('.task-title')).not.toHaveCSS('text-decoration-line', 'line-through');
  await expect(checkbox).toHaveAttribute('aria-label', /Marcar como completada/);
});

test('muestra aviso y conserva los cambios en memoria si localStorage falla', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('storage bloqueado'); };
    Storage.prototype.setItem = () => { throw new Error('storage bloqueado'); };
  });
  await page.reload();

  await expect(page.locator('#storage-warning')).toBeVisible();
  await page.locator('#task-title').fill('Solo durante la sesion');
  await page.locator('#task-title').press('Enter');
  await expect(page.getByText('Solo durante la sesion')).toBeVisible();
  await expect(page.locator('#storage-warning')).toBeVisible();
});

test('crea, completa, desmarca y persiste una tarea recurrente diariamente', async ({ page }) => {
  await page.getByLabel('Título de la tarea').fill('Tomar vitaminas');
  await page.getByLabel('Recurrente diariamente').check();
  await page.getByRole('button', { name: 'Añadir tarea' }).click();
  const task = page.locator('.task').filter({ hasText: 'Tomar vitaminas' });
  await expect(task.getByText('Recurrente diariamente')).toBeVisible();
  await task.getByRole('checkbox').check();
  await expect(task).toHaveClass(/completed/);
  await page.reload();
  await expect(page.locator('.task').filter({ hasText: 'Tomar vitaminas' })).toHaveClass(/completed/);
  await page.locator('.task').filter({ hasText: 'Tomar vitaminas' }).getByRole('checkbox').uncheck();
  await expect(page.locator('.task').filter({ hasText: 'Tomar vitaminas' })).not.toHaveClass(/completed/);
});

test('reinicia el estado recurrente al cambiar de día sin duplicar la tarea', async ({ page }) => {
  await page.addInitScript(() => { globalThis.__F002_TEST_NOW__ = '2026-09-23T10:00:00'; });
  await page.reload();
  await page.getByLabel('Título de la tarea').fill('Revisar agenda');
  await page.getByLabel('Recurrente diariamente').check();
  await page.getByRole('button', { name: 'Añadir tarea' }).click();
  await page.locator('.task').getByRole('checkbox').check();
  await page.addInitScript(() => { globalThis.__F002_TEST_NOW__ = '2026-09-24T10:00:00'; });
  await page.reload();
  const task = page.locator('.task').filter({ hasText: 'Revisar agenda' });
  await expect(task).toHaveCount(1);
  await expect(task).not.toHaveClass(/completed/);
  await page.getByRole('button', { name: 'Completadas' }).click();
  await expect(page.getByText('Revisar agenda')).toHaveCount(0);
});

test('permite convertir y desactivar la recurrencia desde edición', async ({ page }) => {
  await page.getByLabel('Título de la tarea').fill('Tarea convertible');
  await page.getByRole('button', { name: 'Añadir tarea' }).click();
  await page.locator('.task').getByRole('button', { name: 'Editar' }).click();
  await page.locator('.task-edit').getByRole('checkbox', { name: 'Recurrente diariamente' }).check();
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.locator('.task').getByText('Recurrente diariamente')).toBeVisible();
  await page.locator('.task').getByRole('button', { name: 'Editar' }).click();
  await page.locator('.task-edit').getByRole('checkbox', { name: 'Recurrente diariamente' }).uncheck();
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.locator('.task').getByText('Recurrente diariamente')).toHaveCount(0);
});
test('elimina una tarea recurrente sin dejarla visible ni persistida', async ({ page }) => {
  await page.locator('#task-title').fill('Eliminar recurrente');
  await page.locator('#task-recurrent').check();
  await page.locator('#task-form button[type="submit"]').click();
  const task = page.locator('.task').filter({ hasText: 'Eliminar recurrente' });
  await task.getByRole('button', { name: 'Eliminar' }).click();
  await expect(page.getByText('Eliminar recurrente')).toHaveCount(0);
  await page.reload();
  await expect(page.getByText('Eliminar recurrente')).toHaveCount(0);
});

test('carga datos F001 preexistentes como tareas no recurrentes', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('f001-tareas', JSON.stringify([{ id: 'f001-1', title: 'Dato F001', completed: true }]));
  });
  await page.reload();
  const task = page.locator('.task').filter({ hasText: 'Dato F001' });
  await expect(task).toHaveCount(1);
  await expect(task.getByText('Recurrente diariamente')).toHaveCount(0);
  await expect(task.getByRole('checkbox')).toBeChecked();
  await task.getByRole('button', { name: 'Editar' }).click();
  await expect(page.locator('.task-edit').getByRole('checkbox', { name: 'Recurrente diariamente' })).not.toBeChecked();
});

test('expone ARIA en el control de recurrencia de creaciÃ³n y ediciÃ³n', async ({ page }) => {
  const createRecurring = page.getByRole('checkbox', { name: 'Recurrente diariamente' });
  await expect(createRecurring).toHaveCount(1);
  await page.locator('#task-title').fill('ARIA recurrente');
  await createRecurring.check();
  await page.locator('#task-form button[type="submit"]').click();
  const task = page.locator('.task').filter({ hasText: 'ARIA recurrente' });
  await task.getByRole('button', { name: 'Editar' }).click();
  await expect(page.locator('.task-edit').getByRole('checkbox', { name: 'Recurrente diariamente' })).toBeChecked();
});

test('los filtros reflejan una recurrente completada hoy y pendiente al cambiar de dÃ­a', async ({ page }) => {
  await page.addInitScript(() => { globalThis.__F002_TEST_NOW__ = '2026-09-23T10:00:00'; });
  await page.reload();
  await page.locator('#task-title').fill('Filtrar recurrente');
  await page.locator('#task-recurrent').check();
  await page.locator('#task-form button[type="submit"]').click();
  const task = page.locator('.task').filter({ hasText: 'Filtrar recurrente' });
  await task.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Pendientes' }).click();
  await expect(page.getByText('Filtrar recurrente')).toHaveCount(0);
  await page.getByRole('button', { name: 'Completadas' }).click();
  await expect(page.getByText('Filtrar recurrente')).toHaveCount(1);
  await page.addInitScript(() => { globalThis.__F002_TEST_NOW__ = '2026-09-24T10:00:00'; });
  await page.reload();
  await page.getByRole('button', { name: 'Pendientes' }).click();
  await expect(page.getByText('Filtrar recurrente')).toHaveCount(1);
  await page.getByRole('button', { name: 'Completadas' }).click();
  await expect(page.getByText('Filtrar recurrente')).toHaveCount(0);
});

test('persiste el estado recurrente con reloj controlado y conserva completedOn al editar tÃ­tulo', async ({ page }) => {
  await page.addInitScript(() => { globalThis.__F002_TEST_NOW__ = '2026-09-23T10:00:00'; });
  await page.reload();
  await page.locator('#task-title').fill('Estado persistente');
  await page.locator('#task-recurrent').check();
  await page.locator('#task-form button[type="submit"]').click();
  let task = page.locator('.task').filter({ hasText: 'Estado persistente' });
  await task.getByRole('checkbox').check();
  await page.reload();
  task = page.locator('.task').filter({ hasText: 'Estado persistente' });
  await expect(task).toHaveClass(/completed/);
  await task.getByRole('button', { name: 'Editar' }).click();
  await page.locator('.task-edit input[type="text"]').fill('Estado editado');
  await page.getByRole('button', { name: 'Guardar' }).click();
  task = page.locator('.task').filter({ hasText: 'Estado editado' });
  await expect(task).toHaveClass(/completed/);
  await page.reload();
  await expect(page.locator('.task').filter({ hasText: 'Estado editado' })).toHaveClass(/completed/);
});

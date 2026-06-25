import { expect, test } from '@playwright/test'

test('inspects fixture workflow runs in the built dashboard', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Workflow runs' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'daily-report' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'run-success-1' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Timeline' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Waterfall' })).toBeVisible()
  await expect(page.getByText('gpt-test').first()).toBeVisible()

  await page.getByRole('row', { name: /run-failed-1/ }).click()

  await expect(page.getByRole('heading', { name: 'run-failed-1' })).toBeVisible()
  await expect(page.getByText('Operation failed').first()).toBeVisible()

  await page.getByRole('button', { name: /Operation failed/ }).first().click()

  await expect(page.getByLabel('Raw event payload')).toBeVisible()
  await expect(page.getByText('operation.error').first()).toBeVisible()

  await page.getByRole('button', { name: 'Close raw event drawer' }).click()

  await expect(page.getByLabel('Raw event payload')).toBeHidden()
})

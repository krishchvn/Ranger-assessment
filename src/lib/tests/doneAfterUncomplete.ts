import { test, expect, Page } from '@playwright/test';

export async function run(page: Page) {
    await page.setViewportSize({ width: 1440, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState();

    // Confirm that when you mark an item as "complete" via the checkbox,
    // on page reload, the completed item is shown after all uncompleted items.

    // Check if any todo items are present, else return
    await page.waitForSelector('ul > li');
    const ul = page.locator('ul > li');
    if (ul === null) {
        throw new Error('no tasks to do');
    }

    // Fetch all todo items
    const liTexts: string[] = await page
        .locator('ul > li .text-sm.leading-5.font-medium.truncate')
        .allTextContents();
    console.log(liTexts);

    // Taking a random todo item and marks it as checked
    const randomIndex = Math.floor(Math.random() * liTexts.length);
    console.log(
        'Random index:',
        randomIndex,
        'Random Item:',
        liTexts[randomIndex]
    );

    await page.getByRole('checkbox').nth(randomIndex).click();
    const randomLiText = liTexts[randomIndex];

    // Page reload
    await page.reload();
    await page.waitForLoadState();
    await page.waitForSelector('ul');
    await page.waitForTimeout(500);

    // Fetches all todo items and checks if last element in array is equal to random index's element, else return error
    const liTextsAfterReload: string[] = await page
        .locator('ul > li .text-sm.leading-5.font-medium.truncate')
        .allTextContents();
    console.log(liTextsAfterReload);

    if (liTextsAfterReload[liTexts.length - 1] === randomLiText) {
        console.log('Passed');
    } else {
        throw new Error('Task not the last after reload');
    }

    // Optional - Unchecks todo item
    page.getByRole('checkbox')
        .nth(liTexts.length - 1)
        .click();
}

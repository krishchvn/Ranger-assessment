import { test, expect, Page } from '@playwright/test';

export async function run(page: Page) {
    // Approach: Fetch all todo items, converts to and compares strings
    // Easy and slightly optimal to checking all items one by one

    const TODO_ITEMS = [
        'feed the cat',
        'buy some cheese',
        'play an instrument',
        'book a doctors appointment',
    ] as const;

    let prevTodoItemsString: string = '';
    let prevTodoItems: string[] = [''];

    // Tries to check if there are any previous todo items exist, if yes, adds it to current Todo Items
    try {
        await page.waitForSelector('ul > li', { timeout: 1000 });
        prevTodoItems = await page
            .locator('ul > li .text-sm.leading-5.font-medium.truncate')
            .allTextContents();
        prevTodoItemsString = [...prevTodoItems].join('');
        console.log('prevItems ', prevTodoItems);
    } catch {
        console.log('No previous TODO items');
    }

    const todoItemsString = prevTodoItemsString + [...TODO_ITEMS].join('');

    // Sorting the string as to check later
    const sortedTodoItemsString = [...prevTodoItems, ...TODO_ITEMS]
        .sort()
        .join('');

    await page.setViewportSize({ width: 1440, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState();

    // Add TODOs and verify that the order is based on the order added

    // Locates input field and adds items one by one
    // Logic to check even duplicate todo items are visible

    for (let i = 0; i < TODO_ITEMS.length; i++) {
        await page.getByPlaceholder('make coffee').fill(TODO_ITEMS[i]);
        await page.getByTestId('add-todo').click();
        await page.waitForTimeout(300);

        const existingElements = await page
            .locator(`text="${TODO_ITEMS[i]}"`)
            .count();
        if (existingElements < 2) {
            expect(page.locator(`text="${TODO_ITEMS[i]}"`));
        } else {
            expect(
                page
                    .locator(`text="${TODO_ITEMS[i]}"`)
                    .nth(existingElements - 1)
            );
        }
    }

    // Fetches all text contents and verifies the order, else returns error

    page.waitForSelector('ul');
    const topLevelUl_1 = await page.locator('ul').allTextContents();
    console.log('Fetched Items String:', topLevelUl_1[0]);
    console.log('Original Items String:', todoItemsString);

    if (topLevelUl_1[0] !== todoItemsString) {
        throw new Error('Order is not as input');
    }

    // Refresh the page and assert that the TODOs are sorted alphabetically

    await page.reload();
    await page.waitForLoadState();

    // Again fetches all text contents and verifies the order, else returns error
    await page.waitForSelector('ul');
    const topLevelUl_2 = await page.locator('ul').allTextContents();
    console.log('Fetched Items:', topLevelUl_2[0]);
    console.log('Sorted Items:', sortedTodoItemsString);

    if (topLevelUl_2[0] !== sortedTodoItemsString) {
        throw new Error('Order is not alphabetically sorted');
    }
}

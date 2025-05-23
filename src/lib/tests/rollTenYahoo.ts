import { test, expect, Page } from '@playwright/test';

export async function run(page: Page) {
    await page.setViewportSize({ width: 1440, height: 1080 });

    await page.goto('/');
    await page.waitForLoadState();

    // Confirm that when you use the "Roll Dice" button and the result is `10`,
    // the text "Yahoo!" is shown in the result area.
    // NOTE - to do this you can use page.route to intercept the request to the API
    // and return a mocked response with the result `10`.

    await page.route('**/api/random', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ ten: true }),
        });
    });

    await page.getByRole('button', { name: 'Roll Dice' }).click();

    const result: any = await page.getByText('You rolled 10!').textContent();
    expect(result).toContain('Yahoo!');

    // ----------------------------------------------------------------------------

    // Another approach
    // Keep on rolling dice until 10  comes up and check if Yahoo! exists in string
    // (Inefficient)

    // while (true) {
    //     await page.getByRole('button', { name: 'Roll Dice' }).click();
    //     const res = await page.getByText('You rolled').textContent();
    //     console.log(res);
    //     if (res?.includes('10') && res?.includes('Yahoo!')) break;
    // }
}

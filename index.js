const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function run() {
  const configPath = path.join(__dirname, 'config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const pagesToProcess = parseInt(process.env.PAGES_TO_PROCESS || config.pagesToProcess || 5, 10);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Login
  if (config.login && config.login.url) {
    await page.goto(config.login.url);
    if (config.login.emailSelector && process.env.CRM_EMAIL) {
      await page.fill(config.login.emailSelector, process.env.CRM_EMAIL);
    }
    if (config.login.passwordSelector && process.env.CRM_PASSWORD) {
      await page.fill(config.login.passwordSelector, process.env.CRM_PASSWORD);
    }
    if (config.login.submitSelector) {
      await page.click(config.login.submitSelector);
    }
    await page.waitForLoadState('networkidle');
  }

  // Go to leads list
  await page.goto(config.startUrl);
  await page.waitForLoadState('networkidle');

  for (let p = 0; p < pagesToProcess; p++) {
    const rows = await page.$$(config.selectors.leadRows);
    for (const row of rows) {
      try {
        // Skip closers
        const statusEl = config.selectors.statusCell ? await row.$(config.selectors.statusCell) : null;
        const statusText = statusEl ? (await statusEl.innerText()).toLowerCase() : '';
        if (statusText.includes(config.selectors.closerMarkerText.toLowerCase())) {
          continue;
        }

        // Evaluate row text
        const rowText = (await row.innerText()).toLowerCase();
        const bad = config.selectors.badLeadTextContains && config.selectors.badLeadTextContains.some(b => rowText.includes(b.toLowerCase()));
        if (bad) {
          // scrap lead
          const scrapBtn = await row.$(config.selectors.scrapButton);
          if (scrapBtn) {
            await scrapBtn.click();
            // Confirm OK
            if (config.selectors.confirmOkButton) {
              const okBtn = await page.$(config.selectors.confirmOkButton);
              if (okBtn) {
                await okBtn.click();
              }
            }
            await page.waitForTimeout(config.timeouts.afterAction || 400);
          }
          continue;
        }
        // Keep good leads (do nothing)
      } catch (err) {
        // Continue on errors
        console.error('Error processing lead', err);
        continue;
      }
    }

    if (p < pagesToProcess - 1 && config.selectors.nextPageButton) {
      const nextBtn = await page.$(config.selectors.nextPageButton);
      if (nextBtn) {
        await nextBtn.click();
        await page.waitForLoadState('networkidle');
      } else {
        break;
      }
    }
  }

  await browser.close();
}

run().catch((err) => {
  console.error(err);
});

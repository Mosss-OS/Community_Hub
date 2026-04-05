const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(5000);
  
  const inputs = await page.locator('input').all();
  console.log('Input count:', inputs.length);
  
  if (inputs.length >= 2) {
    await inputs[0].fill('admin@wccrm.com');
    await inputs[1].fill('admin123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(5000);
    console.log('Final URL:', page.url());
  }
  
  await browser.close();
})();
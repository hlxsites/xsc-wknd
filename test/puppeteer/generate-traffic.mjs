import puppeteer from 'puppeteer';

/**
 * Script which generates traffic on the WKND site URL specified by the env var WKND_URL.
 *
 * Usage: `WKND_URL=https://main--wknd--<YOUR-GITHUB-USERNAME-OR-ORG>.hlx.live npm run generate-traffic`
 * ITERATIONS can also be specified as an environment variable. Defaults to 10.
 */

const WKND_URL = process.env.WKND_URL;
const ITERATIONS = parseInt(process.env.ITERATIONS) || 4;

if (!WKND_URL) {
  console.error("Please specify the TEST_URL environment variable.");
  process.exit(1);
}

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate the page to the WKND URL to generate traffic for
  //await page.goto(WKND_URL);

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  const urls = ['https://main--xsc-wknd--hlxsites.hlx.page/en/', 
  'https://main--xsc-wknd--hlxsites.hlx.page/en/magazine/guide-la-skateparks',
  'https://main--xsc-wknd--hlxsites.hlx.page/en/magazine/arctic-surfing',
  'https://main--xsc-wknd--hlxsites.hlx.page/en/magazine/western-australia', 
  'https://main--xsc-wknd--hlxsites.hlx.page/en/magazine/san-diego-surf-spot',
  'https://main--xsc-wknd--hlxsites.hlx.page/en/magazine/ski-touring',
  'https://main--xsc-wknd--hlxsites.hlx.page/en/about-us/',
  'https://main--xsc-wknd--hlxsites.hlx.page/en/faq/'];
  
  for (let i = 0; i < ITERATIONS; i++) {
    for (let u = 0; u < urls.length; u++) {
      const url = urls[u];     
      await page.goto(`${url}`,  { waitUntil: "networkidle2" });  
      }
  }
  console.log('Done! Ran ' + ITERATIONS + " times.");
  await browser.close();
})();
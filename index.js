'use strict';

const puppeteer = require('puppeteer');
const selectors = require('./selectors');
const helperFunctions = require('./helper');

(async () => {
    try {
        const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36';
        const browser = await puppeteer.launch({
            headless: true
        });
        const page = await browser.newPage();
        const initialTargetedURL = 'https://medium.com/';

        await page.setBypassCSP(true);
        await page.setUserAgent(userAgent);

        await page.goto(initialTargetedURL);
        await page.setViewport({
            width: 1920,
            height: 1080
        });
        console.log('Scraping starts...')

        await page.waitForSelector(selectors.trendyArticlesSection);
        console.log('Scraping trendy articles...');
        const trendyArticlesList = await helperFunctions.scrapTrendingArticles(page);
        console.log('Done!');

        console.log('Please wait...');
        console.log('Working on other articles...');
        console.log("Don't close this terminal, this will take few seconds...");
        console.log('Please wait...');

        await helperFunctions.autoScroll(page);

        await page.waitForSelector(selectors.otherArticlesSection);
        console.log('Scraping other articles...');
        const otherArticlesList = await helperFunctions.scrapOtherArticles(page);
        console.log('Done!');

        console.log('Scraping domain icon...');
        const domainIcon = await helperFunctions.scrapDomainIcon(page);
        console.log('Done!');

        await browser.close();

        console.log('Preparing data into a JSON file...')
        await helperFunctions.writeDataToJsonFile({
            articles: {trending: trendyArticlesList, other: otherArticlesList},
            domainIcon
        }).then(res => {
            if (res.success) {
                console.log('==========================================================================');
                console.log('🕷️  Scraping successfully done!👍');
                console.log('Open 📂 scraped-data.json file to see the output.');
                console.log('==========================================================================');
            }
        }).catch(() => {
            console.log('==========================================================================');
            console.log('🕷️  Scraping successfully done but issue with JSON file during making! ❌');
            console.log('==========================================================================');
        })


    } catch (e) {
        if (e instanceof puppeteer.errors.TimeoutError) {
            console.log('Oppsss! Timeout.', e);
            console.log('==========================================================================');
            console.log("🕷️  Scraping couldn't be done successfully ❌");
            console.log("🕷️  Please try again later.");
            console.log('==========================================================================');
        } else {
            console.log('==========================================================================');
            console.log("🕷️  Scraping couldn't be done successfully ❌");
            console.log("🕷️  Please try again later.");
            console.log('==========================================================================');
            console.log('::Error::', e);
        }
    }
})();

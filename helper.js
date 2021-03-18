'use strict';

const fs = require('fs');
const selectors = require('./selectors');

const autoScroll = async (page) => {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            const distance = 200;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

const scrapTrendingArticles = async (page) => {
    return new Promise(async (resolve, reject) => {
        let parsedTrendyArticles = [];

        try {
            const trendingArticles = await page.$$(selectors.trendyArticles);

            for (const trendingArticle of trendingArticles) {
                const authorNameElem = await trendingArticle.$(selectors.trendyArticleAuthorName);
                const authorName = await page.evaluate(authorNameElem => authorNameElem.innerText, authorNameElem);

                const articleNameElem = await trendingArticle.$(selectors.trendyArticleName);
                const articleName = await page.evaluate(articleNameElem => articleNameElem.innerText, articleNameElem);

                const publishedTimeElem = await trendingArticle.$(selectors.trendyArticlePublishedTime);
                let publishedTime = await page.evaluate(publishedTimeElem => publishedTimeElem.innerText, publishedTimeElem);
                publishedTime = publishedTime.replace(/\n/g, "$");
                const res = publishedTime.split("$");
                publishedTime = res[0];

                const articleInfo = {
                    articleName,
                    authorName,
                    publishedTime,
                    articleSummary: 'N/A',
                    articleImg: 'N/A'
                }
                parsedTrendyArticles.push(articleInfo);
            }

            resolve(parsedTrendyArticles);
        } catch (e) {
            console.log('Error during scraping trendy articles...', e);
            reject(parsedTrendyArticles);
        }
    })
}

const scrapOtherArticles = async (page) => {
    return new Promise(async (resolve, reject) => {
        let parsedOtherArticles = [];

        try {
            const otherArticles = await page.$$(selectors.otherArticles);

            for (const otherArticle of otherArticles) {
                const authorNameElem = await otherArticle.$(selectors.otherArticleAuthorName);
                const authorName = await page.evaluate(authorNameElem => authorNameElem.innerText, authorNameElem);

                const articleNameElem = await otherArticle.$(selectors.trendyArticleName);
                const articleName = await page.evaluate(articleNameElem => articleNameElem.innerText, articleNameElem);

                const publishedTimeElem = await otherArticle.$(selectors.otherArticlePublishedTime);
                const publishedTime = await page.evaluate(publishedTimeElem => publishedTimeElem.innerText, publishedTimeElem);

                const articleSummaryElem = await otherArticle.$(selectors.otherArticleSummary);
                const articleSummary = await page.evaluate(articleSummaryElem => {
                    try {
                        return articleSummaryElem.innerText;
                    } catch (e) {
                        return 'N/A';
                    }
                }, articleSummaryElem);

                const articleImgElem = await otherArticle.$(selectors.otherArticleImg);
                let articleImg = 'N/A';
                if (articleImgElem) {
                    articleImg = await page.evaluate(articleImgElem => articleImgElem.getAttribute('src'), articleImgElem);
                }

                const articleInfo = {
                    articleName,
                    authorName,
                    publishedTime,
                    articleSummary,
                    articleImg
                }
                parsedOtherArticles.push(articleInfo);
            }

            resolve(parsedOtherArticles);
        } catch (e) {
            console.log('Error during scraping other articles...', e);
            reject(parsedOtherArticles);
        }
    })
}

const scrapDomainIcon = async (page) => {
    return new Promise(async (resolve, reject) => {
        let domainIcon = 'N/A';

        try {
            const domainIconElem = await page.$(selectors.domainIcon);
            domainIcon = await page.evaluate(domainIconElem => domainIconElem.getAttribute('d'), domainIconElem);

            resolve(domainIcon);
        } catch (e) {
            console.log('Error during domain icon...', e);
            reject(domainIcon);
        }
    })
}

const writeDataToJsonFile = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const jsonData = JSON.stringify(data);
            fs.writeFile('./scraped-data.json', jsonData, (err) => {
                if (!err) {
                    console.log('Done.');
                    resolve({success: true});
                }
            });
        } catch (e) {
            console.log('Error during making a json file...', e);
            reject(resolve({success: false}));
        }
    })
}

module.exports = {
    autoScroll,
    scrapTrendingArticles,
    scrapOtherArticles,
    scrapDomainIcon,
    writeDataToJsonFile
}

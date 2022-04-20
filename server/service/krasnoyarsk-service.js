const puppeteer = require('puppeteer');

class KrasnoyarskService { //Доделать
    search(drugName) {
        let obj, dataNeyron, dataAptekaRU, dataZhivika, dataAptekaOtSklada, dataEapteka, dataZdravcity;
        const p1 = new Promise(function(resolve, reject) {
            (async function() {
                dataNeyron = [];
                const browser = await puppeteer.launch({ headless: false });
                const page = await browser.newPage();
                await page.setDefaultNavigationTimeout(0)
                await page.goto(`https://аптеканейрон.рф/search/?name=${encodeURIComponent(drugName)}`, { waitUntil: "networkidle0" });
                //await page.waitForSelector('.vitrina_item');
                await page.setViewport({
                    width: 1200,
                    height: 800
                })
                let html = await page.evaluate(async() => {
                    let pagee = []
                    let divs = document.querySelectorAll('div.vitrina_item');
                    let numb = 0;
                    divs.forEach(div => {
                        let a = div.querySelector('p.h3');
                        let span = div.querySelector('strong');
                        if (span != null) {
                            cost = span.innerText;
                            cost = cost.replace(/\s+/g, '');
                            let img = div.querySelector('img');
                            if (numb == 0) {
                                img = img.getAttribute('src');
                            } else {
                                img = img.getAttribute('realsrc');
                            }
                            let link = div.querySelector('a.ajax').getAttribute('href');
                            obj = {
                                name: a.innerText,
                                cost: parseFloat(cost),
                                image: img,
                                link: link
                            }
                            pagee.push(obj);
                            numb++;
                        }
                    })
                    return pagee;
                }, { waitUntil: 'div.vitrina_item' })
                await dataNeyron.push(html);
                console.log("Нейрон");
                console.log(dataNeyron[0]);
                browser.close();
                dataNeyron[0].sort(function(a, b) {
                    return a.cost - b.cost;
                });
                resolve();
            })();

        })

        const p2 = new Promise(function(resolve, reject) {
            (async function() {
                dataAptekaRU = [];
                const browser = await puppeteer.launch({ headless: false });
                const page = await browser.newPage();
                await page.setDefaultNavigationTimeout(0)
                await page.goto(`https://apteka.ru/krasnoyarsk/search/?q=${encodeURIComponent(drugName)}`, { waitUntil: "networkidle0" });
                //await page.waitForSelector('.card-order-section');
                await page.setViewport({
                    width: 1200,
                    height: 800
                })
                let html = await page.evaluate(async() => {
                    let pagee = []
                    let divs = document.querySelectorAll('div.catalog-card');
                    divs.forEach(div => {
                        let a = div.querySelector('span.catalog-card__name');
                        let span = div.querySelector('span.moneyprice__content');
                        if (span != null) {
                            cost = span.innerText;
                            cost = cost.replace(/\s+/g, '');
                            let link = 'apteka.ru' + div.querySelector('a.catalog-card__link').getAttribute('href');
                            let image;
                            try {
                                image = div.querySelector('img').getAttribute('src');
                            } catch {
                                image = "https://ugolshop.ru/image/cache/placeholder-800x800.png";
                            }
                            let obj = {
                                name: a.innerText,
                                cost: parseInt(cost),
                                image: image,
                                link: link
                            }
                            pagee.push(obj);
                        }
                    })
                    return pagee;
                }, { waitUntil: 'div.card-order-section' })
                await dataAptekaRU.push(html);
                console.log("Аптека.ру");
                console.log(dataAptekaRU);
                browser.close();
                dataAptekaRU[0].sort(function(a, b) {
                    return a.cost - b.cost;
                })
                resolve();
            })();
        })

        const p3 = new Promise(function(resolve, reject) {
            (async function() {
                dataZhivika = [];
                const browser = await puppeteer.launch({ headless: false });
                const page = await browser.newPage();
                await page.setDefaultNavigationTimeout(0)
                await page.goto(`https://krasnoyarsk.aptekazhivika.ru/search/${encodeURIComponent(drugName)}`, { waitUntil: "networkidle0" });

                //await page.waitForSelector('.product');
                await page.setViewport({
                    width: 1200,
                    height: 800
                })
                let html = await page.evaluate(async() => {
                    let pagee = []
                    let divs = document.querySelectorAll('div.product');
                    divs.forEach(div => {
                        let a = div.querySelector('a.product__title');
                        let span = div.querySelector('span.product__active-price-number');
                        if (span != null) {
                            cost = span.innerText;
                            cost = cost.replace(/\s+/g, '');
                            let obj = {
                                name: a.innerText,
                                cost: parseInt(cost),
                                image: div.querySelector('img.product__img').getAttribute('src'),
                                link: "https://krasnoyarsk.aptekazhivika.ru" + div.querySelector('a.product__title').getAttribute('href')
                            }
                            pagee.push(obj);
                        }
                    })
                    return pagee;
                }, { waitUntil: 'div.product__add-prod' })
                await dataZhivika.push(html);
                console.log("Живика");
                console.log(dataZhivika);
                browser.close();
                dataZhivika[0].sort(function(a, b) {
                    return a.cost - b.cost;
                })
                resolve();
            })();
        })

        const p4 = new Promise(function(resolve, reject) {
            (async function() {
                dataAptekaOtSklada = [];
                const browser = await puppeteer.launch({ headless: false });
                const page = await browser.newPage();
                await page.setDefaultNavigationTimeout(0)
                await page.goto(`https://apteka-ot-sklada.ru/krasnoyarsk/catalog?q=${encodeURIComponent(drugName)}`, { waitUntil: "networkidle0" });

                //await page.waitForSelector('.ui-card__footer');
                await page.setViewport({
                    width: 1200,
                    height: 800
                })
                let html = await page.evaluate(async() => {
                    let pagee = []
                    let divs = document.querySelectorAll('div.ui-card');
                    divs.forEach(div => {
                        let a = div.querySelector('a.goods-card__link');
                        let span = div.querySelector('div.goods-card__price');
                        if (span != null) {
                            cost = span.innerText;
                            cost = cost.replace(/\s+/g, '');

                            let obj = {
                                name: a.innerText,
                                cost: parseInt(cost),
                                image: "https://apteka-ot-sklada.ru" + div.querySelector('img.goods-photo').getAttribute('src'),
                                link: "https://apteka-ot-sklada.ru" + div.querySelector('a.goods-card__link').getAttribute('href')
                            }
                            pagee.push(obj);
                        }
                    })
                    return pagee;
                }, { waitUntil: 'div.ui-card__footer' })
                await dataAptekaOtSklada.push(html);
                console.log("Аптека-от-склада");
                console.log(dataAptekaOtSklada);
                browser.close();
                dataAptekaOtSklada[0].sort(function(a, b) {
                    return a.cost - b.cost;
                })
                resolve();
            })();
        })

        const p5 = new Promise(function(resolve, reject) {
            (async function() {
                dataEapteka = [];
                const browser = await puppeteer.launch({ headless: false });
                const page = await browser.newPage();
                await page.setDefaultNavigationTimeout(0)
                await page.goto(`https://eapteka.ru/krasnoyarsk/search/?q=${encodeURIComponent(drugName)}`);

                await page.waitForSelector('.price--new');
                await page.setViewport({
                    width: 1200,
                    height: 800
                })
                let html = await page.evaluate(async() => {
                    let pagee = []
                    let divs = document.querySelectorAll('section.cc-item');
                    divs.forEach(div => {
                        let a = div.querySelector('a.cc-item--title');
                        let span = div.querySelector('span.price--num');
                        if (span != null) {
                            cost = span.innerText;
                            cost = cost.replace(/\s+/g, '');
                            let obj = {
                                name: a.innerText,
                                cost: parseInt(cost),
                                image: div.querySelector('img').getAttribute('src'),
                                link: "https://eapteka.ru" + div.querySelector('a.cc-item--title').getAttribute('href')
                            }
                            pagee.push(obj);
                        }
                    })
                    return pagee;
                }, { waitUntil: 'div.price--new' })
                await dataEapteka.push(html);
                console.log("Eapteka");
                dataEapteka[0].sort(function(a, b) {
                    return a.cost - b.cost;
                });
                browser.close();
                console.log(dataEapteka);
                resolve();
            })();
        })

        const p6 = new Promise(function(resolve, reject) {
            (async function() {
                dataZdravcity = [];
                const browser = await puppeteer.launch({ headless: false });
                const page = await browser.newPage();
                await page.setDefaultNavigationTimeout(0)
                await page.goto(`https://zdravcity.ru/search/r_krasnoyarsk/?what=${encodeURIComponent(drugName)}`, { waitUntil: "networkidle0" });

                //await page.waitForSelector('div.b-product-item-new__wrapper');
                await page.setViewport({
                    width: 1200,
                    height: 800
                })
                let html = await page.evaluate(async() => {
                    let pagee = []
                    let divs = document.querySelectorAll('div.sc-7d521fa8-0');
                    divs.forEach(div => {
                        let a = div.querySelector('a.sc-3a08f6ad-6');
                        let span = div.querySelector('div.sc-3af8b63b-0');
                        if (span != null) {
                            cost = span.innerText;
                            cost = cost.replace(/\s+/g, '');
                            let obj = {
                                name: a.getAttribute('title'),
                                cost: parseInt(cost),
                                image: div.querySelector('img').getAttribute('src'),
                                link: "https://zdravcity.ru" + a.getAttribute('href')
                            }
                            pagee.push(obj);
                        }
                    })
                    return pagee;
                }, { waitUntil: 'div.b-product-item-new__wrapper' })
                await dataZdravcity.push(html);
                console.log("Здравсити");
                console.log(dataZdravcity);
                dataZdravcity[0].sort(function(a, b) {
                    return a.cost - b.cost;
                });
                browser.close();
                resolve();
            })();
        })

        Promise.all([p1, p2, p3, p4, p5, p6]).then(() => {
            let data = {
                Neyron: dataNeyron,
                AptekaRU: dataAptekaRU,
                Zhivika: dataZhivika,
                AptekaOtSklada: dataAptekaOtSklada,
                Eapteka: dataEapteka,
                Zdravcity: dataZdravcity
            };
            return data;
        })
    }
}

module.exports = new KrasnoyarskService();
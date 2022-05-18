const puppeteer = require('puppeteer');
const krasnoyarskService = require('../service/krasnoyarsk-service');
const DrugsModel = require('../models/Drugs');
const DrugsDto = require('../dtos/drugs-dto');

class searchController {
    async krasnoyarsk(req, res) { //Красноярск сервис доделать
        console.log(req.body.nameDrug);
        const drugName = req.body.nameDrug;
        let obj, dataNeyron = [],
            dataAptekaRU = [],
            dataZhivika = [],
            dataAptekaOtSklada = [],
            dataEapteka = [],
            dataZdravcity = [];
        const test = await DrugsModel.find({ city: "Красноярск", name_drug: drugName });
        if (test.length > 0) {
            console.log("БД содержит информацию");
            const neyron_buf = await DrugsModel.find({ city: "Красноярск", name_drug: drugName, name_apteka: "Нейрон" });
            dataNeyron.push(neyron_buf);
            const aptRU_buf = await DrugsModel.find({ city: "Красноярск", name_drug: drugName, name_apteka: "АптекаРУ" });
            dataAptekaRU.push(aptRU_buf);
            const zhivika_buf = await DrugsModel.find({ city: "Красноярск", name_drug: drugName, name_apteka: "Живика" });
            dataZhivika.push(zhivika_buf);
            const aptotsklada_buf = await DrugsModel.find({ city: "Красноярск", name_drug: drugName, name_apteka: "Аптека-от-склада" });
            dataAptekaOtSklada.push(aptotsklada_buf);
            const eapteka_buf = await DrugsModel.find({ city: "Красноярск", name_drug: drugName, name_apteka: "Eapteka" });
            dataEapteka.push(eapteka_buf);
            const zdravcity_buf = await DrugsModel.find({ city: "Красноярск", name_drug: drugName, name_apteka: "Здравсити" });
            dataZdravcity.push(zdravcity_buf);
            let data = {
                Neyron: dataNeyron,
                AptekaRU: dataAptekaRU,
                Zhivika: dataZhivika,
                AptekaOtSklada: dataAptekaOtSklada,
                Eapteka: dataEapteka,
                Zdravcity: dataZdravcity
            };
            res.send(data);

        } else {
            const p1 = new Promise(function(resolve, reject) { //Аптейка нейрон Красноярск Сайт: аптеканейрон.рф
                (async function() {
                    dataNeyron = [];
                    const browser = await puppeteer.launch({ headless: false });
                    const page = await browser.newPage();
                    await page.setDefaultNavigationTimeout(0)
                    await page.goto(`https://аптеканейрон.рф/search/?name=${encodeURIComponent(req.body.nameDrug)}`, { waitUntil: "networkidle0" });
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
                                let img;
                                try {
                                    img = div.querySelector('img');
                                    if (numb == 0) {
                                        img = img.getAttribute('src');
                                    } else {
                                        img = img.getAttribute('realsrc');
                                    }
                                } catch {
                                    image = "https://ugolshop.ru/image/cache/placeholder-800x800.png";
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
                    for (var k = 0; k < dataNeyron[0].length; k++) {
                        var id_apt = "neyron" + k;
                        await DrugsModel.create({
                            name_drug: drugName,
                            city: "Красноярск",
                            id_apteka: id_apt,
                            name_apteka: "Нейрон",
                            name: dataNeyron[0][k].name,
                            image: dataNeyron[0][k].image,
                            link: dataNeyron[0][k].link,
                            cost: dataNeyron[0][k].cost
                        });
                    }
                    resolve();
                })();

            })

            const p2 = new Promise(function(resolve, reject) { //Аптейка РУ Красноярск Сайт: apteka.ru/krasnoyarsk
                (async function() {
                    dataAptekaRU = [];
                    const browser = await puppeteer.launch({ headless: false });
                    const page = await browser.newPage();
                    await page.setDefaultNavigationTimeout(0)
                    await page.goto(`https://apteka.ru/krasnoyarsk/search/?q=${encodeURIComponent(req.body.nameDrug)}`, { waitUntil: "networkidle0" });
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
                                let link = 'apteka.ru' + div.querySelector('a').getAttribute('href');
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
                    for (var k = 0; k < dataAptekaRU[0].length; k++) {
                        var id_apt = "aptekaru" + k;
                        await DrugsModel.create({
                            name_drug: drugName,
                            city: "Красноярск",
                            id_apteka: id_apt,
                            name_apteka: "АптекаРУ",
                            name: dataAptekaRU[0][k].name,
                            image: dataAptekaRU[0][k].image,
                            link: dataAptekaRU[0][k].link,
                            cost: dataAptekaRU[0][k].cost
                        });
                    }
                    resolve();
                })();
            })

            const p3 = new Promise(function(resolve, reject) { //Аптейка Живика Красноярск Сайт: krasnoyarsk.aptekazhivika.ru
                (async function() {
                    dataZhivika = [];
                    const browser = await puppeteer.launch({ headless: false });
                    const page = await browser.newPage();
                    await page.setDefaultNavigationTimeout(0)
                    await page.goto(`https://krasnoyarsk.aptekazhivika.ru/search/${encodeURIComponent(req.body.nameDrug)}`, { waitUntil: "networkidle0" });

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
                                let image;
                                try {
                                    image = div.querySelector('img.product__img').getAttribute('src');
                                } catch {
                                    image = "https://ugolshop.ru/image/cache/placeholder-800x800.png";
                                }
                                let obj = {
                                    name: a.innerText,
                                    cost: parseInt(cost),
                                    image: image,
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
                    for (var k = 0; k < dataZhivika[0].length; k++) {
                        var id_apt = "zhivika" + k;
                        await DrugsModel.create({
                            name_drug: drugName,
                            city: "Красноярск",
                            id_apteka: id_apt,
                            name_apteka: "Живика",
                            name: dataZhivika[0][k].name,
                            image: dataZhivika[0][k].image,
                            link: dataZhivika[0][k].link,
                            cost: dataZhivika[0][k].cost
                        });
                    }
                    resolve();
                })();
            })

            const p4 = new Promise(function(resolve, reject) { //Аптейка от склада Красноярск Сайт: apteka-ot-sklada.ru/krasnoyarsk
                (async function() {
                    dataAptekaOtSklada = [];
                    const browser = await puppeteer.launch({ headless: false });
                    const page = await browser.newPage();
                    await page.setDefaultNavigationTimeout(0)
                    await page.goto(`https://аптека-от-склада.рф/krasnoyarsk/catalog?q=${encodeURIComponent(req.body.nameDrug)}`, { waitUntil: "networkidle0" });

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
                                let image;
                                try {
                                    image = div.querySelector('img.goods-photo').getAttribute('src');
                                    image = "https://apteka-ot-sklada.ru" + image;
                                } catch {
                                    image = "https://ugolshop.ru/image/cache/placeholder-800x800.png";
                                }

                                let obj = {
                                    name: a.innerText,
                                    cost: parseInt(cost),
                                    image: image,
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
                    for (var k = 0; k < dataAptekaOtSklada[0].length; k++) {
                        var id_apt = "aptotsklada" + k;
                        await DrugsModel.create({
                            name_drug: drugName,
                            city: "Красноярск",
                            id_apteka: id_apt,
                            name_apteka: "Аптека-от-склада",
                            name: dataAptekaOtSklada[0][k].name,
                            image: dataAptekaOtSklada[0][k].image,
                            link: dataAptekaOtSklada[0][k].link,
                            cost: dataAptekaOtSklada[0][k].cost
                        });
                    }
                    resolve();
                })();
            })

            const p5 = new Promise(function(resolve, reject) { //Eapteka  Красноярск Сайт: eapteka.ru/krasnoyarsk
                (async function() {
                    dataEapteka = [];
                    const browser = await puppeteer.launch({ headless: false });
                    const page = await browser.newPage();
                    await page.setDefaultNavigationTimeout(0)
                    await page.goto(`https://eapteka.ru/krasnoyarsk/search/?q=${encodeURIComponent(req.body.nameDrug)}`);

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
                    for (var k = 0; k < dataEapteka[0].length; k++) {
                        var id_apt = "eapteka" + k;
                        await DrugsModel.create({
                            name_drug: drugName,
                            city: "Красноярск",
                            id_apteka: id_apt,
                            name_apteka: "Eapteka",
                            name: dataEapteka[0][k].name,
                            image: dataEapteka[0][k].image,
                            link: dataEapteka[0][k].link,
                            cost: dataEapteka[0][k].cost
                        });
                    }
                    resolve();
                })();
            })

            const p6 = new Promise(function(resolve, reject) { //Аптейка здравсити Красноярск Сайт: zdravcity.ru/r_krasnoyarsk
                (async function() {
                    dataZdravcity = [];
                    const browser = await puppeteer.launch({ headless: false });
                    const page = await browser.newPage();
                    await page.setDefaultNavigationTimeout(0)
                    await page.goto(`https://zdravcity.ru/search/r_krasnoyarsk/?what=${encodeURIComponent(req.body.nameDrug)}`, { waitUntil: "networkidle0" });

                    //await page.waitForSelector('div.b-product-item-new__wrapper');
                    await page.setViewport({
                        width: 1200,
                        height: 800
                    })
                    let html = await page.evaluate(async() => {
                        let pagee = []
                        let divs = document.querySelectorAll('div.sc-79845b11-2');
                        divs.forEach(div => {
                            let a = div.querySelector('a.sc-79845b11-6');
                            let span = div.querySelector('div.Price_price__qHqZv');
                            if (span != null) {
                                cost = span.innerText;
                                cost = cost.replace(/\s+/g, '');
                                let image;
                                try {
                                    image = div.querySelector('img').getAttribute('src');
                                } catch {
                                    image = "https://ugolshop.ru/image/cache/placeholder-800x800.png";
                                }
                                let obj = {
                                    name: a.getAttribute('title'),
                                    cost: parseInt(cost),
                                    image: image,
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
                    for (var k = 0; k < dataZdravcity[0].length; k++) {
                        var id_apt = "zdravcity" + k;
                        await DrugsModel.create({
                            name_drug: drugName,
                            city: "Красноярск",
                            id_apteka: id_apt,
                            name_apteka: "Здравсити",
                            name: dataZdravcity[0][k].name,
                            image: dataZdravcity[0][k].image,
                            link: dataZdravcity[0][k].link,
                            cost: dataZdravcity[0][k].cost
                        });
                    }
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

                console.log(dataNeyron[0].length);
                console.log(dataNeyron[0][1].name);
                res.send(data);
            })
        }
    }

    async bratsk(req, res) { //Братск
        console.log(req.body.nameDrug);
        const drugName = req.body.nameDrug;
        let obj, dataNeyron = [],
            dataAptekaRU = [],
            dataZhivika = [],
            dataAptekaOtSklada = [],
            dataEapteka = [],
            dataZdravcity = [];
        const test = await DrugsModel.find({ city: "Братск", name_drug: drugName });
        if (test.length > 0) {
            console.log("БД содержит информацию");
            const neyron_buf = await DrugsModel.find({ city: "Братск", name_drug: drugName, name_apteka: "Асна" });
            dataNeyron.push(neyron_buf);
            const aptRU_buf = await DrugsModel.find({ city: "Братск", name_drug: drugName, name_apteka: "АптекаРУ" });
            dataAptekaRU.push(aptRU_buf);
            const zhivika_buf = await DrugsModel.find({ city: "Братск", name_drug: drugName, name_apteka: "Живика" });
            dataZhivika.push(zhivika_buf);
            const aptotsklada_buf = await DrugsModel.find({ city: "Братск", name_drug: drugName, name_apteka: "Аптека-от-склада" });
            dataAptekaOtSklada.push(aptotsklada_buf);
            const eapteka_buf = await DrugsModel.find({ city: "Братск", name_drug: drugName, name_apteka: "Eapteka" });
            dataEapteka.push(eapteka_buf);
            const zdravcity_buf = await DrugsModel.find({ city: "Братск", name_drug: drugName, name_apteka: "Здравсити" });
            dataZdravcity.push(zdravcity_buf);
            let data = {
                Neyron: dataNeyron,
                AptekaRU: dataAptekaRU,
                Zhivika: dataZhivika,
                AptekaOtSklada: dataAptekaOtSklada,
                Eapteka: dataEapteka,
                Zdravcity: dataZdravcity
            };
            res.send(data);

        } else {
            const p1 = new Promise(function(resolve, reject) { //Аптека Асна Братск Сайт: brastk.asna.ru
                (async function() {
                    dataNeyron = [];
                    const browser = await puppeteer.launch({ headless: true });
                    const page = await browser.newPage();
                    await page.setDefaultNavigationTimeout(0)
                    await page.goto(`https://bratsk.asna.ru/search/?query=${encodeURIComponent(req.body.nameDrug)}`, { waitUntil: "networkidle0" });
                    //await page.waitForSelector('.vitrina_item');
                    await page.setViewport({
                        width: 1200,
                        height: 800
                    })
                    let html = await page.evaluate(async() => {
                        let pagee = []
                        let divs = document.querySelectorAll('div.product_product__ZvoP0');
                        let numb = 0;
                        divs.forEach(div => {
                            let a = div.querySelector('a.product_name__VzTPG');
                            let span = div.querySelector('span.catalogPrice_price__TRAFl');
                            if (span != null) {
                                cost = span.innerText;
                                cost = cost.replace(/\s+/g, '');
                                let image;
                                try {
                                    image = div.querySelector('img').getAttribute('src');
                                } catch {
                                    image = "https://ugolshop.ru/image/cache/placeholder-800x800.png";
                                }
                                let link = div.querySelector('a.product_name__VzTPG').getAttribute('href');
                                obj = {
                                    name: a.innerText,
                                    cost: parseFloat(cost),
                                    image: image,
                                    link: link
                                }
                                pagee.push(obj);
                                numb++;
                            }
                        })
                        return pagee;
                    }, { waitUntil: 'div.vitrina_item' })
                    await dataNeyron.push(html);
                    console.log("Asna");
                    console.log(dataNeyron[0]);
                    browser.close();
                    dataNeyron[0].sort(function(a, b) {
                        return a.cost - b.cost;
                    });
                    for (var k = 0; k < dataNeyron[0].length; k++) {
                        var id_apt = "neyron" + k;
                        await DrugsModel.create({
                            name_drug: drugName,
                            city: "Братск",
                            id_apteka: id_apt,
                            name_apteka: "Асна",
                            name: dataNeyron[0][k].name,
                            image: dataNeyron[0][k].image,
                            link: dataNeyron[0][k].link,
                            cost: dataNeyron[0][k].cost
                        });
                    }
                    resolve();
                })();

            })

            const p2 = new Promise(function(resolve, reject) { //Аптека Ру Братск сайт: apteka.ru/bratsk
                (async function() {
                    dataAptekaRU = [];
                    const browser = await puppeteer.launch({ headless: true });
                    const page = await browser.newPage();
                    await page.setDefaultNavigationTimeout(0)
                    await page.goto(`https://apteka.ru/bratsk/search/?q=${encodeURIComponent(req.body.nameDrug)}`, { waitUntil: "networkidle0" });
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
                                let link = 'apteka.ru' + div.querySelector('a').getAttribute('href');
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
                    for (var k = 0; k < dataAptekaRU[0].length; k++) {
                        var id_apt = "aptekaru" + k;
                        await DrugsModel.create({
                            name_drug: drugName,
                            city: "Братск",
                            id_apteka: id_apt,
                            name_apteka: "АптекаРУ",
                            name: dataAptekaRU[0][k].name,
                            image: dataAptekaRU[0][k].image,
                            link: dataAptekaRU[0][k].link,
                            cost: dataAptekaRU[0][k].cost
                        });
                    }
                    resolve();
                })();
            })

            const p3 = new Promise(function(resolve, reject) { //Что-то переделать, пока не знаю какую
                (async function() {
                    dataZhivika = [];
                    const browser = await puppeteer.launch({ headless: true });
                    const page = await browser.newPage();
                    await page.setDefaultNavigationTimeout(0)
                    await page.goto(`https://krasnoyarsk.aptekazhivika.ru/search/${encodeURIComponent(req.body.nameDrug)}`, { waitUntil: "networkidle0" });

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
                                let image;
                                try {
                                    image = div.querySelector('img.product__img').getAttribute('src');
                                } catch {
                                    image = "https://ugolshop.ru/image/cache/placeholder-800x800.png";
                                }
                                let obj = {
                                    name: a.innerText,
                                    cost: parseInt(cost),
                                    image: image,
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
                    for (var k = 0; k < dataZhivika[0].length; k++) {
                        var id_apt = "zhivika" + k;
                        await DrugsModel.create({
                            name_drug: drugName,
                            city: "Братск",
                            id_apteka: id_apt,
                            name_apteka: "Живика",
                            name: dataZhivika[0][k].name,
                            image: dataZhivika[0][k].image,
                            link: dataZhivika[0][k].link,
                            cost: dataZhivika[0][k].cost
                        });
                    }
                    resolve();
                })();
            })

            const p4 = new Promise(function(resolve, reject) { //Аптека от склада Братск сайт: apteka-ot-sklada.ru/bratsk
                (async function() {
                    dataAptekaOtSklada = [];
                    const browser = await puppeteer.launch({ headless: true });
                    const page = await browser.newPage();
                    await page.setDefaultNavigationTimeout(0)
                    await page.goto(`https://apteka-ot-sklada.ru/bratsk/catalog?q=${encodeURIComponent(req.body.nameDrug)}`, { waitUntil: "networkidle0" });

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
                                let image;
                                try {
                                    image = div.querySelector('img.goods-photo').getAttribute('src');
                                    image = "https://apteka-ot-sklada.ru" + image;
                                } catch {
                                    image = "https://ugolshop.ru/image/cache/placeholder-800x800.png";
                                }

                                let obj = {
                                    name: a.innerText,
                                    cost: parseInt(cost),
                                    image: image,
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
                    for (var k = 0; k < dataAptekaOtSklada[0].length; k++) {
                        var id_apt = "aptotsklada" + k;
                        await DrugsModel.create({
                            name_drug: drugName,
                            city: "Братск",
                            id_apteka: id_apt,
                            name_apteka: "Аптека-от-склада",
                            name: dataAptekaOtSklada[0][k].name,
                            image: dataAptekaOtSklada[0][k].image,
                            link: dataAptekaOtSklada[0][k].link,
                            cost: dataAptekaOtSklada[0][k].cost
                        });
                    }
                    resolve();
                })();
            })

            const p5 = new Promise(function(resolve, reject) { //Добавить другую
                (async function() {
                    dataEapteka = [];
                    const browser = await puppeteer.launch({ headless: false });
                    const page = await browser.newPage();
                    await page.setDefaultNavigationTimeout(0)
                    await page.goto(`https://eapteka.ru/krasnoyarsk/search/?q=${encodeURIComponent(req.body.nameDrug)}`);

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
                    for (var k = 0; k < dataEapteka[0].length; k++) {
                        var id_apt = "eapteka" + k;
                        await DrugsModel.create({
                            name_drug: drugName,
                            city: "Братск",
                            id_apteka: id_apt,
                            name_apteka: "Eapteka",
                            name: dataEapteka[0][k].name,
                            image: dataEapteka[0][k].image,
                            link: dataEapteka[0][k].link,
                            cost: dataEapteka[0][k].cost
                        });
                    }
                    browser.close();
                    console.log(dataEapteka);
                    resolve();
                })();
            })

            const p6 = new Promise(function(resolve, reject) { //Аптека здравсити Братск сайт: zdravcity.ru/r_irk
                (async function() {
                    dataZdravcity = [];
                    const browser = await puppeteer.launch({ headless: true });
                    const page = await browser.newPage();
                    await page.setDefaultNavigationTimeout(0)
                    await page.goto(`https://zdravcity.ru/search/r_irk/?what=${encodeURIComponent(req.body.nameDrug)}`, { waitUntil: "networkidle0" });

                    //await page.waitForSelector('div.b-product-item-new__wrapper');
                    await page.setViewport({
                        width: 1200,
                        height: 800
                    })
                    let html = await page.evaluate(async() => {
                        let pagee = []
                        let divs = document.querySelectorAll('div.sc-e16c6409-2');
                        divs.forEach(div => {
                            let a = div.querySelector('a.sc-e16c6409-6');
                            let span = div.querySelector('div.Price_price__qHqZv');
                            if (span != null) {
                                cost = span.innerText;
                                cost = cost.replace(/\s+/g, '');
                                let image;
                                try {
                                    image = div.querySelector('img').getAttribute('src');
                                } catch {
                                    image = "https://ugolshop.ru/image/cache/placeholder-800x800.png";
                                }
                                let obj = {
                                    name: a.getAttribute('title'),
                                    cost: parseInt(cost),
                                    image: image,
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
                    for (var k = 0; k < dataZdravcity[0].length; k++) {
                        var id_apt = "zdravcity" + k;
                        await DrugsModel.create({
                            name_drug: drugName,
                            city: "Братск",
                            id_apteka: id_apt,
                            name_apteka: "Здравсити",
                            name: dataZdravcity[0][k].name,
                            image: dataZdravcity[0][k].image,
                            link: dataZdravcity[0][k].link,
                            cost: dataZdravcity[0][k].cost
                        });
                    }
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
                res.send(data);
            })
        }
    }

    async perm(req, res) { //Пермь
        console.log(req.body.nameDrug);
        const drugName = req.body.nameDrug;
        let obj, dataNeyron = [],
            dataAptekaRU = [],
            dataZhivika = [],
            dataAptekaOtSklada = [],
            dataEapteka = [],
            dataZdravcity = [];
        const test = await DrugsModel.find({ city: "Пермь", name_drug: drugName });
        if (test.length > 0) {
            console.log("БД содержит информацию");
            const neyron_buf = await DrugsModel.find({ city: "Пермь", name_drug: drugName, name_apteka: "Мегаптека" });
            dataNeyron.push(neyron_buf);
            const aptRU_buf = await DrugsModel.find({ city: "Пермь", name_drug: drugName, name_apteka: "АптекаРУ" });
            dataAptekaRU.push(aptRU_buf);
            const zhivika_buf = await DrugsModel.find({ city: "Пермь", name_drug: drugName, name_apteka: "Живика" });
            dataZhivika.push(zhivika_buf);
            const aptotsklada_buf = await DrugsModel.find({ city: "Пермь", name_drug: drugName, name_apteka: "Аптека-от-склада" });
            dataAptekaOtSklada.push(aptotsklada_buf);
            const eapteka_buf = await DrugsModel.find({ city: "Пермь", name_drug: drugName, name_apteka: "Пермьфармация" });
            dataEapteka.push(eapteka_buf);
            const zdravcity_buf = await DrugsModel.find({ city: "Пермь", name_drug: drugName, name_apteka: "Здравсити" });
            dataZdravcity.push(zdravcity_buf);
            let data = {
                Neyron: dataNeyron,
                AptekaRU: dataAptekaRU,
                Zhivika: dataZhivika,
                AptekaOtSklada: dataAptekaOtSklada,
                Eapteka: dataEapteka,
                Zdravcity: dataZdravcity
            };
            res.send(data);

        } else {
            const p1 = new Promise(function(resolve, reject) { //Аптека Мегааптека Пермь Сайт: megapteka.ru/perm
                (async function() {
                    dataNeyron = [];
                    const browser = await puppeteer.launch({ headless: false });
                    const page = await browser.newPage();
                    await page.setDefaultNavigationTimeout(0)
                    await page.goto('https://megapteka.ru/perm')
                    await page.goto(`https://megapteka.ru/search?q=${encodeURIComponent(req.body.nameDrug)}`);
                    try {
                        await page.waitForSelector('div.card-item');
                        await page.setViewport({
                            width: 1200,
                            height: 800
                        })
                    } catch (e) {
                        console.log("Oshibka")
                    }
                    let html = await page.evaluate(async() => {
                        let pagee = []
                        let divs = document.querySelectorAll('div.card-item-wrap');
                        let numb = 0;
                        divs.forEach(div => {
                            let a = div.querySelector('div.card-item-info');
                            let span = div.querySelector('span.thisText');
                            if (span != null) {
                                cost = span.innerText;
                                cost = cost.replace(/\s+/g, '');
                                cost = cost.replace("₽", '');
                                cost = cost.replace("от", '');
                                let image;
                                try {
                                    image = div.querySelector('img').getAttribute('src');
                                } catch {
                                    image = "https://ugolshop.ru/image/cache/placeholder-800x800.png";
                                }
                                let link = "https://megapteka.ru" + div.querySelector('a').getAttribute('href');
                                obj = {
                                    name: a.querySelector('a').innerText,
                                    cost: parseFloat(cost),
                                    image: image,
                                    link: link
                                }
                                pagee.push(obj);
                                numb++;
                            }
                        })
                        return pagee;
                    }, { waitUntil: 'div.card-item-wrap' })
                    await dataNeyron.push(html);
                    console.log("Megapteka");
                    console.log(dataNeyron[0]);
                    browser.close();
                    dataNeyron[0].sort(function(a, b) {
                        return a.cost - b.cost;
                    });
                    for (var k = 0; k < dataNeyron[0].length; k++) {
                        var id_apt = "neyron" + k;
                        await DrugsModel.create({
                            name_drug: drugName,
                            city: "Пермь",
                            id_apteka: id_apt,
                            name_apteka: "Мегаптека",
                            name: dataNeyron[0][k].name,
                            image: dataNeyron[0][k].image,
                            link: dataNeyron[0][k].link,
                            cost: dataNeyron[0][k].cost
                        });
                    }
                    resolve();
                })();

            })

            const p2 = new Promise(function(resolve, reject) { //Аптека Ру Пермь сайт: apteka.ru/bratsk
                (async function() {
                    dataAptekaRU = [];
                    const browser = await puppeteer.launch({ headless: true });
                    const page = await browser.newPage();
                    await page.setDefaultNavigationTimeout(0)
                    await page.goto(`https://apteka.ru/perm/search/?q=${encodeURIComponent(req.body.nameDrug)}`, { waitUntil: "networkidle0" });
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
                                let link = 'apteka.ru' + div.querySelector('a').getAttribute('href');
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
                    for (var k = 0; k < dataAptekaRU[0].length; k++) {
                        var id_apt = "aptekaru" + k;
                        await DrugsModel.create({
                            name_drug: drugName,
                            city: "Пермь",
                            id_apteka: id_apt,
                            name_apteka: "АптекаРУ",
                            name: dataAptekaRU[0][k].name,
                            image: dataAptekaRU[0][k].image,
                            link: dataAptekaRU[0][k].link,
                            cost: dataAptekaRU[0][k].cost
                        });
                    }
                    resolve();
                })();
            })

            const p3 = new Promise(function(resolve, reject) { //Что-то переделать, пока не знаю какую
                (async function() {
                    dataZhivika = [];
                    const browser = await puppeteer.launch({ headless: true });
                    const page = await browser.newPage();
                    await page.setDefaultNavigationTimeout(0)
                    await page.goto(`https://krasnoyarsk.aptekazhivika.ru/search/${encodeURIComponent(req.body.nameDrug)}`, { waitUntil: "networkidle0" });

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
                                let image;
                                try {
                                    image = div.querySelector('img.product__img').getAttribute('src');
                                } catch {
                                    image = "https://ugolshop.ru/image/cache/placeholder-800x800.png";
                                }
                                let obj = {
                                    name: a.innerText,
                                    cost: parseInt(cost),
                                    image: image,
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
                    for (var k = 0; k < dataZhivika[0].length; k++) {
                        var id_apt = "zhivika" + k;
                        await DrugsModel.create({
                            name_drug: drugName,
                            city: "Пермь",
                            id_apteka: id_apt,
                            name_apteka: "Живика",
                            name: dataZhivika[0][k].name,
                            image: dataZhivika[0][k].image,
                            link: dataZhivika[0][k].link,
                            cost: dataZhivika[0][k].cost
                        });
                    }
                    resolve();
                })();
            })

            const p4 = new Promise(function(resolve, reject) { //Аптека от склада Братск сайт: apteka-ot-sklada.ru/bratsk
                (async function() {
                    dataAptekaOtSklada = [];
                    const browser = await puppeteer.launch({ headless: true });
                    const page = await browser.newPage();
                    await page.setDefaultNavigationTimeout(0)
                    await page.goto(`https://apteka-ot-sklada.ru/perm/catalog?q=${encodeURIComponent(req.body.nameDrug)}`, { waitUntil: "networkidle0" });

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
                                let image;
                                try {
                                    image = div.querySelector('img.goods-photo').getAttribute('src');
                                    image = "https://apteka-ot-sklada.ru" + image;
                                } catch {
                                    image = "https://ugolshop.ru/image/cache/placeholder-800x800.png";
                                }

                                let obj = {
                                    name: a.innerText,
                                    cost: parseInt(cost),
                                    image: image,
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
                    for (var k = 0; k < dataAptekaOtSklada[0].length; k++) {
                        var id_apt = "aptotsklada" + k;
                        await DrugsModel.create({
                            name_drug: drugName,
                            city: "Пермь",
                            id_apteka: id_apt,
                            name_apteka: "Аптека-от-склада",
                            name: dataAptekaOtSklada[0][k].name,
                            image: dataAptekaOtSklada[0][k].image,
                            link: dataAptekaOtSklada[0][k].link,
                            cost: dataAptekaOtSklada[0][k].cost
                        });
                    }
                    resolve();
                })();
            })

            const p5 = new Promise(function(resolve, reject) { //Аптека пермфармация пермь сайт: pharmperm.ru
                (async function() {
                    dataEapteka = [];
                    const browser = await puppeteer.launch({ headless: false });
                    const page = await browser.newPage();
                    await page.setDefaultNavigationTimeout(0)
                    await page.goto(`https://pharmperm.ru/catalog/?keyword=${encodeURIComponent(req.body.nameDrug)}`);

                    await page.waitForSelector('div.catalog-items');
                    await page.setViewport({
                        width: 1200,
                        height: 800
                    })
                    let html = await page.evaluate(async() => {
                        let pagee = []
                        let divs = document.querySelectorAll('div.offer-item-grid');
                        divs.forEach(div => {
                            let a = div.querySelector('a.link-dark');
                            let span = div.querySelector('div.price');
                            if (span != null) {
                                cost = span.innerText;
                                cost = cost.replace(/\s+/g, '');
                                cost = cost.replace("₽", '');
                                cost = cost.replace("от", '');
                                let image;
                                try {
                                    image = div.querySelector('img').getAttribute('src');
                                } catch {
                                    image = "https://ugolshop.ru/image/cache/placeholder-800x800.png";
                                }
                                let link = "https://pharmperm.ru" + div.querySelector('a.link-dark').getAttribute('href');

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
                    }, { waitUntil: 'div.offer-item-grid' })
                    await dataEapteka.push(html);
                    console.log("Пермьфармация");
                    dataEapteka[0].sort(function(a, b) {
                        return a.cost - b.cost;
                    });
                    for (var k = 0; k < dataEapteka[0].length; k++) {
                        var id_apt = "eapteka" + k;
                        await DrugsModel.create({
                            name_drug: drugName,
                            city: "Пермь",
                            id_apteka: id_apt,
                            name_apteka: "Пермьфармация",
                            name: dataEapteka[0][k].name,
                            image: dataEapteka[0][k].image,
                            link: dataEapteka[0][k].link,
                            cost: dataEapteka[0][k].cost
                        });
                    }
                    browser.close();
                    console.log(dataEapteka);
                    resolve();
                })();
            })

            const p6 = new Promise(function(resolve, reject) { //Аптека здравсити Пермь сайт: zdravcity.ru/r_irk
                (async function() {
                    dataZdravcity = [];
                    const browser = await puppeteer.launch({ headless: true });
                    const page = await browser.newPage();
                    await page.setDefaultNavigationTimeout(0)
                    await page.goto(`https://zdravcity.ru/search/r_perm/?what=${encodeURIComponent(req.body.nameDrug)}`, { waitUntil: "networkidle0" });

                    //await page.waitForSelector('div.b-product-item-new__wrapper');
                    await page.setViewport({
                        width: 1200,
                        height: 800
                    })
                    let html = await page.evaluate(async() => {
                        let pagee = []
                        let divs = document.querySelectorAll('div.sc-e16c6409-2');
                        divs.forEach(div => {
                            let a = div.querySelector('a.sc-e16c6409-6');
                            let span = div.querySelector('div.Price_price__qHqZv');
                            if (span != null) {
                                cost = span.innerText;
                                cost = cost.replace(/\s+/g, '');
                                let image;
                                try {
                                    image = div.querySelector('img').getAttribute('src');
                                } catch {
                                    image = "https://ugolshop.ru/image/cache/placeholder-800x800.png";
                                }
                                let obj = {
                                    name: a.getAttribute('title'),
                                    cost: parseInt(cost),
                                    image: image,
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
                    for (var k = 0; k < dataZdravcity[0].length; k++) {
                        var id_apt = "zdravcity" + k;
                        await DrugsModel.create({
                            name_drug: drugName,
                            city: "Пермь",
                            id_apteka: id_apt,
                            name_apteka: "Здравсити",
                            name: dataZdravcity[0][k].name,
                            image: dataZdravcity[0][k].image,
                            link: dataZdravcity[0][k].link,
                            cost: dataZdravcity[0][k].cost
                        });
                    }
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
                res.send(data);
            })
        }
    }

    async kazan(req, res) { //Казань
        console.log(req.body.nameDrug);
        const drugName = req.body.nameDrug;
        let obj, dataNeyron = [],
            dataAptekaRU = [],
            dataZhivika = [],
            dataAptekaOtSklada = [],
            dataEapteka = [],
            dataZdravcity = [];
        const test = await DrugsModel.find({ city: "Казань", name_drug: drugName });
        if (test.length > 0) {
            console.log("БД содержит информацию");
            const neyron_buf = await DrugsModel.find({ city: "Казань", name_drug: drugName, name_apteka: "Мегаптека" });
            dataNeyron.push(neyron_buf);
            const aptRU_buf = await DrugsModel.find({ city: "Казань", name_drug: drugName, name_apteka: "АптекаРУ" });
            dataAptekaRU.push(aptRU_buf);
            const zhivika_buf = await DrugsModel.find({ city: "Казань", name_drug: drugName, name_apteka: "Фармленд" });
            dataZhivika.push(zhivika_buf);
            const aptotsklada_buf = await DrugsModel.find({ city: "Казань", name_drug: drugName, name_apteka: "Аптека-от-склада" });
            dataAptekaOtSklada.push(aptotsklada_buf);
            const eapteka_buf = await DrugsModel.find({ city: "Казань", name_drug: drugName, name_apteka: "Бережная аптека" });
            dataEapteka.push(eapteka_buf);
            const zdravcity_buf = await DrugsModel.find({ city: "Казань", name_drug: drugName, name_apteka: "Здравсити" });
            dataZdravcity.push(zdravcity_buf);
            let data = {
                Neyron: dataNeyron,
                AptekaRU: dataAptekaRU,
                Zhivika: dataZhivika,
                AptekaOtSklada: dataAptekaOtSklada,
                Eapteka: dataEapteka,
                Zdravcity: dataZdravcity
            };
            res.send(data);

        } else {
            const p1 = new Promise(function(resolve, reject) { //Аптека Мегааптека Казань Сайт: megapteka.ru/perm
                (async function() {
                    dataNeyron = [];
                    const browser = await puppeteer.launch({ headless: false });
                    const page = await browser.newPage();
                    await page.setDefaultNavigationTimeout(0)
                    await page.goto('https://megapteka.ru/kazan')
                    await page.goto(`https://megapteka.ru/search?q=${encodeURIComponent(req.body.nameDrug)}`);
                    try {
                        await page.waitForSelector('div.card-item');
                        await page.setViewport({
                            width: 1200,
                            height: 800
                        })
                    } catch (e) {
                        console.log("Oshibka")
                    }
                    let html = await page.evaluate(async() => {
                        let pagee = []
                        let divs = document.querySelectorAll('div.card-item-wrap');
                        let numb = 0;
                        divs.forEach(div => {
                            let a = div.querySelector('div.card-item-info');
                            let span = div.querySelector('span.thisText');
                            if (span != null) {
                                cost = span.innerText;
                                cost = cost.replace(/\s+/g, '');
                                cost = cost.replace("₽", '');
                                cost = cost.replace("от", '');
                                let image;
                                try {
                                    image = div.querySelector('img').getAttribute('src');
                                } catch {
                                    image = "https://ugolshop.ru/image/cache/placeholder-800x800.png";
                                }
                                let link = "https://megapteka.ru" + div.querySelector('a').getAttribute('href');
                                obj = {
                                    name: a.querySelector('a').innerText,
                                    cost: parseFloat(cost),
                                    image: image,
                                    link: link
                                }
                                pagee.push(obj);
                                numb++;
                            }
                        })
                        return pagee;
                    }, { waitUntil: 'div.card-item-wrap' })
                    await dataNeyron.push(html);
                    console.log("Megapteka");
                    console.log(dataNeyron[0]);
                    browser.close();
                    dataNeyron[0].sort(function(a, b) {
                        return a.cost - b.cost;
                    });
                    for (var k = 0; k < dataNeyron[0].length; k++) {
                        var id_apt = "neyron" + k;
                        await DrugsModel.create({
                            name_drug: drugName,
                            city: "Казань",
                            id_apteka: id_apt,
                            name_apteka: "Мегаптека",
                            name: dataNeyron[0][k].name,
                            image: dataNeyron[0][k].image,
                            link: dataNeyron[0][k].link,
                            cost: dataNeyron[0][k].cost
                        });
                    }
                    resolve();
                })();

            })

            const p2 = new Promise(function(resolve, reject) { //Аптека Ру Казань сайт: apteka.ru/bratsk
                (async function() {
                    dataAptekaRU = [];
                    const browser = await puppeteer.launch({ headless: true });
                    const page = await browser.newPage();
                    await page.setDefaultNavigationTimeout(0)
                    await page.goto(`https://apteka.ru/kazan/search/?q=${encodeURIComponent(req.body.nameDrug)}`, { waitUntil: "networkidle0" });
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
                                let link = 'apteka.ru' + div.querySelector('a').getAttribute('href');
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
                    for (var k = 0; k < dataAptekaRU[0].length; k++) {
                        var id_apt = "aptekaru" + k;
                        await DrugsModel.create({
                            name_drug: drugName,
                            city: "Казань",
                            id_apteka: id_apt,
                            name_apteka: "АптекаРУ",
                            name: dataAptekaRU[0][k].name,
                            image: dataAptekaRU[0][k].image,
                            link: dataAptekaRU[0][k].link,
                            cost: dataAptekaRU[0][k].cost
                        });
                    }
                    resolve();
                })();
            })

            const p3 = new Promise(function(resolve, reject) { //Аптека фармленд казань сайт farmlend.ru
                (async function() {
                    dataZhivika = [];
                    const browser = await puppeteer.launch({ headless: false });
                    const page = await browser.newPage();
                    await page.setDefaultNavigationTimeout(0)
                    await page.goto(`https://farmlend.ru/kazan/search?keyword=${encodeURIComponent(req.body.nameDrug)}`);

                    try {
                        await page.waitForSelector('div.p-item');
                        await page.setViewport({
                            width: 1200,
                            height: 800
                        })
                    } catch (e) {
                        console.log("Oshibka")
                    }
                    let html = await page.evaluate(async() => {
                        let pagee = []
                        let divs = document.querySelectorAll('div.p-item');
                        divs.forEach(div => {
                            let a = div.querySelector('div.pi-title');
                            let span = div.querySelector('div.pi-current');
                            if (span != null) {
                                cost = span.innerText;
                                cost = cost.replace(/\s+/g, '');
                                cost = cost.replace("₽", '');
                                cost = cost.replace("от", '');
                                let image;
                                try {
                                    image = div.querySelector('img').getAttribute('src');
                                    image = "https://farmlend.ru" + image;
                                } catch {
                                    image = "https://ugolshop.ru/image/cache/placeholder-800x800.png";
                                }
                                let link = "https://farmlend.ru" + div.querySelector('a').getAttribute('href');
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
                    }, { waitUntil: 'div.p-item' })
                    await dataZhivika.push(html);
                    console.log("фармленд");
                    console.log(dataZhivika);
                    browser.close();
                    dataZhivika[0].sort(function(a, b) {
                        return a.cost - b.cost;
                    })
                    for (var k = 0; k < dataZhivika[0].length; k++) {
                        var id_apt = "zhivika" + k;
                        await DrugsModel.create({
                            name_drug: drugName,
                            city: "Казань",
                            id_apteka: id_apt,
                            name_apteka: "Фармленд",
                            name: dataZhivika[0][k].name,
                            image: dataZhivika[0][k].image,
                            link: dataZhivika[0][k].link,
                            cost: dataZhivika[0][k].cost
                        });
                    }
                    resolve();
                })();
            })

            const p4 = new Promise(function(resolve, reject) { //Аптека от склада Казань сайт: apteka-ot-sklada.ru/bratsk
                (async function() {
                    dataAptekaOtSklada = [];
                    const browser = await puppeteer.launch({ headless: true });
                    const page = await browser.newPage();
                    await page.setDefaultNavigationTimeout(0)
                    await page.goto(`https://apteka-ot-sklada.ru/kazan/catalog?q=${encodeURIComponent(req.body.nameDrug)}`, { waitUntil: "networkidle0" });

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
                                let image;
                                try {
                                    image = div.querySelector('img.goods-photo').getAttribute('src');
                                    image = "https://apteka-ot-sklada.ru" + image;
                                } catch {
                                    image = "https://ugolshop.ru/image/cache/placeholder-800x800.png";
                                }

                                let obj = {
                                    name: a.innerText,
                                    cost: parseInt(cost),
                                    image: image,
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
                    for (var k = 0; k < dataAptekaOtSklada[0].length; k++) {
                        var id_apt = "aptotsklada" + k;
                        await DrugsModel.create({
                            name_drug: drugName,
                            city: "Казань",
                            id_apteka: id_apt,
                            name_apteka: "Аптека-от-склада",
                            name: dataAptekaOtSklada[0][k].name,
                            image: dataAptekaOtSklada[0][k].image,
                            link: dataAptekaOtSklada[0][k].link,
                            cost: dataAptekaOtSklada[0][k].cost
                        });
                    }
                    resolve();
                })();
            })

            const p5 = new Promise(function(resolve, reject) { //Аптека бережная аптека казань сайт: b-apteka.ru
                (async function() {
                    dataEapteka = [];
                    const browser = await puppeteer.launch({ headless: false });
                    const page = await browser.newPage();
                    await page.setDefaultNavigationTimeout(0)
                    await page.goto("https://b-apteka.ru/kazan")
                    await page.goto(`https://b-apteka.ru/search?q=${encodeURIComponent(req.body.nameDrug)}`);

                    await page.waitForSelector('div.search-card__container');
                    await page.setViewport({
                        width: 1200,
                        height: 800
                    })
                    let html = await page.evaluate(async() => {
                        let pagee = []
                        let divs = document.querySelectorAll('div.search-card__container');
                        divs.forEach(div => {
                            let a = div.querySelector('h4.header-card-search__title');
                            let a2 = div.querySelector('div.header-card-search__description')
                            let span = div.querySelector('div.price-search__present');
                            if (span != null) {
                                cost = span.innerText;
                                cost = cost.replace(/\s+/g, '');
                                cost = cost.replace("₽", '');
                                cost = cost.replace("от", '');
                                let image;
                                try {
                                    image = div.querySelector('img').getAttribute('src');
                                    image = "https://b-apteka.ru" + image;
                                } catch {
                                    image = "https://ugolshop.ru/image/cache/placeholder-800x800.png";
                                }
                                let link = div.querySelector('a').getAttribute('href');

                                let obj = {
                                    name: a.innerText + " " + a2.innerText,
                                    cost: parseInt(cost),
                                    image: image,
                                    link: link
                                }
                                pagee.push(obj);
                            }
                        })
                        return pagee;
                    }, { waitUntil: 'div.search-card__container' })
                    await dataEapteka.push(html);
                    console.log("Бережная аптека");
                    dataEapteka[0].sort(function(a, b) {
                        return a.cost - b.cost;
                    });
                    for (var k = 0; k < dataEapteka[0].length; k++) {
                        var id_apt = "eapteka" + k;
                        await DrugsModel.create({
                            name_drug: drugName,
                            city: "Казань",
                            id_apteka: id_apt,
                            name_apteka: "Бережная аптека",
                            name: dataEapteka[0][k].name,
                            image: dataEapteka[0][k].image,
                            link: dataEapteka[0][k].link,
                            cost: dataEapteka[0][k].cost
                        });
                    }
                    browser.close();
                    console.log(dataEapteka);
                    resolve();
                })();
            })

            const p6 = new Promise(function(resolve, reject) { //Аптека здравсити казань сайт: zdravcity.ru/r_irk
                (async function() {
                    dataZdravcity = [];
                    const browser = await puppeteer.launch({ headless: true });
                    const page = await browser.newPage();
                    await page.setDefaultNavigationTimeout(0)
                    await page.goto(`https://zdravcity.ru/search/r_kazan/?what=${encodeURIComponent(req.body.nameDrug)}`, { waitUntil: "networkidle0" });

                    //await page.waitForSelector('div.b-product-item-new__wrapper');
                    await page.setViewport({
                        width: 1200,
                        height: 800
                    })
                    let html = await page.evaluate(async() => {
                        let pagee = []
                        let divs = document.querySelectorAll('div.sc-79845b11-2');
                        divs.forEach(div => {
                            let a = div.querySelector('a.sc-79845b11-6');
                            let span = div.querySelector('div.Price_price__qHqZv');
                            if (span != null) {
                                cost = span.innerText;
                                cost = cost.replace(/\s+/g, '');
                                let image;
                                try {
                                    image = div.querySelector('img').getAttribute('src');
                                } catch {
                                    image = "https://ugolshop.ru/image/cache/placeholder-800x800.png";
                                }
                                let obj = {
                                    name: a.getAttribute('title'),
                                    cost: parseInt(cost),
                                    image: image,
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
                    for (var k = 0; k < dataZdravcity[0].length; k++) {
                        var id_apt = "zdravcity" + k;
                        await DrugsModel.create({
                            name_drug: drugName,
                            city: "Казань",
                            id_apteka: id_apt,
                            name_apteka: "Здравсити",
                            name: dataZdravcity[0][k].name,
                            image: dataZdravcity[0][k].image,
                            link: dataZdravcity[0][k].link,
                            cost: dataZdravcity[0][k].cost
                        });
                    }
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
                res.send(data);
            })
        }
    }

    async vladivostok(req, res) { //Владивосток
            console.log(req.body.nameDrug);
            const drugName = req.body.nameDrug;
            let obj, dataNeyron = [],
                dataAptekaRU = [],
                dataZhivika = [],
                dataAptekaOtSklada = [],
                dataEapteka = [],
                dataZdravcity = [];
            const test = await DrugsModel.find({ city: "Владивосток", name_drug: drugName });
            if (test.length > 0) {
                console.log("БД содержит информацию");
                const neyron_buf = await DrugsModel.find({ city: "Владивосток", name_drug: drugName, name_apteka: "Мегаптека" });
                dataNeyron.push(neyron_buf);
                const aptRU_buf = await DrugsModel.find({ city: "Владивосток", name_drug: drugName, name_apteka: "АптекаРУ" });
                dataAptekaRU.push(aptRU_buf);
                const zhivika_buf = await DrugsModel.find({ city: "Владивосток", name_drug: drugName, name_apteka: "Овита" });
                dataZhivika.push(zhivika_buf);
                const aptotsklada_buf = await DrugsModel.find({ city: "Владивосток", name_drug: drugName, name_apteka: "АптекаАБ" });
                dataAptekaOtSklada.push(aptotsklada_buf);
                const eapteka_buf = await DrugsModel.find({ city: "Владивосток", name_drug: drugName, name_apteka: "WER" });
                dataEapteka.push(eapteka_buf);
                const zdravcity_buf = await DrugsModel.find({ city: "Владивосток", name_drug: drugName, name_apteka: "Здравсити" });
                dataZdravcity.push(zdravcity_buf);
                let data = {
                    Neyron: dataNeyron,
                    AptekaRU: dataAptekaRU,
                    Zhivika: dataZhivika,
                    AptekaOtSklada: dataAptekaOtSklada,
                    Eapteka: dataEapteka,
                    Zdravcity: dataZdravcity
                };
                res.send(data);

            } else {
                const p1 = new Promise(function(resolve, reject) { //Аптека Мегааптека Владивосток Сайт: megapteka.ru/perm
                    (async function() {
                        dataNeyron = [];
                        const browser = await puppeteer.launch({ headless: false });
                        const page = await browser.newPage();
                        await page.setDefaultNavigationTimeout(0)
                        await page.goto('https://megapteka.ru/vladivostok')
                        await page.goto(`https://megapteka.ru/search?q=${encodeURIComponent(req.body.nameDrug)}`);
                        try {
                            await page.waitForSelector('div.container');
                            await page.setViewport({
                                width: 1200,
                                height: 800
                            })
                        } catch (e) {
                            console.log("Oshibka")
                        }
                        let html = await page.evaluate(async() => {
                            let pagee = []
                            let divs = document.querySelectorAll('div.container');
                            let numb = 0;
                            divs.forEach(div => {
                                let a = div.querySelector('div.name');
                                let span = div.querySelector('div.price');
                                if (span != null) {
                                    cost = span.innerText;
                                    cost = cost.replace(/\s+/g, '');
                                    cost = cost.replace("₽", '');
                                    cost = cost.replace("от", '');
                                    let image;
                                    try {
                                        image = div.querySelector('img').getAttribute('src');
                                    } catch {
                                        image = "https://ugolshop.ru/image/cache/placeholder-800x800.png";
                                    }
                                    let link = "https://megapteka.ru" + div.querySelector('a').getAttribute('href');
                                    obj = {
                                        name: a.innerText,
                                        cost: parseFloat(cost),
                                        image: image,
                                        link: link
                                    }
                                    pagee.push(obj);
                                    numb++;
                                }
                            })
                            return pagee;
                        }, { waitUntil: 'div.card-item-wrap' })
                        await dataNeyron.push(html);
                        console.log("Megapteka");
                        console.log(dataNeyron[0]);
                        browser.close();
                        dataNeyron[0].sort(function(a, b) {
                            return a.cost - b.cost;
                        });
                        for (var k = 0; k < dataNeyron[0].length; k++) {
                            var id_apt = "neyron" + k;
                            await DrugsModel.create({
                                name_drug: drugName,
                                city: "Владивосток",
                                id_apteka: id_apt,
                                name_apteka: "Мегаптека",
                                name: dataNeyron[0][k].name,
                                image: dataNeyron[0][k].image,
                                link: dataNeyron[0][k].link,
                                cost: dataNeyron[0][k].cost
                            });
                        }
                        resolve();
                    })();

                })

                const p2 = new Promise(function(resolve, reject) { //Аптека Ру Владивосток сайт: apteka.ru/bratsk
                    (async function() {
                        dataAptekaRU = [];
                        const browser = await puppeteer.launch({ headless: true });
                        const page = await browser.newPage();
                        await page.setDefaultNavigationTimeout(0)
                        await page.goto(`https://apteka.ru/vladivostok/search/?q=${encodeURIComponent(req.body.nameDrug)}`, { waitUntil: "networkidle0" });
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
                                    let link = 'apteka.ru' + div.querySelector('a').getAttribute('href');
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
                        for (var k = 0; k < dataAptekaRU[0].length; k++) {
                            var id_apt = "aptekaru" + k;
                            await DrugsModel.create({
                                name_drug: drugName,
                                city: "Владивосток",
                                id_apteka: id_apt,
                                name_apteka: "АптекаРУ",
                                name: dataAptekaRU[0][k].name,
                                image: dataAptekaRU[0][k].image,
                                link: dataAptekaRU[0][k].link,
                                cost: dataAptekaRU[0][k].cost
                            });
                        }
                        resolve();
                    })();
                })

                const p3 = new Promise(function(resolve, reject) { //Аптека Овита владивосток сайт ovita.ru
                    (async function() {
                        dataZhivika = [];
                        const browser = await puppeteer.launch({ headless: false });
                        const page = await browser.newPage();
                        await page.setDefaultNavigationTimeout(0)
                        await page.goto(`https://ovita.ru/search/?word=${encodeURIComponent(req.body.nameDrug)}`);

                        try {
                            await page.waitForSelector('div.product');
                            await page.setViewport({
                                width: 1200,
                                height: 800
                            })
                        } catch (e) {
                            console.log("Oshibka")
                        }
                        let html = await page.evaluate(async() => {
                            let pagee = []
                            let divs = document.querySelectorAll('div.product');
                            divs.forEach(div => {
                                let a = div.querySelector('a');
                                let span = div.querySelector('span.rub');
                                if (span != null) {
                                    cost = span.innerText;
                                    cost = cost.replace(/\s+/g, '');
                                    cost = cost.replace("₽", '');
                                    cost = cost.replace("от", '');
                                    let image;
                                    try {
                                        image = div.querySelector('img').getAttribute('src');
                                        image = "https://ovita.ru" + image;
                                    } catch {
                                        image = "https://ugolshop.ru/image/cache/placeholder-800x800.png";
                                    }
                                    let link = "https://ovita.ru" + div.querySelector('a').getAttribute('href');
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
                        }, { waitUntil: 'div.product' })
                        await dataZhivika.push(html);
                        console.log("Овита");
                        console.log(dataZhivika);
                        browser.close();
                        dataZhivika[0].sort(function(a, b) {
                            return a.cost - b.cost;
                        })
                        for (var k = 0; k < dataZhivika[0].length; k++) {
                            var id_apt = "zhivika" + k;
                            await DrugsModel.create({
                                name_drug: drugName,
                                city: "Владивосток",
                                id_apteka: id_apt,
                                name_apteka: "Овита",
                                name: dataZhivika[0][k].name,
                                image: dataZhivika[0][k].image,
                                link: dataZhivika[0][k].link,
                                cost: dataZhivika[0][k].cost
                            });
                        }
                        resolve();
                    })();
                })

                const p4 = new Promise(function(resolve, reject) { //аптека аптекаб
                    (async function() {
                        dataAptekaOtSklada = [];
                        const browser = await puppeteer.launch({ headless: true });
                        const page = await browser.newPage();
                        await page.setDefaultNavigationTimeout(0)
                        await page.goto("https://aptekab.ru/vladivostok")
                        await page.goto(`https://aptekab.ru/?s=${encodeURIComponent(req.body.nameDrug)}`);

                        try {
                            await page.waitForSelector('div.search__item');
                            await page.setViewport({
                                width: 1200,
                                height: 800
                            })
                        } catch (e) {
                            console.log("Oshibka")
                        }
                        let html = await page.evaluate(async() => {
                            let pagee = []
                            let divs = document.querySelectorAll('div.search__item');
                            divs.forEach(div => {
                                let a = div.querySelector('div.search__item--text--inner');
                                let span = div.querySelector('div.search__price');
                                if (span != null) {
                                    cost = span.innerText;
                                    cost = cost.replace(/\s+/g, '');
                                    cost = cost.replace("руб", '');
                                    cost = cost.replace("от", '');
                                    let image;
                                    try {
                                        image = div.querySelector('img.search__item--img').getAttribute('src');
                                        image = "https://aptekab.ru" + image;
                                    } catch {
                                        image = "https://ugolshop.ru/image/cache/placeholder-800x800.png";
                                    }
                                    let link = div.querySelector('a.search__item--text--title').getAttribute('href');
                                    let obj = {
                                        name: a.querySelector('a').innerText,
                                        cost: parseInt(cost),
                                        image: image,
                                        link: link
                                    }
                                    pagee.push(obj);
                                }
                            })
                            return pagee;
                        }, { waitUntil: 'div.search__item' })
                        await dataAptekaOtSklada.push(html);
                        console.log("Aptekab");
                        console.log(dataAptekaOtSklada);
                        browser.close();
                        dataAptekaOtSklada[0].sort(function(a, b) {
                            return a.cost - b.cost;
                        })
                        for (var k = 0; k < dataAptekaOtSklada[0].length; k++) {
                            var id_apt = "aptotsklada" + k;
                            await DrugsModel.create({
                                name_drug: drugName,
                                city: "Владивосток",
                                id_apteka: id_apt,
                                name_apteka: "АптекаАБ",
                                name: dataAptekaOtSklada[0][k].name,
                                image: dataAptekaOtSklada[0][k].image,
                                link: dataAptekaOtSklada[0][k].link,
                                cost: dataAptekaOtSklada[0][k].cost
                            });
                        }
                        resolve();
                    })();
                })

                const p5 = new Promise(function(resolve, reject) { //Аптека WER владивосток сайт: wer.ru
                    (async function() {
                        dataEapteka = [];
                        const browser = await puppeteer.launch({ headless: false });
                        const page = await browser.newPage();
                        await page.setDefaultNavigationTimeout(0)
                        await page.goto("https://wer.ru/vladivostok")
                        await page.goto(`https://wer.ru/search/?q=${encodeURIComponent(req.body.nameDrug)}`);

                        await page.waitForSelector('div.prod');
                        await page.setViewport({
                            width: 1200,
                            height: 800
                        })
                        let html = await page.evaluate(async() => {
                            let pagee = []
                            let divs = document.querySelectorAll('div.prod');
                            divs.forEach(div => {
                                let a = div.querySelector('span.product_title');
                                let a2 = div.querySelector('span.description');
                                let span = div.querySelector('div.price');
                                if (span != null) {
                                    cost = span.querySelector('span').innerText;
                                    cost = cost.replace(/\s+/g, '');
                                    cost = cost.replace("₽", '');
                                    cost = cost.replace("от", '');
                                    let image;
                                    try {
                                        image = div.querySelector('img').getAttribute('src');
                                        image = "https://wer.ru" + image;
                                    } catch {
                                        image = "https://ugolshop.ru/image/cache/placeholder-800x800.png";
                                    }
                                    let link = "https://wer.ru" + div.querySelector('a').getAttribute('href');

                                    let obj = {
                                        name: a.innerText + a2.innerText,
                                        cost: parseInt(cost),
                                        image: image,
                                        link: link
                                    }
                                    pagee.push(obj);
                                }
                            })
                            return pagee;
                        }, { waitUntil: 'div.prod' })
                        await dataEapteka.push(html);
                        console.log("WER");
                        dataEapteka[0].sort(function(a, b) {
                            return a.cost - b.cost;
                        });
                        for (var k = 0; k < dataEapteka[0].length; k++) {
                            var id_apt = "eapteka" + k;
                            await DrugsModel.create({
                                name_drug: drugName,
                                city: "Владивосток",
                                id_apteka: id_apt,
                                name_apteka: "WER",
                                name: dataEapteka[0][k].name,
                                image: dataEapteka[0][k].image,
                                link: dataEapteka[0][k].link,
                                cost: dataEapteka[0][k].cost
                            });
                        }
                        browser.close();
                        console.log(dataEapteka);
                        resolve();
                    })();
                })

                const p6 = new Promise(function(resolve, reject) { //Аптека здравсити Владивосток сайт: zdravcity.ru/r_irk
                    (async function() {
                        dataZdravcity = [];
                        const browser = await puppeteer.launch({ headless: true });
                        const page = await browser.newPage();
                        await page.setDefaultNavigationTimeout(0)
                        await page.goto(`https://zdravcity.ru/search/r_vl/?what=${encodeURIComponent(req.body.nameDrug)}`, { waitUntil: "networkidle0" });

                        //await page.waitForSelector('div.b-product-item-new__wrapper');
                        await page.setViewport({
                            width: 1200,
                            height: 800
                        })
                        let html = await page.evaluate(async() => {
                            let pagee = []
                            let divs = document.querySelectorAll('div.sc-79845b11-2');
                            divs.forEach(div => {
                                let a = div.querySelector('a.sc-79845b11-6');
                                let span = div.querySelector('div.Price_price__qHqZv');
                                if (span != null) {
                                    cost = span.innerText;
                                    cost = cost.replace(/\s+/g, '');
                                    let image;
                                    try {
                                        image = div.querySelector('img').getAttribute('src');
                                    } catch {
                                        image = "https://ugolshop.ru/image/cache/placeholder-800x800.png";
                                    }
                                    let obj = {
                                        name: a.getAttribute('title'),
                                        cost: parseInt(cost),
                                        image: image,
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
                        for (var k = 0; k < dataZdravcity[0].length; k++) {
                            var id_apt = "zdravcity" + k;
                            await DrugsModel.create({
                                name_drug: drugName,
                                city: "Владивосток",
                                id_apteka: id_apt,
                                name_apteka: "Здравсити",
                                name: dataZdravcity[0][k].name,
                                image: dataZdravcity[0][k].image,
                                link: dataZdravcity[0][k].link,
                                cost: dataZdravcity[0][k].cost
                            });
                        }
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
                    res.send(data);
                })
            }
        }
        /*async search(req, res) {
            const drugName = req.body.nameDrug;
            console.log("functrion searcg");
            const promise = new Promise(function(resolve, reject) {
                const data = await krasnoyarskService.search(drugName);
                resolve(data);
            })
            promise.then((data) => {
                res.send(data);
            })
        }*/
}

module.exports = new searchController();
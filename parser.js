const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const hostname = '127.0.0.1';
const port = 9090;

const puppeteer = require('puppeteer');
var request = require('request');
const bodypars = bodyParser.urlencoded({ extended: false });

/*Парсим русский язык var URL = `https://apteka.ru/search/?q=${encodeURIComponent('лизобакт')}`;
var URL = `https://apteka.ru/search/?q=${encodeURIComponent('доктор%20мом')}`;
request(URL, function (err, res, body) {
    if (err) throw err;
    console.log(body);
    console.log(res.statusCode);
});*/

/* Парсинг здравсити(переделать на пупитере)const parse = async() => {
    const getHTML = async(link) => {
        const {data} = await axios.get(link);
        return cheerio.load(data);
    };
    //Рабочая версия для парса названия и стоимости с здравсити (начальная версия)
    const $ = await getHTML(`https://zdravcity.ru/search/?order=Y&what==${encodeURIComponent('лизобакт')}`);
    const nameZdrav = $('a.b-product-item-new__title').text();
    const costZdrav = $('div.b-product-item-new__price').text();
    console.log(nameZdrav);
    console.log(costZdrav);
};

parse(); */

//Здравсити (название+цена) 
/*(async function() {
    let res = [];
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0)
    await page.goto(`https://zdravcity.ru/search/r_krasnoyarsk/?what=${encodeURIComponent('лизобакт')}`, { waitUntil: "networkidle0" });

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
    await res.push(html);
    console.log("Здравсити");
    console.log(res);
    res[0].sort(function(a, b) {
        return a.cost - b.cost;
    });
    browser.close();
})(); */

// Живика (название + цена) выполнено (почему-то если много товаров, не будет картинок)
/*(async function() {
    let res = [];
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0)
    await page.goto(`https://krasnoyarsk.aptekazhivika.ru/search/${encodeURIComponent('панавир')}`);

    await page.waitForSelector('.product');
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
            }
            let obj = {
                name: a.innerText,
                cost: parseInt(cost),
                image: div.querySelector('img.product__img').getAttribute('src'),
                link: "https://krasnoyarsk.aptekazhivika.ru" + div.querySelector('a.product__title').getAttribute('href')
            }
            pagee.push(obj);
        })
        return pagee;
    }, { waitUntil: 'div.product__add-prod' })
    await res.push(html);
    console.log("Живика");

    res[0].sort(function(a, b) {
        return a.cost - b.cost;
    });
    console.log(res[0]);
    browser.close();
})();*/

//Аптека от склада (название + цена) выполнено
/*(async function() {
    let res = [];
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0)
    await page.goto(`https://apteka-ot-sklada.ru/krasnoyarsk/catalog?q=${encodeURIComponent('лизобакт')}`);

    await page.waitForSelector('.ui-card__footer');
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
    await res.push(html);
    console.log("Аптека-от-склада");
    console.log(res);
    res[0].sort(function(a, b) {
        return a.cost - b.cost;
    });
    browser.close();
})(); */

//Аптека.ру (название+цена) выполнено
/*(async function() {
    let res = [];
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0)
    await page.goto(`https://apteka.ru/krasnoyarsk/search/?q=${encodeURIComponent('доктор мом')}`);

    try {
        await page.waitForSelector('.card-order-section');
        await page.setViewport({
            width: 1200,
            height: 800
        })
    } catch (e) {
        console.log("Oshibka")
    }
    let html = await page.evaluate(async() => {
        let pagee = []
        let divs = document.querySelectorAll('div.catalog-card');
        console.log(divs)
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

    await res.push(html);
    console.log("Аптека.ру");
    console.log(res[0]);
    res[0].sort(function(a, b) {
        return a.cost - b.cost;
    });
    //browser.close();
})(); */

//Eapteka (название + цена)
/*(async function (){
    let res = [];
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0)
    await page.goto(`https://eapteka.ru/krasnoyarsk/search/?q=${encodeURIComponent('панавир')}`);

    await page.waitForSelector('.price--new');
    await page.setViewport({
        width: 1200,
        height: 800
    })
    let html = await page.evaluate(async () => {
        let pagee = []
        let divs = document.querySelectorAll('section.cc-item');
        divs.forEach(div =>{
            let a = div.querySelector('a.cc-item--title');
            let span = div.querySelector('span.price--num');
            if(span != null){
                cost = span.innerText;
                cost = cost.replace(/\s+/g,'');
            let obj = {
                test: a.innerText,
                cost: parseInt(cost),
                image: div.querySelector('img').getAttribute('src'),
                link: "https://eapteka.ru"+div.querySelector('a.cc-item--title').getAttribute('href')
            }
            pagee.push(obj);
        }
        })
        return pagee;
    }, {waitUntil: 'div.price--new'})
    await res.push(html);
    console.log("Eapteka");
    res[0].sort(function(a,b){
        return a.cost - b.cost;
    });
    console.log(res);
    browser.close();
})();*/

//Нейрон (название+цена) выполнено
/*(async function (){
    let res = [];
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0)
    await page.goto(`https://аптеканейрон.рф/search/?name=${encodeURIComponent('йцу')}`,{waitUntil: 'networkidle0'});


    //await page.waitForSelector('.vitrina_item');
    await page.setViewport({
        width: 1200,
        height: 800
    })
    let html = await page.evaluate(async () => {
        let pagee = []
        let divs = document.querySelectorAll('div.vitrina_item');
        let numb = 0;
        divs.forEach(div =>{
            
            let a = div.querySelector('p.h3');
            let span = div.querySelector('strong');
            if(span != null){
            cost = span.innerText;
            cost = cost.replace(/\s+/g,'');
            let img = div.querySelector('img');
            if(numb == 0){
                img = img.getAttribute('src');
            } else {
                img = img.getAttribute('realsrc');
            }
            console.log(img);
            let link = div.querySelector('a.ajax').getAttribute('href')
            numb++;
                let obj = {
                test: a.innerText,
                cost: parseFloat(cost),
                image: img,
                link: link
            }
            pagee.push(obj);
        }
        })
        return pagee;
    }, {waitUntil: 'div.vitrina_item'})
    await res.push(html);
    console.log("Нейрон");
    console.log(res[0]);
    //browser.close();
    console.log("Сортировка");
    res[0].sort((a,b)=>
    {
        return a.cost - b.cost;
    });
    console.log(res[0]);
})(); */

//Аптеки плюс не работают (?)
/*(async function (){
    let res = [];
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto(`https://aptekiplus.ru/search/Москва/${encodeURIComponent('лизобакт')}`);

    await page.waitForSelector('.search-tovar-wrap');
    await page.setViewport({
        width: 1200,
        height: 800
    })
    let html = await page.evaluate(async () => {
        let pagee = []
        let divs = document.querySelectorAll('li');
        divs.forEach(div =>{
            let a = div.querySelector('a');
            let span = div.querySelector('div.active-price');
            if(span != null){
            let obj = {
                test: a.getAttribute('title'),
                cost: span.innerText
            }
            pagee.push(obj);
        }
        })
        return pagee;
    }, {waitUntil: 'div.search-tovar-wrap'})
    await res.push(html);
    console.log(res);
})();*/

//Мегаптека
/*(async function() {
    let res = [];
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0)
    await page.goto('https://megapteka.ru/perm')
    await page.goto(`https://megapteka.ru/search?q=${encodeURIComponent('доктор мом')}`);

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
        console.log(divs)
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
    }, { waitUntil: 'div.card-item-wrap' })

    await res.push(html);
    console.log("Мегаптека");
    console.log(res[0]);
    res[0].sort(function(a, b) {
        return a.cost - b.cost;
    });
    //browser.close();
})();*/


//Фармпермь
/*(async function() {
    let res = [];
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0)
    await page.goto(`https://pharmperm.ru/catalog/?keyword=${encodeURIComponent('доктор мом')}`);

    try {
        await page.waitForSelector('div.catalog-items');
        await page.setViewport({
            width: 1200,
            height: 800
        })
    } catch (e) {
        console.log("Oshibka")
    }
    let html = await page.evaluate(async() => {
        let pagee = []
        let divs = document.querySelectorAll('div.offer-item-grid');
        console.log(divs)
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

    await res.push(html);
    console.log("пермфармация");
    console.log(res[0]);
    res[0].sort(function(a, b) {
        return a.cost - b.cost;
    });
    //browser.close();
})(); */

//Фармленд
/*(async function() {
    let res = [];
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0)
    await page.goto(`https://farmlend.ru/kazan/search?keyword=${encodeURIComponent('доктор мом')}`);

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
        console.log(divs)
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
                    image = "farmlend.ru" + image;
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

    await res.push(html);
    console.log("фармленд");
    console.log(res[0]);
    res[0].sort(function(a, b) {
        return a.cost - b.cost;
    });
    //browser.close();
})();*/

//Бережная аптека
/*(async function() {
    let res = [];
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0)
    await page.goto("https://b-apteka.ru/kazan")
    await page.goto(`https://b-apteka.ru/search?q=${encodeURIComponent('доктор мом')}`);

    try {
        await page.waitForSelector('div.search-card__container');
        await page.setViewport({
            width: 1200,
            height: 800
        })
    } catch (e) {
        console.log("Oshibka")
    }
    let html = await page.evaluate(async() => {
        let pagee = []
        let divs = document.querySelectorAll('div.search-card__container');
        console.log(divs)
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
                    image = "b-apteka.ru" + image;
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

    await res.push(html);
    console.log("бережная аптека");
    console.log(res[0]);
    res[0].sort(function(a, b) {
        return a.cost - b.cost;
    });
    //browser.close();
})();*/

//Ovita
/*(async function() {
    let res = [];
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0)
    await page.goto(`https://ovita.ru/search/?word=${encodeURIComponent('доктор мом')}`);

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
        console.log(divs)
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

    await res.push(html);
    console.log("Ovita");
    console.log(res[0]);
    res[0].sort(function(a, b) {
        return a.cost - b.cost;
    });
    //browser.close();
})();*/

//Wer
/*(async function() {
    let res = [];
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0)
    await page.goto("https://wer.ru/vladivostok")
    await page.goto(`https://wer.ru/search/?q=${encodeURIComponent('доктор мом')}`);

    try {
        await page.waitForSelector('div.prod');
        await page.setViewport({
            width: 1200,
            height: 800
        })
    } catch (e) {
        console.log("Oshibka")
    }
    let html = await page.evaluate(async() => {
        let pagee = []
        let divs = document.querySelectorAll('div.prod');
        console.log(divs)
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

    await res.push(html);
    console.log("WER");
    console.log(res[0]);
    res[0].sort(function(a, b) {
        return a.cost - b.cost;
    });
    //browser.close();
})();*/

//Aptekab
(async function() {
    let res = [];
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0)
    await page.goto("https://aptekab.ru/vladivostok")
    await page.goto(`https://aptekab.ru/?s=${encodeURIComponent('доктор мом')}`);

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
        console.log(divs)
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

    await res.push(html);
    console.log("Aptekab");
    console.log(res[0]);
    res[0].sort(function(a, b) {
        return a.cost - b.cost;
    });
    //browser.close();
})();

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

app.get("/", (req, res) => {
    request.post("http://127.0.0.1:8000/start.html")
})
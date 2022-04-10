let express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
let fs = require('fs');
const { default: mongoose } = require('mongoose');
const puppeteer = require('puppeteer');
const authRouter = require('./routers/authRouter');
const errorMiddleware = require('./middleware/authMiddleware');
const searchRouter = require('./routers/searchRouter');

let port = 8000;
let hostname = "127.0.0.1"

let app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: '*'
}));

app.post("/");

app.use("/auth", authRouter);
app.use("/search", searchRouter);
app.use(errorMiddleware);

/*app.get("/search", function(req,res){
    console.log(req.body.nameDrug);
    let obj, dataNeyron, dataAptekaRU;
    const p1 = new Promise(function(resolve,reject){
        (async function (){
            dataNeyron = [];
            const browser = await puppeteer.launch({headless: false});
            const page = await browser.newPage();
            await page.setDefaultNavigationTimeout(0)
            await page.goto(`https://аптеканейрон.рф/search/?name=${encodeURIComponent(req.body.nameDrug)}`,{waitUntil: "networkidle0"});
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
            }, {waitUntil: 'div.vitrina_item'})
            await dataNeyron.push(html);
            console.log("Нейрон");
            console.log(dataNeyron[0]);
            browser.close();
            dataNeyron[0].sort(function(a,b){
                return a.cost - b.cost;
            });
            resolve();
        })();
        
    })

    const p2 = new Promise(function(resolve,reject){
        (async function (){
            dataAptekaRU = [];
            const browser = await puppeteer.launch({headless: false});
            const page = await browser.newPage();
            await page.setDefaultNavigationTimeout(0)
            await page.goto(`https://apteka.ru/krasnoyarsk/search/?q=${encodeURIComponent(req.body.nameDrug)}`,{waitUntil:"networkidle0"});
            //await page.waitForSelector('.card-order-section');
            await page.setViewport({
                width: 1200,
                height: 800
            })
            let html = await page.evaluate(async () => {
                let pagee = []
                let divs = document.querySelectorAll('div.catalog-card');
                divs.forEach(div =>{
                    let a = div.querySelector('span.catalog-card__name');
                    let span = div.querySelector('span.moneyprice__content');
                    if(span != null){
                    cost = span.innerText;
                    cost = cost.replace(/\s+/g,'');
                    let link = 'apteka.ru'+div.querySelector('a.catalog-card__link').getAttribute('href');
                    let obj = {
                        name: a.innerText,
                        cost: parseInt(cost),
                        image: div.querySelector('img').getAttribute('src'),
                        link: link
                    }
                    pagee.push(obj);
                }
                })
                return pagee;
            }, {waitUntil: 'div.card-order-section'})
            await dataAptekaRU.push(html);
            console.log("Аптека.ру");
            console.log(dataAptekaRU);
            browser.close();
            dataAptekaRU[0].sort(function(a,b){
                return a.cost - b.cost;
            })
            resolve();
        })(); 
    })
    Promise.all([p1,p2]).then(()=>
    {
        let data = {Neyron: dataNeyron,
                    AptekaRU: dataAptekaRU};
        res.send(data);
    })
}) */

async function start(){
    try{
        await mongoose.connect('mongodb+srv://payfox:spiderman2329@cluster0.hbmhf.mongodb.net/mydb',{
            useNewUrlParser: true,
        })
        app.listen(port,hostname, () => {
            console.log(`Сервер запущен: http://${hostname}:${port}/`);
        })
    } catch(e){
        console.log(e);
    }
}

start();

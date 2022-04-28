const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const requesting = require('request');
const cookieParser = require('cookie-parser');
const hostname = '127.0.0.1';
const port = 9000;
var isLogged = false;
var city = 0;
var aptekas = {
    "apteka1": {
        "name": "Нейрон",
        "url": "https://аптеканейрон.рф/search/?name=<%=nameDrug %>",
        "image": "https://xn--80aaobudwcidrr.xn--p1ai/sites/neuron/images/logo.png",
        "url_s": "https://аптеканейрон.рф/"
    },
    "apteka2": {
        "name": "АптекаРУ",
        "url": "https://apteka.ru/krasnoyarsk/search/?q=<%=nameDrug %> ",
        "image": "https://gastrarex.ru/assets/images/pharmacies/pharmacy_aptecaru.png",
        "url_s": "https://apteka.ru/krasnoyarsk/"
    },
    "apteka3": {
        "name": "Живика",
        "url": "https://krasnoyarsk.aptekazhivika.ru/search/<%=nameDrug %> ",
        "image": "https://vev.ru/wp-content/uploads/2021/11/EGR8OU9XkAAl5q6.jpg",
        "url_s": "https://krasnoyarsk.aptekazhivika.ru"
    },
    "apteka4": {
        "name": "Аптека-от-склада",
        "url": "https://apteka-ot-sklada.ru/krasnoyarsk/catalog?q=<%=nameDrug %> ",
        "image": "https://visitnoyabrsk.ru/wp-content/uploads/2020/08/f210d24906f67859a8cd9fadbef1d3a9-e1597054478708.jpeg",
        "url_s": "https://apteka-ot-sklada.ru/krasnoyarsk"
    },
    "apteka5": {
        "name": "Eapteka",
        "url": "https://eapteka.ru/krasnoyarsk/search/?q=<%=nameDrug %> ",
        "image": "https://telegra.ph/file/32b9185e4d0b5215249b5.jpg",
        "url_s": "https://www.eapteka.ru/krasnoyarsk/"
    },
    "apteka6": {
        "name": "Здравсити",
        "url": "https://zdravcity.ru/search/r_krasnoyarsk/?what=<%=nameDrug %> ",
        "image": "https://avatars.mds.yandex.net/i?id=502ba7086efe2ee71fd4a5af7d65f23d-5888920-images-thumbs&n=13",
        "url_s": "https://zdravcity.ru/r_krasnoyarsk/"
    },
}
const cities = {
    krasnoyarsk: "Красноярск",
    bratsk: "Братск",
    kazan: "Казань",
    perm: "Пермь",
    vladivostok: "Владивосток"
}

function cookieParsers(cookieString) {
    if (cookieString === "")
        return {};
    let pairs = cookieString.split(";");

    let splittedPairs = pairs.map(cookie => cookie.split("="));
    const cookieObj = splittedPairs.reduce(function(obj, cookie) {

        obj[decodeURIComponent(cookie[0].trim())] = decodeURIComponent(cookie[1].trim());

        return obj;
    }, {})

    return cookieObj;
}

const bodypars = bodyParser.urlencoded({ extended: false });
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

app.use(cookieParser());

app.get("/about", (req, res) => {
    res.render("about.ejs", { isLogged: isLogged });
})

app.get("/registration", (req, res) => {
    const cookieHeader = req.headers.cookie;
    let cookieObj = cookieParsers(cookieHeader);
    const refreshTokenBuf = cookieObj['refreshToken'];
    if (!refreshTokenBuf) {
        res.render("registration.ejs");
    } else {
        res.redirect("profile");
    }
})

app.get("/login", (req, res) => {
    const cookieHeader = req.headers.cookie;
    let cookieObj = cookieParsers(cookieHeader);
    const refreshTokenBuf = cookieObj['refreshToken'];
    if (!refreshTokenBuf) {
        res.render("login.ejs");
    } else {
        res.redirect("profile");
    }
})

app.get("/profile", bodypars, (req, res) => {
    const cookieHeader = req.headers.cookie;
    let cookieObj = cookieParsers(cookieHeader);
    const refreshTokenBuf = "refreshToken=" + cookieObj['refreshToken'];
    requesting.post("http://127.0.0.1:8000/auth/profile", { form: { name: refreshTokenBuf } }, function(err, resp, body) {
        if (resp.statusCode == 200) {
            var data = JSON.parse(body);
            console.log(data[0].name);
            res.render("profile.ejs", { name: data[0].name })
        } else {
            res.send("error");
        }
    })
})

app.get("/logout", bodypars, (req, res) => {
    const cookieHeader = req.headers.cookie;
    let cookieObj = cookieParsers(cookieHeader);
    const refreshTokenBuf = "refreshToken=" + cookieObj['refreshToken'];
    requesting.post("http://127.0.0.1:8000/auth/logout", { form: { name: refreshTokenBuf } }, function(err, resp, body) {
        if (resp.statusCode == 200) {
            res.clearCookie("refreshToken");
            isLogged = false;
            res.redirect("/");
        } else {
            res.send("error");
        }
    })
})

app.post("/auth/registration", bodypars, (req, res) => {
    requesting.post("http://127.0.0.1:8000/auth/registration", { form: { name: req.body } }, function(err, resp, body) {
        if (resp.statusCode == 200) {
            isLogged = true;
            res.redirect("/about");
        } else {
            res.send("error");
        }
    })
})

app.post("/auth/login", bodypars, (req, res) => {
    requesting.post("http://127.0.0.1:8000/auth/login", { form: { name: req.body } }, function(err, resp, body) {
        if (resp.statusCode == 200) {
            var data = JSON.parse(body);
            console.log(data);
            isLogged = true;
            //localStorage.setItem('token',data.accessToken);
            res.cookie('refreshToken', data.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            console.log(data.name);
            res.render("profile.ejs", { name: data.name });
        } else {
            res.send("error");
        }
    })
})

app.get("/search", bodypars, function(req, res) {
    console.log(req.query.nameDrug);
    var nameDrug = req.query.nameDrug;
    requesting.get(`http://127.0.0.1:8000/search/${Object.keys(cities)[city]}`, { form: { nameDrug: req.query.nameDrug } }, function(err, resp, body) {
            if (resp.statusCode == 200) {
                var data = JSON.parse(body);
                res.render('search', {
                    isLogged: isLogged,
                    dataNeyron: data.Neyron[0],
                    nameDrug: nameDrug,
                    dataAptekaRU: data.AptekaRU[0],
                    dataZhivika: data.Zhivika[0],
                    dataAptekaOtSklada: data.AptekaOtSklada[0],
                    dataEapteka: data.Eapteka[0],
                    dataZdravcity: data.Zdravcity[0],
                    aptekas: aptekas
                });
            } else {
                res.send("Error");
            }
        })
        //res.render("search");
})

app.get("/krasnoyarsk", (req, res) => {
    city = 0;
    res.cookie('city', city, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
    aptekas = {
        "apteka1": {
            "name": "Нейрон",
            "url": "https://аптеканейрон.рф/search/?name=<%=nameDrug %>",
            "image": "https://xn--80aaobudwcidrr.xn--p1ai/sites/neuron/images/logo.png",
            "url_s": "https://аптеканейрон.рф/"
        },
        "apteka2": {
            "name": "АптекаРУ",
            "url": "https://apteka.ru/krasnoyarsk/search/?q=<%=nameDrug %> ",
            "image": "https://gastrarex.ru/assets/images/pharmacies/pharmacy_aptecaru.png",
            "url_s": "https://apteka.ru/krasnoyarsk/"
        },
        "apteka3": {
            "name": "Живика",
            "url": "https://krasnoyarsk.aptekazhivika.ru/search/<%=nameDrug %> ",
            "image": "https://vev.ru/wp-content/uploads/2021/11/EGR8OU9XkAAl5q6.jpg",
            "url_s": "https://krasnoyarsk.aptekazhivika.ru"
        },
        "apteka4": {
            "name": "Аптека-от-склада",
            "url": "https://apteka-ot-sklada.ru/krasnoyarsk/catalog?q=<%=nameDrug %> ",
            "image": "https://visitnoyabrsk.ru/wp-content/uploads/2020/08/f210d24906f67859a8cd9fadbef1d3a9-e1597054478708.jpeg",
            "url_s": "https://apteka-ot-sklada.ru/krasnoyarsk"
        },
        "apteka5": {
            "name": "Eapteka",
            "url": "https://eapteka.ru/krasnoyarsk/search/?q=<%=nameDrug %> ",
            "image": "https://telegra.ph/file/32b9185e4d0b5215249b5.jpg",
            "url_s": "https://www.eapteka.ru/krasnoyarsk/"
        },
        "apteka6": {
            "name": "Здравсити",
            "url": "https://zdravcity.ru/search/r_krasnoyarsk/?what=<%=nameDrug %> ",
            "image": "https://avatars.mds.yandex.net/i?id=502ba7086efe2ee71fd4a5af7d65f23d-5888920-images-thumbs&n=13",
            "url_s": "https://zdravcity.ru/r_krasnoyarsk/"
        },
    }
    res.redirect("/");
})

app.get("/bratsk", (req, res) => {
    city = 1;
    res.cookie('city', city, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
    aptekas = {
        "apteka1": {
            "name": "Асна",
            "url": "https://bratsk.asna.ru/search/?query=<%=nameDrug %>",
            "image": "https://dis-group.ru/dis02/assets/uploads/2019/06/ASNA-1080x720.jpg",
            "url_s": "https://bratsk.asna.ru"
        },
        "apteka2": {
            "name": "АптекаРУ",
            "url": "https://apteka.ru/bratsk/search/?q=<%=nameDrug %> ",
            "image": "https://gastrarex.ru/assets/images/pharmacies/pharmacy_aptecaru.png",
            "url_s": "https://apteka.ru/bratsk/"
        },
        "apteka3": {
            "name": "Живика",
            "url": "https://krasnoyarsk.aptekazhivika.ru/search/<%=nameDrug %> ",
            "image": "https://vev.ru/wp-content/uploads/2021/11/EGR8OU9XkAAl5q6.jpg",
            "url_s": "https://krasnoyarsk.aptekazhivika.ru"
        },
        "apteka4": {
            "name": "Аптека-от-склада",
            "url": "https://apteka-ot-sklada.ru/bratsk/catalog?q=<%=nameDrug %> ",
            "image": "https://visitnoyabrsk.ru/wp-content/uploads/2020/08/f210d24906f67859a8cd9fadbef1d3a9-e1597054478708.jpeg",
            "url_s": "https://apteka-ot-sklada.ru/bratsk"
        },
        "apteka5": {
            "name": "Eapteka",
            "url": "https://eapteka.ru/krasnoyarsk/search/?q=<%=nameDrug %> ",
            "image": "https://telegra.ph/file/32b9185e4d0b5215249b5.jpg",
            "url_s": "https://www.eapteka.ru/krasnoyarsk/"
        },
        "apteka6": {
            "name": "Здравсити",
            "url": "https://zdravcity.ru/search/r_irk/?what=<%=nameDrug %> ",
            "image": "https://avatars.mds.yandex.net/i?id=502ba7086efe2ee71fd4a5af7d65f23d-5888920-images-thumbs&n=13",
            "url_s": "https://zdravcity.ru/r_irk/"
        },
    }
    res.redirect("/");
})

app.get("/kazan", (req, res) => {
    city = 2;
    res.cookie('city', city, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
    res.redirect("/");
})

app.get("/perm", (req, res) => {
    city = 3;
    res.cookie('city', city, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
    res.redirect("/");
})

app.get("/vladivostok", (req, res) => {
    city = 4;
    res.cookie('city', city, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
    res.redirect("/");
})

app.use("/", (req, res) => {

    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
        let cookieObj = cookieParsers(cookieHeader);


        const cityBuf = cookieObj['city'];
        console.log(cityBuf);
        if (cityBuf) {
            city = cityBuf;
        } else {
            city = 0;
        }
        const refreshTokenBuf = cookieObj['refreshToken'];
        if (refreshTokenBuf) {
            isLogged = true;
        } else {
            isLogged = false;
        }
        console.log(isLogged);
    } else {
        city = 0;
        isLogged = false;
    }

    res.render("start", { isLogged: isLogged, city: Object.values(cities)[city], aptekas: aptekas });
})

//Object.keys(cities)[1] //Возьмет ключ

function start() {
    try {
        app.listen(port, hostname, () => {
            console.log(`Server running at http://${hostname}:${port}/`);
        });
    } catch (e) {
        console.log(e);
    }
}

start();
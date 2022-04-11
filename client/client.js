const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const requesting = require('request');
const cookieParser = require('cookie-parser');
const hostname = '127.0.0.1';
const port = 9000;
var isLogged = false;
var city = 0;
const cities = {
    krasnoyarsk: "Красноярск",
    bratsk: "Братск",
    kazan: "Казань",
    perm: "Пермь"
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
    requesting.get("http://127.0.0.1:8000/search", { form: { nameDrug: req.query.nameDrug } }, function(err, resp, body) {
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
                    dataZdravcity: data.Zdravcity[0]
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
    res.redirect("/");
})

app.get("/bratsk", (req, res) => {
    city = 1;
    res.cookie('city', city, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
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

    res.render("start", { isLogged: isLogged, city: Object.values(cities)[city] });
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
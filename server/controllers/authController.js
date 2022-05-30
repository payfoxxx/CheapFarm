const User = require('../models/User');
const tokenModel = require('../models/Tokens');
const favouriteModel = require('../models/Favourite');
const drugsModel = require('../models/Drugs');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const userService = require('../service/user-service');
const ApiError = require('../exceptions/errors');


class authController {
    async registration(req, res, next) {
        console.log(req.body.name);
        try {
            const errors = validationResult(req.body.name);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка данных', errors.array()));
            }
            const { name, username, email, password } = req.body.name; //Вроде должно быть req.body.name (когда с клиентом)
            const userData = await userService.registration(name, username, email, password);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            console.log(req.body.name);
            const { username, password } = req.body.name; //Вроде должно быть req.body.name (когда с клиентом)
            const userData = await userService.login(username, password);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async profile(req, res, next) {
        const userbytoken = await tokenModel.find({ refreshToken: req.body.name });
        const user = await User.find({ _id: userbytoken[0].user });
        console.log("user", userbytoken);

        const fav = await favouriteModel.find({ user: user[0]._id });
        console.log(fav.length);
        var drugs = [];
        if (fav.length > 0) {
            for (var i = 0; i < fav.length; i++) {
                var drug_buf = await drugsModel.find({ _id: fav[i].drug });
                drugs.push(drug_buf);
            }
        }
        console.log(drugs);
        const data = {
            nameUser: user[0].name,
            drugs: drugs
        }
        return res.json(data);

    }

    async logout(req, res, next) {
        try {
            console.log(req.body.name);
            const authorizationHeader = req.body.name;
            const refreshToken = authorizationHeader.split('=')[1];
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch (e) {
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new authController();
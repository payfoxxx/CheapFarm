const User = require('../models/User');
const tokenModel = require('../models/Tokens');
const bcrypt = require('bcryptjs');
const {validationResult} = require('express-validator');
const userService = require('../service/user-service');
const ApiError = require('../exceptions/errors');


class authController {
    async registration(req, res, next){
        console.log(req.body.name);
        try{
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return next(ApiError.BadRequest('Ошибка данных', errors.array()));
            }
            const {name,username,email,password} = req.body.name; //Вроде должно быть req.body.name (когда с клиентом)
            const userData = await userService.registration(name,username,email,password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true});
            return res.json(userData);
        } catch(e){
            next(e);
        }
    }

    async login(req,res, next){
        try{
            console.log(req.body.name);
            const {username, password} = req.body.name; //Вроде должно быть req.body.name (когда с клиентом)
            const userData = await userService.login(username, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true});
            return res.json(userData);
        } catch(e){
            next(e);
        }
    }

    async profile(req,res, next){
        try{
            const users = await User.find();
            return res.json(users);
        } catch(e){
            next(e);
        }
    }

    async logout(req,res, next){
        try{
            console.log(req.body.name);
            const authorizationHeader = req.body.name;
            const refreshToken = authorizationHeader.split('=')[1];
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch(e){
            next(e);
        }
    }

    async refresh(req,res, next){
        try{
            const {refreshToken} = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly:true});
            return res.json(userData);
        } catch(e){
            next(e);
        }
    }
}

module.exports = new authController();
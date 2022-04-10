const UserModel = require('../models/User');
const bcrypt = require('bcryptjs');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/errors');

class UserService {
    async registration(name,username,email,password){
        const candidate_email = await UserModel.findOne({email});
        if(candidate_email){
            throw ApiError.BadRequest(`Пользователь с email: ${email} уже зарегистрирован`);
        }
        const candidate_log = await UserModel.findOne({username});
        if(candidate_log){
            throw ApiError.BadRequest(`Пользователь с логином: ${username} уже зарегистрирован`);
        }
        const hashPassword = await bcrypt.hash(password, 4);
        const user = await UserModel.create({name,username, email, password: hashPassword});
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto
        }
    }
    async login(username, password){
        const user = await UserModel.findOne({username});
        if(!user){
            throw ApiError.BadRequest('Пользователь с таким логином не найден');
        }
        const isPassEquals = await bcrypt.compare(password, user.password);
        if(!isPassEquals){
            throw ApiError.BadRequest('Неверный пароль');
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return{
            ...tokens,
            user: userDto
        }
    }

    async logout(refreshToken){
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken){
        if(!refreshToken){
            throw ApiError.UnathorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if(!userData || !tokenFromDb){
            throw ApiError.UnathorizedError();
        }
        const user = await UserModel.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {
            ...tokens,
            user: userDto
        }
    }
}

module.exports = new UserService();
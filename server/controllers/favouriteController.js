const Favourite = require('../models/Favourite');
const Token = require('../models/Tokens');

class favouriteController {
    async addFav(req, res) {
        console.log(req.body);
        const user = Token.find({ refreshToken: req.body.token });
        console.log(user); //Почему выводит так
    }

    async getFav(req, res) {

    }

    async deleteFav(req, res) {

    }
}

module.exports = new favouriteController();
const Favourite = require('../models/Favourite');
const UserModel = require('../models/User');
const DrugModel = require('../models/Drugs');
const Token = require('../models/Tokens');

class favouriteController {
    async addFav(req, res) {
        console.log(req.body);
        const user = await Token.find({ refreshToken: req.body.token });
        console.log(user[0].user);
        const drug = await DrugModel.find({ city: req.body.city, id_apteka: req.body.idDrug, name_drug: req.body.drug });
        await Favourite.create({ user: user[0].user, drug: drug[0]._id });
    }

    async getFav(req, res) {

    }

    async deleteFav(req, res) {
        const user = await Token.find({ refreshToken: req.body.token });
        const drug = await DrugModel.find({ city: req.body.city, id_apteka: req.body.idDrug, name: req.body.drug });
        console.log(user[0].user);
        console.log(drug[0]);
        await Favourite.deleteOne({ user: user[0].user, drug: drug[0]._id });
    }
}

module.exports = new favouriteController();
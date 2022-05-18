const { Schema, model } = require('mongoose');

const FavouriteSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    drug: { type: Schema.Types.ObjectId, ref: 'Drugs' }
})

module.exports = model('Favourite', FavouriteSchema);
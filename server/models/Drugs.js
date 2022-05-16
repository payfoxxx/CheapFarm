const { Schema, model } = require('mongoose');

const Drugs = new Schema({
    name_drug: { type: String },
    city: { type: String },
    id_apteka: { type: String },
    name_apteka: { type: String },
    name: { type: String },
    image: { type: String },
    link: { type: String },
    cost: { type: String }
})

module.exports = model('Drugs', Drugs);
const { Schema, model } = require('mongoose');

const Drugs = new Schema({
    city: { type: String },
    id_apteka: { type: String },
    name_apteka: { type: String },
    name_drug: { type: String },
    img_drug: { type: String },
    url_drug: { type: String },
    cost_drug: { type: String }
})

module.exports = model('Drugs', Drugs);
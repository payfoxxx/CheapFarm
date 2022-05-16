module.exports = class DrugsDto {
    name;
    cost;
    image;
    link;

    constructor(model) {
        this.name = model.name;
        this.cost = model.cost;
        this.image = model.image;
        this.link = model.link;
    }
}
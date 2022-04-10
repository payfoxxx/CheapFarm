module.exports = class UserDto{
    id;
    username;
    name;

    constructor(model){
        this.id = model._id;
        this.username = model.username;
        this.name = model.name;
    }
}
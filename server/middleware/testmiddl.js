const ApiError = require('../exceptions/errors');
const tokenService = require('../service/token-service');

module.exports = function(req,res,next){
    try{
        //console.log(req.body.name);
        const authorizationHeader = req.body.name;
        if(!authorizationHeader){
            return next(ApiError.UnathorizedError());
        }
        const accessToken = authorizationHeader.split('=')[1];
        if(!accessToken){
            return next(ApiError.UnathorizedError);
        }
        //const userData = tokenService.validateAccessToken(accessToken);
        const userData = tokenService.validateRefreshToken(accessToken);
        if(!userData){
            return next(ApiError.UnathorizedError);
        }
        req.user = userData;
        next();
    } catch(e){
        return next(ApiError.UnathorizedError());
    }
}
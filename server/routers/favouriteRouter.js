const Router = require('express');
const router = new Router;

const favouriteCtrl = require('../controllers/favouriteController');

router.post('/add', favouriteCtrl.addFav);
router.post('/get', favouriteCtrl.getFav);
router.post('/delete', favouriteCtrl.deleteFav);

module.exports = router;
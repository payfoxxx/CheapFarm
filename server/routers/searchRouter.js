const Router = require('express');
const router = new Router;

const searchCtrl = require('../controllers/searchController');

router.get('/', searchCtrl.search);


module.exports = router;
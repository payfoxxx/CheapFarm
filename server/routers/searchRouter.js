const Router = require('express');
const router = new Router;

const searchCtrl = require('../controllers/searchController');

router.get('/krasnoyarsk', searchCtrl.krasnoyarsk);
router.get('/bratsk', searchCtrl.bratsk);
/*router.get('/kazan', searchCtrl.kazan);
router.get('/perm', searchCtrl.perm);
router.get('/vladivostok', searchCtrl.vladivostok);*/


module.exports = router;
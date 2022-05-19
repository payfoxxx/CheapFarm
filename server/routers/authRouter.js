const Router = require('express');
const router = new Router();
const controller = require('../controllers/authController')
const { check } = require("express-validator");
const authMiddleware = require('../middleware/auth-middleware');
const testmiddl = require('../middleware/testmiddl');

router.post('/registration', [
    check('username', "Логин не может быть пустым").notEmpty(),
    check('name', "Имя не может быть пустым").notEmpty(),
    check('password', "Пароль должен быть от 4 до 18 символов").isLength({ min: 4, max: 18 })
], controller.registration);
router.post('/login', controller.login);
router.post('/profile', controller.profile);
router.post('/logout', controller.logout);
router.post('/refresh', controller.refresh);

module.exports = router;
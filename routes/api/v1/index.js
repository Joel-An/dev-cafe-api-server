const router = require('express').Router();
const userController = require('../../../controllers/user.controller');

router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUserById);

module.exports = router;

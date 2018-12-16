const authRouter = require('express').Router();
const authController = require('../../../../controllers/auth.controller');
/*
 *      /api/v1/auth'
 */
authRouter.post('/', authController.login);

module.exports = authRouter;

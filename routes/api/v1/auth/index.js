const authRouter = require('express').Router();
const auth = require('../../../../controllers/auth');
/*
 *      /api/v1/auth'
 */
authRouter.post('/', auth.login);

module.exports = authRouter;

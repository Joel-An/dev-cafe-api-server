const authRouter = require('express').Router();
const auth = require('../../../../controllers/auth');
/*
 *      /api/v1/auth'
 */
authRouter.post('/', auth.login);
authRouter.delete('/', auth.logout);
authRouter.post('/tester', auth.testerLogin);
authRouter.get('/github', auth.githubLogin);

module.exports = authRouter;

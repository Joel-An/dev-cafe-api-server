const imageRouter = require('express').Router();
const { isAuthenticated } = require('../../../../middleware/authenticator');
const images = require('../../../../controllers/images');

/*
 *      /api/v1/images'
 */

imageRouter.post('/', isAuthenticated, images.postImage);

module.exports = imageRouter;

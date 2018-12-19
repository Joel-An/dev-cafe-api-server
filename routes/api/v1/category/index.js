const categoryRouter = require('express').Router();
const category = require('../../../../controllers/categories');

/*
 *      /api/v1/categories'
 */
categoryRouter.post('/', category.createCategory);
categoryRouter.get('/', category.getCategories);

module.exports = categoryRouter;

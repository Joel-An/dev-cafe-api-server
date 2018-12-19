const categoryRouter = require('express').Router();
const category = require('../../../../controllers/categories');

/*
 *      /api/v1/categories'
 */
categoryRouter.post('/', category.createCategory);
categoryRouter.get('/', category.getCategories);
categoryRouter.get('/:id', category.getCategory);
categoryRouter.delete('/:id', category.deleteCategory);

module.exports = categoryRouter;

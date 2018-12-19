/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const Category = require('../models/category');

const reqGetCategories = () => chai
  .request(server)
  .get(`${API_URI}/categories`);

const reqGetCategory = id => chai
  .request(server)
  .get(`${API_URI}/categories/${id}`);

const reqDeleteCategory = id => chai
  .request(server)
  .delete(`${API_URI}/categories/${id}`);

const parentCategory = new TestCategory('parent');

describe('Categories', () => {
  describe('POST /categories', () => {
    before((done) => {
      clearCollection(Category, done);
    });
    afterEach((done) => {
      clearCollection(Category, done);
    });

    context('상위 카테코리 생성에 성공하면', () => {
      it('201코드, id를 반환한다', async () => {
        const res = await reqPostCategories(parentCategory);
        res.should.have.status(201);
        res.body.should.have.property('categoryId');
      });
    });

    context('하위 카테코리 생성에 성공하면', () => {
      before(async () => {
        const res = await reqPostCategories(parentCategory);
        res.should.have.status(201);
      });

      it('201코드를 반환한다', async () => {
        const parent = await Category.find({ name: parentCategory.name });
        const childCategory = new TestCategory('child', parent._id);

        const res = await reqPostCategories(childCategory);
        res.should.have.status(201);
      });
    });

    context('parentId가 존재하지 않는다면', () => {
      it('404코드를 반환한다', async () => {
        const orphanCategory = new TestCategory('orphan', new ObjectId());
        const res = await reqPostCategories(orphanCategory);
        res.should.have.status(404);
      });
    });

    context('parentId형식이 틀리다면', () => {
      it('400코드를 반환한다', async () => {
        const childCategory = new TestCategory('child', 'wrongIdFormat');
        const res = await reqPostCategories(childCategory);
        res.should.have.status(400);
      });
    });

    context('같은 카테고리 이름이 존재한다면', () => {
      before(async () => {
        const res = await reqPostCategories(parentCategory);
        res.should.have.status(201);
      });

      it('409코드를 반환한다', async () => {
        const res = await reqPostCategories(parentCategory);
        res.should.have.status(409);
      });
    });

    it.skip('관리자가 아니라면 403코드를 반환한다', async () => {
    });
  });

  describe('GET /categories', () => {
    before((done) => {
      clearCollection(Category, done);
    });

    afterEach((done) => {
      clearCollection(Category, done);
    });

    it('카테고리가 없다면 404코드를 반환한다', async () => {
      const res = await reqGetCategories();
      res.should.have.status(404);
    });

    context('상위 카테고리만 존재하면', () => {
      const parent1 = new TestCategory('parent1');
      const parent2 = new TestCategory('parent2');

      before(async () => {
        const p1 = await reqPostCategories(parent1);
        const p2 = await reqPostCategories(parent2);

        p1.should.have.status(201);
        p2.should.have.status(201);
      });

      it('200코드, 카테고리 목록을 반환한다', async () => {
        const res = await reqGetCategories();
        res.should.have.status(200);
        res.body.should.have.property('categories');
        res.body.categories.length.should.be.equal(2);
      });
    });

    context('하위 카테고리가 존재하면', () => {
      let parent;
      let child1;
      let child2;

      before(async () => {
      /*
       * parent1
       *  - child1
       *  - child2
       */
        parent = new TestCategory('parent');
        p1 = await reqPostCategories(parent);

        child1 = new TestCategory('child2_1', p1.body.categoryId);
        child2 = new TestCategory('child2_2', p1.body.categoryId);
        const c1 = reqPostCategories(child1);
        const c2 = reqPostCategories(child2);

        const results = await Promise.all([c1, c2]);
        results.length.should.be.equal(2);
      });

      it('200코드, 트리형태의 카테고리 목록을 반환한다', async () => {
        const res = await reqGetCategories();

        res.should.have.status(200);
        res.body.should.have.property('categories');

        const { categories } = res.body;
        categories.should.be.a('array');
        categories[0].name.should.be.equal(parent.name);
        categories[0].should.have.property('children');
        categories[0].children[0].name.should.be.equal(child1.name);
      });
    });
  });

  describe('GET /categories/:id', () => {
    before((done) => {
      clearCollection(Category, done);
    });

    afterEach((done) => {
      clearCollection(Category, done);
    });

    it('카테고리가 없으면 404코드를 반환한다', async () => {
      const res = await reqGetCategory(new ObjectId());
      res.should.have.status(404);
    });

    it('id형식이 틀리다면 400코드를 반환한다', async () => {
      const res = await reqGetCategory('WRONG_ID');
      res.should.have.status(400);
    });

    context('성공하면', () => {
      const testCategory = new TestCategory('test');
      let id;
      before(async () => {
        const res = await reqPostCategories(testCategory);
        res.should.have.status(201);
        id = res.body.categoryId;
      });

      it('200코드와 category를 반환한다', async () => {
        const res = await reqGetCategory(id);

        res.should.have.status(200);
        const { category } = res.body;
        category.name.should.be.equal(testCategory.name);
      });
    });
  });

  describe('DELETE /categories/:id', () => {
    let testCategory;
    let id;

    before((done) => {
      clearCollection(Category, done);
    });

    beforeEach(async () => {
      testCategory = new TestCategory('test');
      const res = await reqPostCategories(testCategory);

      res.should.have.status(201);
      id = res.body.categoryId;
    });

    afterEach((done) => {
      clearCollection(Category, done);
    });

    it('성공하면 204코드를 반환한다', async () => {
      const res = await reqDeleteCategory(id);
      res.should.have.status(204);

      const checkDeleted = await reqGetCategory(id);
      checkDeleted.should.have.status(404);
    });

    it('id형식이 틀리다면 400코드를 반환한다', async () => {
      const res = await reqDeleteCategory('WRONG_ID');
      res.should.have.status(400);
    });

    it('카테고리가 없다면 404코드를 반환한다', async () => {
      const res = await reqDeleteCategory(new ObjectId());
      res.should.have.status(404);
    });

    context('하위 카테고리가 존재한다면', async () => {
      beforeEach(async () => {
        const parentId = id;
        const childCategory = new TestCategory('child', parentId);
        const res = await reqPostCategories(childCategory);
        res.should.have.status(201);
      });
      it('409코드를 반환한다', async () => {
        const res = await reqDeleteCategory(id);
        res.should.have.status(409);

        const checkExist = await reqGetCategory(id);
        checkExist.should.have.status(200);
      });
    });

    it.skip('관리자가 아니라면 403코드를 반환한다', async () => {
    });
  });
});

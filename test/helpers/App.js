process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
const server = require('../../bin/www');

const API_URI = '/api/v1';

// 테스트용 서버
let requester;

const open = () => {
  requester = chai.request(server).keepOpen();
};

const close = () => {
  requester.close();
};

// 회원 기능
const reqRegister = registerForm => requester
  .post(`${API_URI}/users`)
  .send(registerForm);

const reqUnregister = (userToken, password) => requester
  .delete(`${API_URI}/users/me`)
  .set('x-access-token', userToken)
  .send({ password });

const reqMyInfo = userToken => requester
  .get(`${API_URI}/users/me`)
  .set('x-access-token', userToken);

// 인증(로그인) 기능
const reqLogin = (username, password) => requester
  .post(`${API_URI}/auth`)
  .send({ username, password });


// 카테고리 관리 기능
const reqPostCategory = (token, category) => requester
  .post(`${API_URI}/categories`)
  .set('x-access-token', token)
  .send(category);

const reqDeleteCategory = (token, id) => requester
  .delete(`${API_URI}/categories/${id}`)
  .set('x-access-token', token);

const reqGetCategories = () => requester
  .get(`${API_URI}/categories`);

const reqGetCategory = id => requester
  .get(`${API_URI}/categories/${id}`);

// 글 관리 기능
const reqPostPost = (userToken, post) => requester
  .post(`${API_URI}/posts`)
  .set('x-access-token', userToken)
  .send({ ...post });


const App = {
  open,
  close,
  reqRegister,
  reqUnregister,
  reqMyInfo,
  reqLogin,
  reqPostCategory,
  reqDeleteCategory,
  reqGetCategories,
  reqGetCategory,
  reqPostPost,
};

module.exports = App;

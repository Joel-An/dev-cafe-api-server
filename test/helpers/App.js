process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../../bin/www');

const API_URI = '/api/v1';

// 테스트용 서버
let requester;

const open = () => {
  chai.use(chaiHttp);
  requester = chai.request(server).keepOpen();
};

const close = () => {
  requester.close();
};

const get = url => requester.get(url);

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

const reqGetNewNotifications = token => requester
  .get(`${API_URI}/users/me/new-notifications`)
  .set('x-access-token', token);

const reqGetOldNotifications = token => requester
  .get(`${API_URI}/users/me/old-notifications`)
  .set('x-access-token', token);

const reqPutNotificationCheckDate = token => requester
  .put(`${API_URI}/users/me/notification-check-date`)
  .set('x-access-token', token);

const reqGetNotificationCheckDate = token => requester
  .get(`${API_URI}/users/me/notification-check-date`)
  .set('x-access-token', token);

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

const reqDeletePost = (token, postId) => requester
  .delete(`${API_URI}/posts/${postId}`)
  .set('x-access-token', token);

const reqUpdatePost = (token, post) => requester
  .put(`${API_URI}/posts/${post._id}`)
  .set('x-access-token', token)
  .send(post);

const reqGetPosts = (query) => {
  const queryString = query || '';
  return requester
    .get(`${API_URI}/posts?${queryString}`);
};

const reqGetPost = postId => requester
  .get(`${API_URI}/posts/${postId}`);

// 댓글 관리 기능
const reqPostComment = (userToken, comment) => requester
  .post(`${API_URI}/comments`)
  .set('x-access-token', userToken)
  .send({ ...comment });

const reqDeleteComment = (token, commentId) => requester
  .delete(`${API_URI}/comments/${commentId}`)
  .set('x-access-token', token);

const reqUpdateComment = (token, comment) => requester
  .put(`${API_URI}/comments/${comment._id}`)
  .set('x-access-token', token)
  .send(comment);

const reqGetComments = (query) => {
  const queryString = query || '';
  return requester
    .get(`${API_URI}/comments?${queryString}`);
};

const reqGetComment = commentId => requester.get(`${API_URI}/comments/${commentId}`);

const reqPostAuthorHeart = (token, commentId) => requester
  .post(`${API_URI}/comments/${commentId}/heart`)
  .set('x-access-token', token);

const reqDeleteAuthorHeart = (token, commentId) => requester
  .delete(`${API_URI}/comments/${commentId}/heart`)
  .set('x-access-token', token);

const reqPostCommentLikes = (token, commentId) => requester
  .post(`${API_URI}/comments/${commentId}/likes`)
  .set('x-access-token', token);

const reqDeleteCommentLikes = (token, commentId) => requester
  .delete(`${API_URI}/comments/${commentId}/likes`)
  .set('x-access-token', token);

const reqPostCommentDislikes = (token, commentId) => requester
  .post(`${API_URI}/comments/${commentId}/dislikes`)
  .set('x-access-token', token);

const reqDeleteCommentDislikes = (token, commentId) => requester
  .delete(`${API_URI}/comments/${commentId}/dislikes`)
  .set('x-access-token', token);

const App = {
  open,
  close,
  get,
  reqRegister,
  reqUnregister,
  reqMyInfo,
  reqLogin,
  reqPostCategory,
  reqDeleteCategory,
  reqGetCategories,
  reqGetCategory,
  reqPostPost,
  reqDeletePost,
  reqUpdatePost,
  reqGetPosts,
  reqGetPost,
  reqPostComment,
  reqDeleteComment,
  reqUpdateComment,
  reqGetComments,
  reqGetComment,
  reqPostAuthorHeart,
  reqDeleteAuthorHeart,
  reqPostCommentLikes,
  reqDeleteCommentLikes,
  reqPostCommentDislikes,
  reqDeleteCommentDislikes,
  reqGetNewNotifications,
  reqGetOldNotifications,
  reqPutNotificationCheckDate,
  reqGetNotificationCheckDate,
};

module.exports = App;

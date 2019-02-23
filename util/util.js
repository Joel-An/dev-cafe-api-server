/* eslint-disable func-names */
exports.wrapAsync = function (fn) {
  return function (req, res, next) {
    // async 함수fn 내부에서 발생한 모든 에러들을
    // next()를 통해 오류처리기로 전달
    fn(req, res, next).catch(next);
  };
};

exports.isEmptyInput = (...args) => {
  for (let i = 0; i < args.length; i += 1) {
    if (typeof args[i] === 'string' && !args[i].trim()) return true;

    if (typeof args[i] !== 'boolean' && typeof args[i] !== 'number') {
      if (!args[i] || !args[i].length) return true;
    }
  }

  return false;
};

exports.checkDate = async (document) => {
  const minute = 5;
  const now = Date.now();

  const date = document.date.getTime();

  if (now - date > minute * 60 * 1000) {
    const error = new Error(`테스터 아이디로 작성한 게시물은 작성 후 ${minute}분 동안만 수정/삭제할 수 있습니다.`);
    error.status = 401;
    throw error;
  }
};

exports.listToTree = (list) => {
  const map = {};
  const roots = [];

  let node;
  let i;

  for (i = 0; i < list.length; i += 1) {
    map[list[i]._id] = i;
    // eslint-disable-next-line no-param-reassign
    list[i].children = [];
  }

  for (i = 0; i < list.length; i += 1) {
    node = list[i];
    if (node.parent !== null) {
      list[map[node.parent]].children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
};

exports.regex = {
  emailRule: /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i,
  usernameRule: /^[a-zA-Z0-9-]{2,20}$/,
  passwordRule: /^.*(?=^.{8,20}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$*%^&+=]).*$/,
};

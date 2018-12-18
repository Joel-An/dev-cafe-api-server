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

exports.regex = {
  emailRule: /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i,
  usernameRule: /^[a-zA-Z0-9-]{2,20}$/,
  passwordRule: /^.*(?=^.{8,20}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$*%^&+=]).*$/,
};

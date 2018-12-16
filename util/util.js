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
    if (typeof args[i] !== 'string') throw new Error('문자열만 입력해주세요.');
    if (!args[i].length || !args[i].trim()) return true;
  }

  return false;
};

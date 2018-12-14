/* eslint-disable func-names */
exports.wrapAsync = function (fn) {
  return function (req, res, next) {
    // async 함수fn 내부에서 발생한 모든 에러들을
    // next()를 통해 오류처리기로 전달
    fn(req, res, next).catch(next);
  };
};

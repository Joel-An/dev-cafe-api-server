const { MulterError } = require('multer');

const { FILE_UPLOAD_LIMIT_MB } = require('../constants/fileUpload');

exports.handleFileUploadError = (err, req, res, next) => {
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(500);
      return res.json({ message: `돈이..ㅎㅎ 없는 관계로 이미지 업로드 제한은 ${FILE_UPLOAD_LIMIT_MB}MB입니다ㅎㅎㅎ;;;` });
    }
    res.status(500);
    return res.json(err);
  }
  return next(err);
};

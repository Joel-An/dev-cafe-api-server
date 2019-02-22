const path = require('path');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const { wrapAsync } = require('../../../util/util');
const { FILE_UPLOAD_LIMIT_MB } = require('../../../constants/fileUpload');

AWS.config.loadFromPath(path.join(__dirname, '/../../../config/aws_config.json'));
const s3 = new AWS.S3();

module.exports = wrapAsync(async (req, res, next) => {
  /*
    구현은 됐는데 limit때문에 업로드는 막아둠
  */
  res.status(200);
  return res.json({
    imageUrl: 'https://s3.ap-northeast-2.amazonaws.com/dcafe-bucket/post-images/%EC%95%88%EB%82%B4.png',
  });
  /*
  const upload = multer({
    storage: multerS3({
      s3,
      bucket: `dcafe-bucket/post-images/${req.user.username}`,
      key(request, file, cb) {
        cb(null, `${Date.now().toString()}_${file.originalname}`);
      },
      acl: 'public-read',
    }),
    limits: { fileSize: FILE_UPLOAD_LIMIT_MB * 1024 * 1024 },
  });

  upload.single('image')(req, res, (err) => {
    if (err) {
      return next(err);
    }
    const { file } = req;
    const { location: imageUrl } = file;
    res.status(200);
    return res.json({ imageUrl });
  });

  */
});

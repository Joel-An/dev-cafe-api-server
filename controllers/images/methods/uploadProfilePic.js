const path = require('path');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const { wrapAsync } = require('../../../util/util');
const { FILE_UPLOAD_LIMIT_MB } = require('../../../constants/fileUpload');
const User = require('../../../models/user');

AWS.config.loadFromPath(path.join(__dirname, '/../../../config/aws_config.json'));
const s3 = new AWS.S3();

const afterUpload = wrapAsync(async (req, res) => {
  const userId = req.user._id;
  const { file } = req;
  const { location: imageUrl } = file;

  await User.findByIdAndUpdate(userId, { profilePic: imageUrl });

  return res.status(204).end();
});

module.exports = wrapAsync(async (req, res, next) => {
  const upload = multer({
    storage: multerS3({
      s3,
      bucket: `dcafe-bucket/profile-pics/${req.user.username}`,
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
    return afterUpload(req, res, next);
  });
});

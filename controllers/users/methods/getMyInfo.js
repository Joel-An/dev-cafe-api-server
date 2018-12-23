
module.exports = (req, res) => {
  const myInfo = { profileName: req.user.profileName };
  res.status(200).json({ myInfo });
};

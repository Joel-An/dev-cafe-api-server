
module.exports = (req, res) => {
  const myInfo = {
    profileName: req.user.profileName,
    _id: req.user._id,
    isAdmin: req.user.isAdmin,
  };
  res.status(200).json({ myInfo });
};

const DESELECT_PROPS = {
  iat: undefined,
  exp: undefined,
};

module.exports = (req, res) => {
  const myInfo = {
    ...req.user,
    ...DESELECT_PROPS,
  };
  res.status(200).json({ myInfo });
};

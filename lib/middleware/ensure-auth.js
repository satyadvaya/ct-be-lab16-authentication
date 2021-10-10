module.exports = (req, res, next) => {
  const { userId } = req.cookies;

  if (!userId) {
    throw new Error('You must be signed in to continue');
  }

  req.userId = userId;

  next();
};

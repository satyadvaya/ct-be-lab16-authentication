const { Router } = require('express');
const UserService = require('../services/UserService');

module.exports = Router().post('/signup', async (req, res, next) => {
  try {
    const user = await UserService.create(req.body);

    res.send(user);
  } catch (error) {
    error.status = 400;
    next(error);
  }
});

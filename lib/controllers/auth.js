const { Router } = require('express');
const UserService = require('../services/UserService');
const ensureAuth = require('../middleware/ensure-auth');
const User = require('../models/User');

const oneDayInMilliseconds = 1000 * 60 * 60 * 24;

module.exports = Router()
  .post('/signup', async (req, res, next) => {
    try {
      const user = await UserService.create(req.body);

      res.send(user);
    } catch (error) {
      error.status = 400;
      next(error);
    }
  })

  .post('/login', async (req, res, next) => {
    try {
      const user = await UserService.authorize(req.body);

      res.cookie('userId', user.id, {
        httpOnly: true,
        maxAge: oneDayInMilliseconds,
      });

      res.send(user);
    } catch (error) {
      error.status = 401;
      next(error);
    }
  });

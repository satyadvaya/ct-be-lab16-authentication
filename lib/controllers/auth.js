const { Router } = require('express');
const UserService = require('../services/UserService');
const ensureAuth = require('../middleware/ensure-auth');
const User = require('../models/User');

const oneDayInMilliseconds = 1000 * 60 * 60 * 24;

module.exports = Router()
  .post('/signup', async (req, res, next) => {
    try {
      const user = await UserService.create({ ...req.body, roleTitle: 'USER' });

      res.cookie('session', user.authToken(), {
        httpOnly: true,
        maxAge: oneDayInMilliseconds,
      });

      res.send(user);
    } catch (error) {
      error.status = 400;
      next(error);
    }
  })

  .post('/login', async (req, res, next) => {
    try {
      const user = await UserService.authenticate(req.body);

      res.cookie('session', user.authToken(), {
        httpOnly: true,
        maxAge: oneDayInMilliseconds,
      });

      res.send(user);
    } catch (error) {
      error.status = 401;
      next(error);
    }
  })

  .get('/me', ensureAuth, async (req, res, next) => {
    try {
      // const id = req.userId;
      // const user = await User.getUser(id);
      res.send(req.user);
    } catch (error) {
      next(error);
    }
  });

//   .get('/me', ensureAuth, async (req, res, next) => {
//   try {
//     const id = req.userId;
//     const user = await User.getUser(id);
//     res.send(user);
//   } catch (error) {
//     next(error);
//   }
// });

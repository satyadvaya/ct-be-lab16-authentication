const { Router } = require('express');
const Blathering = require('../models/Blathering');
const ensureAuth = require('../middleware/ensure-auth.js');
const ensureAdmin = require('../middleware/ensure-admin.js');

module.exports = Router()
  .get('/', async (req, res, next) => {
    try {
      const blather = await Blathering.getAllBlatherings();

      res.send(blather);
    } catch (error) {
      next(error);
    }
  })

  .post('/', ensureAuth, async (req, res, next) => {
    try {
      const blather = await Blathering.createBlathering({
        bantererId: req.user.id,
        burble: req.body.burble,
      });

      res.send(blather);
    } catch (error) {
      next(error);
    }
  })

  .delete('/:id', ensureAuth, ensureAdmin, async (req, res, next) => {
    try {
      const blather = await Blathering.deleteBlathering(req.params.id);

      res.send(blather);
    } catch (error) {
      next(error);
    }
  });

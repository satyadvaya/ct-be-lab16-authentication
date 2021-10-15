const { Router } = require('express');
const Blathering = require('../models/Blathering');

module.exports = Router().get('/', async (req, res, next) => {
  try {
    const blather = await Blathering.getAllBlatherings();
    res.send(blather);
  } catch (error) {
    next(error);
  }
});

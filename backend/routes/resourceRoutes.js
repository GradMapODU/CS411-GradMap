// routes/resourceRoutes.js
const express = require('express');
const router = express.Router();
const resourceCtrl = require('../controllers/resourceController');

router.get('/', resourceCtrl.getResources);

module.exports = router;

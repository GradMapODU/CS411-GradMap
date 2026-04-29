// routes/resourceRoutes.js
const express = require('express');
const router = express.Router();
const resourceCtrl = require('../controllers/resourceController');

// Public route
router.get('/', resourceCtrl.getResources);

module.exports = router;

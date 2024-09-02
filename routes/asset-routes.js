const express = require('express');
const { getAssets, createAsset } = require('../controllers/assets-controller');
const router = express.Router();

router.get('/', getAssets);
router.post('/', createAsset);

module.exports = router;

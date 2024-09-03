const express = require('express');
const {
  getAssets,
  createAsset,
  deleteAsset,
  getAssetById,
  updateAsset
} = require('../controllers/assets-controller');

const router = express.Router();

router.get('/', getAssets);
router.post('/', createAsset);
router.get('/:id', getAssetById); // Ruta para obtener un asset por ID
router.patch('/:id', updateAsset); // Ruta para actualizar un asset por ID
router.delete('/:id', deleteAsset); // Ruta para eliminar un asset por ID

module.exports = router;

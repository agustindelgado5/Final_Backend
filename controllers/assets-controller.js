const Asset = require('../models/asset');

const getAssets = async (req, res, next) => {
  let assets;
  try {
    assets = await Asset.find();
  } catch (err) {
    return res.status(500).json({ message: 'No se pudo recuperar los assets.' });
  }
  res.status(200).json({ assets });
};

const createAsset = async (req, res, next) => {
  const { description, category, assigned_employee, assigned_date } = req.body;

  const newAsset = new Asset({
    description,
    category,
    assigned_employee,
    assigned_date
  });

  try {
    await newAsset.save();
  } catch (err) {
    return res.status(500).json({ message: 'No se pudo crear el asset.' });
  }

  res.status(201).json({ asset: newAsset });
};

module.exports = { getAssets, createAsset };

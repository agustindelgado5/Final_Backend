
const Asset = require('../models/asset'); 
const HttpError = require('../models/http-error');

const mongoose = require('mongoose');
const getAssets = async (req, res, next) => {
  const { page = 1, limit = 10, description, category } = req.query; // Valores por defecto para paginación y filtros

  // Crear un objeto de filtro dinámico
  const filter = {};

  // Si hay un valor en 'description', lo agregamos al filtro usando una expresión regular
  if (description) {
    filter.description = { $regex: description, $options: 'i' }; // Búsqueda insensible a mayúsculas/minúsculas
  }

  // Si hay un valor en 'category', lo agregamos al filtro
  if (category) {
    filter.category = { $regex: category, $options: 'i' }; // Búsqueda insensible a mayúsculas/minúsculas
  }

  try {
    // Aplicar los filtros y la paginación
    const assets = await Asset.find(filter) // Aplicar el filtro
      .limit(limit * 1) // Limitar resultados
      .skip((page - 1) * limit) // Saltar resultados según la página
      .exec();

    // Contar el número total de documentos que coinciden con el filtro
    const count = await Asset.countDocuments(filter);

    res.status(200).json({
      assets,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    return res.status(500).json({ message: 'No se pudo recuperar los assets.' });
  }
};

  const getAssetById = async (req, res, next) => {
    const assetId = req.params.id;
  
    // Verificar si el ID es válido
    if (!mongoose.Types.ObjectId.isValid(assetId)) {
      return next(new HttpError('ID de asset no válido.', 400));
    }
  
    let asset;
    try {
      asset = await Asset.findById(assetId);
    } catch (err) {
      return next(new HttpError('Fallo al obtener el asset, por favor intenta nuevamente más tarde.', 500));
    }
  
    if (!asset) {
      return next(new HttpError('Asset no encontrado.', 404));
    }
  
    res.json({ asset: asset.toObject({ getters: true }) });
  };
  
// Crear un nuevo asset
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

const deleteAsset = async (req, res, next) => {
    const assetId = req.params.id;
  
    let asset;
    try {
      asset = await Asset.findById(assetId);
      if (!asset) {
        return res.status(404).json({ message: 'Asset no encontrado.' });
      }
  
      await asset.deleteOne({ _id:  assetId });
    } catch (err) {
      return res.status(500).json({ message: 'No se pudo eliminar el asset.' });
    }
  
    res.status(200).json({ message: 'Asset eliminado exitosamente.' });
  };

  // Actualizar un asset
const updateAsset = async (req, res, next) => {
    console.log("Editando asset")
    const assetId = req.params.id;
    const { description, category, assigned_employee, assigned_date } = req.body;
  
    let asset;
    try {
      asset = await Asset.findById(assetId);
    } catch (err) {
      return next(new HttpError('Fallo al actualizar el asset, por favor intenta nuevamente más tarde.', 500));
    }
  
    if (!asset) {
      return next(new HttpError('Asset no encontrado.', 404));
    }
  
    asset.description = description;
    asset.category = category;
    asset.assigned_employee = assigned_employee;
    asset.assigned_date = assigned_date;
  
    try {
      await asset.save();
    } catch (err) {
      return next(new HttpError('Fallo al guardar el asset actualizado, por favor intenta nuevamente más tarde.', 500));
    }
  
    res.status(200).json({ asset: asset.toObject({ getters: true }) });
  };
  
  module.exports = { getAssets, createAsset, deleteAsset, getAssetById, updateAsset };

  

  



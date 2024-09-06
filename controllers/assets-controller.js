const Asset = require('../models/asset'); 
const HttpError = require('../models/http-error');
const mongoose = require('mongoose');

// Obtener la lista de assets con paginación y filtros
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

    // Respuesta con los resultados y datos de la paginación
    res.status(200).json({
      assets,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    return res.status(500).json({ message: 'No se pudo recuperar los assets.' });
  }
};

// Obtener un asset por su ID
const getAssetById = async (req, res, next) => {
  const assetId = req.params.id;

  // Verificar si el ID es válido
  if (!mongoose.Types.ObjectId.isValid(assetId)) {
    return next(new HttpError('ID de asset no válido.', 400));
  }

  let asset;
  try {
    // Intentar obtener el asset por su ID
    asset = await Asset.findById(assetId);
  } catch (err) {
    return next(new HttpError('Fallo al obtener el asset, por favor intenta nuevamente más tarde.', 500));
  }

  // Verificar si el asset fue encontrado
  if (!asset) {
    return next(new HttpError('Asset no encontrado.', 404));
  }

  // Enviar la respuesta con el asset encontrado
  res.json({ asset: asset.toObject({ getters: true }) });
};

// Crear un nuevo asset
const createAsset = async (req, res, next) => {
  const { description, category, assigned_employee, assigned_date } = req.body;

  // Crear una nueva instancia del modelo Asset
  const newAsset = new Asset({
    description,
    category,
    assigned_employee,
    assigned_date
  });

  try {
    // Guardar el nuevo asset en la base de datos
    await newAsset.save();
  } catch (err) {
    return res.status(500).json({ message: 'No se pudo crear el asset.' });
  }

  // Responder con el asset creado
  res.status(201).json({ asset: newAsset });
};

// Eliminar un asset por su ID
const deleteAsset = async (req, res, next) => {
  const assetId = req.params.id;

  let asset;
  try {
    // Buscar el asset por su ID
    asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset no encontrado.' });
    }

    // Eliminar el asset encontrado
    await asset.deleteOne({ _id: assetId });
  } catch (err) {
    return res.status(500).json({ message: 'No se pudo eliminar el asset.' });
  }

  // Responder con un mensaje de éxito
  res.status(200).json({ message: 'Asset eliminado exitosamente.' });
};

// Actualizar un asset por su ID
const updateAsset = async (req, res, next) => {
  console.log("Editando asset");
  const assetId = req.params.id;
  const { description, category, assigned_employee, assigned_date } = req.body;

  let asset;
  try {
    // Buscar el asset por su ID
    asset = await Asset.findById(assetId);
  } catch (err) {
    return next(new HttpError('Fallo al actualizar el asset, por favor intenta nuevamente más tarde.', 500));
  }

  // Verificar si el asset fue encontrado
  if (!asset) {
    return next(new HttpError('Asset no encontrado.', 404));
  }

  // Actualizar los campos del asset
  asset.description = description;
  asset.category = category;
  asset.assigned_employee = assigned_employee;
  asset.assigned_date = assigned_date;

  try {
    // Guardar los cambios en el asset
    await asset.save();
  } catch (err) {
    return next(new HttpError('Fallo al guardar el asset actualizado, por favor intenta nuevamente más tarde.', 500));
  }

  // Responder con el asset actualizado
  res.status(200).json({ asset: asset.toObject({ getters: true }) });
};

module.exports = { getAssets, createAsset, deleteAsset, getAssetById, updateAsset };

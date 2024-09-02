const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assetSchema = new Schema({
  description: { type: String, required: true },
  category: { type: String, required: true },
  assigned_employee: { type: String, required: false },
  assigned_date: { type: Date, required: false },
});

module.exports = mongoose.model('Asset', assetSchema);

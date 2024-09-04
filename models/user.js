
const mongoose = require('mongoose');
const uniqueValidator=require('mongoose-unique-validator')
const userSchema = new mongoose.Schema({
  name:{type:String,require:true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
});
userSchema.plugin(uniqueValidator)
module.exports = mongoose.model('User', userSchema);

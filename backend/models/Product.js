const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Software', 'Hardware', 'Servicios', 'Licencias', 'Soporte']
  },
  version: {
    type: String,
    required: false,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'discontinued', 'beta']
  },
  releaseDate: {
    type: Date,
    required: true
  },
  manufacturer: {
    type: String,
    required: true,
    trim: true
  },
  supportLevel: {
    type: String,
    required: true,
    enum: ['básico', 'estándar', 'premium', 'enterprise']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar updatedAt antes de guardar
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);

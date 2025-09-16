const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  issueType: {
    type: String,
    required: true,
    enum: ['technical', 'billing', 'account', 'feature', 'other']
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    default: 'open',
    enum: ['open', 'in_progress', 'resolved', 'closed']
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
supportTicketSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);

import mongoose from 'mongoose';

const drugSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  genericName: {
    type: String,
    required: true
  },
  drugCode: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  batchNumber: String,
  expiryDate: Date,
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  unitPrice: {
    type: Number,
    required: true
  },
  reorderLevel: {
    type: Number,
    default: 100
  },
  image: String,
  description: String,
  storage: {
    temperature: String,
    conditions: String
  },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock', 'Expired'],
    default: 'In Stock'
  }
}, {
  timestamps: true
});

// Update status based on quantity
drugSchema.pre('save', function(next) {
  if (this.quantity === 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity <= this.reorderLevel) {
    this.status = 'Low Stock';
  } else if (this.expiryDate && this.expiryDate < new Date()) {
    this.status = 'Expired';
  } else {
    this.status = 'In Stock';
  }
  next();
});

export default mongoose.model('Drug', drugSchema);
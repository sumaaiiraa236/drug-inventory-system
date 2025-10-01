import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  vendorCode: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contactPerson: {
    name: String,
    phone: String,
    email: String
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  drugsSupplied: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drug'
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Pending'],
    default: 'Active'
  },
  performance: {
    onTimeDelivery: Number,
    qualityScore: Number,
    totalOrders: Number
  },
  image: String
}, {
  timestamps: true
});

export default mongoose.model('Vendor', vendorSchema);
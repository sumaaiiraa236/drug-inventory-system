import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  hospitalCode: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['Government', 'Private', 'Community'],
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  capacity: Number,
  contactPerson: {
    name: String,
    phone: String,
    email: String
  },
  consumptionData: [{
    drug: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Drug'
    },
    month: Date,
    quantity: Number,
    cost: Number
  }],
  image: String,
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, {
  timestamps: true
});

export default mongoose.model('Hospital', hospitalSchema);
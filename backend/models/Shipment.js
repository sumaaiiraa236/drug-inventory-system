import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema({
  shipmentNumber: {
    type: String,
    required: true,
    unique: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  trackingNumber: String,
  carrier: String,
  origin: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  destination: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  currentLocation: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    timestamp: Date
  },
  status: {
    type: String,
    enum: ['Preparing', 'In Transit', 'Delivered', 'Delayed', 'Returned'],
    default: 'Preparing'
  },
  conditions: {
    temperature: Number,
    humidity: Number,
    lastChecked: Date
  },
  estimatedDelivery: Date,
  actualDelivery: Date
}, {
  timestamps: true
});

export default mongoose.model('Shipment', shipmentSchema);
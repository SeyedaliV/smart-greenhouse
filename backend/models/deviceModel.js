import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['waterPump', 'fan', 'light', 'heater']
  },
  status: {
    type: String,
    enum: ['ON', 'OFF', 'AUTO'],
    default: 'OFF'
  },
  zone: {
    type: String,
    enum: ['Zone A', 'Zone B', 'Zone C', 'Zone D'],
    required: true
  },
  powerConsumption: Number,
  lastAction: Date
}, {
  timestamps: true
});

const Device = mongoose.model('Device', deviceSchema);

export default Device
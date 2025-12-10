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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone'
  },
  powerConsumption: Number,
  lastAction: Date,
  specificCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

const Device = mongoose.model('Device', deviceSchema);

export default Device

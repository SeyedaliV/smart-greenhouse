import mongoose from 'mongoose';

const zoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Zone A', 'Zone B', 'Zone C', 'Zone D']
  },
  description: String,
  plants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plant' }],
  settings: {
    temperature: { min: Number, max: Number, optimal: Number },
    humidity: { min: Number, max: Number, optimal: Number },
    soilMoisture: { min: Number, max: Number, optimal: Number },
    light: { min: Number, max: Number, optimal: Number }
  },
  status: {
    type: String,
    enum: ['active', 'maintenance'],
    default: 'active'
  }
}, {
  timestamps: true
});

const Zone = mongoose.model('Zone', zoneSchema);

export default Zone;
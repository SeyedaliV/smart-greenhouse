import mongoose from 'mongoose';

const zoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  plantType: {
    type: String,
    required: true
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
    enum: ['active', 'inactive', 'maintenance'],
    default: 'inactive'
  }
}, {
  timestamps: true
});

const Zone = mongoose.model('Zone', zoneSchema);

export default Zone;

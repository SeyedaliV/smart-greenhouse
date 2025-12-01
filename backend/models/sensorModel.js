import mongoose from 'mongoose';

const sensorSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['temperature', 'humidity', 'soilMoisture', 'light']
  },
  value: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['°C', '%', 'lux']
  },
  zone: {
    type: String,
    enum: ['Zone A', 'Zone B', 'Zone C', 'Zone D']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  lastUpdate: {
    type: Date
  },
  plantType: {
    type: String,
    enum: ['tomato', 'cucumber', 'lettuce', 'bellpepper'],
    required: function () {
      return this.type === 'soilMoisture';
    }
  }
}, {
  timestamps: true
});

const Sensor = mongoose.model('Sensor', sensorSchema);

export default Sensor
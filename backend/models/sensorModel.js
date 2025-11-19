import mongoose from 'mongoose';

const sensorSchema = new mongoose.Schema({
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
  plantType: {
    type: String,
    enum: ['tomato', 'cucumber', 'lettuce', 'bellpepper'],
    required: function() {
      return this.type === 'soilMoisture';
    }
  },
}, {
  timestamps: true
});

const Sensor = mongoose.model('Sensor', sensorSchema);

export default Sensor
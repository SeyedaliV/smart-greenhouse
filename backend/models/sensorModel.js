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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone'
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
    enum: ['tomato', 'cucumber', 'lettuce', 'bellpepper', 'eggplant', 'carrot', 'potato', 'onion', 'garlic', 'broccoli', 'corn', 'hotPepper', 'avocado', 'banana', 'apple', 'orange', 'lemon', 'grapes', 'watermelon', 'strawberry', 'blueberries', 'cherries', 'peach', 'mango', 'pineapple', 'coconut', 'kiwi', 'spinach', 'kale', 'cabbage', 'mushroom', 'peanuts', 'chestnut', 'olive', 'wheat', 'rice', 'herbs', 'basil', 'mint', 'rosemary', 'thyme', 'lavender'],
    required: function () {
      return this.type === 'soilMoisture';
    }
  }
}, {
  timestamps: true
});

const Sensor = mongoose.model('Sensor', sensorSchema);

export default Sensor

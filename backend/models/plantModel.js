// models/Plant.js
import mongoose from 'mongoose';

const plantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['tomato', 'cucumber', 'lettuce', 'bellpepper', 'eggplant', 'carrot', 'potato', 'onion', 'garlic', 'broccoli', 'corn', 'hotPepper', 'avocado', 'banana', 'apple', 'orange', 'lemon', 'grapes', 'watermelon', 'strawberry', 'blueberries', 'cherries', 'peach', 'mango', 'pineapple', 'coconut', 'kiwi', 'spinach', 'kale', 'cabbage', 'mushroom', 'peanuts', 'chestnut', 'olive', 'wheat', 'rice', 'herbs', 'basil', 'mint', 'rosemary', 'thyme', 'lavender'],
  },
  zone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone'
  },
  optimalConditions: {
    temperature: { min: Number, max: Number },
    humidity: { min: Number, max: Number },
    soilMoisture: { min: Number, max: Number },
    light: { min: Number, max: Number },
    daysToMature: Number
  },
  currentStats: {
    temperature: Number,
    humidity: Number,
    soilMoisture: Number,
    light: Number,
    lastUpdated: Date
  },
  plantingDate: {
    type: Date,
    default: Date.now
  },
  daysToMature: {
    type: Number,
    required: true
  },
  estimatedHarvestDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['optimal', 'needs_attention', 'critical'],
    default: 'optimal'
  }
}, {
  timestamps: true
});

plantSchema.pre('save', function(next) {
  if (this.isModified('type') && (!this.optimalConditions || !this.optimalConditions.temperature)) {
    const conditions = {
      tomato: {
        temperature: { min: 22, max: 28 },
        humidity: { min: 50, max: 70 },
        soilMoisture: { min: 40, max: 60 },
        light: { min: 600, max: 1000 },
        daysToMature: 70
      },
      cucumber: {
        temperature: { min: 20, max: 30 },
        humidity: { min: 60, max: 80 },
        soilMoisture: { min: 50, max: 70 },
        light: { min: 500, max: 900 },
        daysToMature: 55
      },
      lettuce: {
        temperature: { min: 15, max: 25 },
        humidity: { min: 55, max: 75 },
        soilMoisture: { min: 45, max: 65 },
        light: { min: 400, max: 800 },
        daysToMature: 45
      },
      bellpepper: {
        temperature: { min: 22, max: 32 },
        humidity: { min: 50, max: 70 },
        soilMoisture: { min: 40, max: 60 },
        light: { min: 700, max: 1100 },
        daysToMature: 75
      },
      eggplant: {
        temperature: { min: 24, max: 30 },
        humidity: { min: 50, max: 70 },
        soilMoisture: { min: 50, max: 70 },
        light: { min: 800, max: 1200 },
        daysToMature: 80
      },
      carrot: {
        temperature: { min: 15, max: 25 },
        humidity: { min: 60, max: 80 },
        soilMoisture: { min: 60, max: 80 },
        light: { min: 400, max: 800 },
        daysToMature: 75
      },
      potato: {
        temperature: { min: 15, max: 20 },
        humidity: { min: 70, max: 90 },
        soilMoisture: { min: 60, max: 80 },
        light: { min: 200, max: 600 },
        daysToMature: 90
      },
      onion: {
        temperature: { min: 15, max: 25 },
        humidity: { min: 50, max: 70 },
        soilMoisture: { min: 40, max: 60 },
        light: { min: 600, max: 1000 },
        daysToMature: 100
      },
      garlic: {
        temperature: { min: 12, max: 20 },
        humidity: { min: 60, max: 80 },
        soilMoisture: { min: 50, max: 70 },
        light: { min: 400, max: 800 },
        daysToMature: 90
      },
      broccoli: {
        temperature: { min: 15, max: 25 },
        humidity: { min: 60, max: 80 },
        soilMoisture: { min: 60, max: 80 },
        light: { min: 600, max: 1000 },
        daysToMature: 70
      },
      corn: {
        temperature: { min: 20, max: 30 },
        humidity: { min: 50, max: 70 },
        soilMoisture: { min: 60, max: 80 },
        light: { min: 800, max: 1200 },
        daysToMature: 85
      },
      hotPepper: {
        temperature: { min: 24, max: 32 },
        humidity: { min: 50, max: 70 },
        soilMoisture: { min: 50, max: 70 },
        light: { min: 800, max: 1200 },
        daysToMature: 80
      },
      avocado: {
        temperature: { min: 20, max: 30 },
        humidity: { min: 60, max: 80 },
        soilMoisture: { min: 50, max: 70 },
        light: { min: 600, max: 1000 },
        daysToMature: 365
      },
      banana: {
        temperature: { min: 26, max: 32 },
        humidity: { min: 70, max: 90 },
        soilMoisture: { min: 60, max: 80 },
        light: { min: 1000, max: 1500 },
        daysToMature: 365
      },
      apple: {
        temperature: { min: 15, max: 25 },
        humidity: { min: 50, max: 70 },
        soilMoisture: { min: 50, max: 70 },
        light: { min: 600, max: 1000 },
        daysToMature: 150
      },
      orange: {
        temperature: { min: 20, max: 30 },
        humidity: { min: 50, max: 70 },
        soilMoisture: { min: 50, max: 70 },
        light: { min: 800, max: 1200 },
        daysToMature: 365
      },
      lemon: {
        temperature: { min: 20, max: 30 },
        humidity: { min: 50, max: 70 },
        soilMoisture: { min: 50, max: 70 },
        light: { min: 800, max: 1200 },
        daysToMature: 365
      },
      grapes: {
        temperature: { min: 15, max: 25 },
        humidity: { min: 40, max: 60 },
        soilMoisture: { min: 40, max: 60 },
        light: { min: 800, max: 1200 },
        daysToMature: 150
      },
      watermelon: {
        temperature: { min: 20, max: 30 },
        humidity: { min: 50, max: 70 },
        soilMoisture: { min: 60, max: 80 },
        light: { min: 800, max: 1200 },
        daysToMature: 80
      },
      strawberry: {
        temperature: { min: 15, max: 25 },
        humidity: { min: 60, max: 80 },
        soilMoisture: { min: 60, max: 80 },
        light: { min: 600, max: 1000 },
        daysToMature: 60
      },
      blueberries: {
        temperature: { min: 15, max: 25 },
        humidity: { min: 60, max: 80 },
        soilMoisture: { min: 50, max: 70 },
        light: { min: 600, max: 1000 },
        daysToMature: 90
      },
      cherries: {
        temperature: { min: 15, max: 25 },
        humidity: { min: 50, max: 70 },
        soilMoisture: { min: 50, max: 70 },
        light: { min: 600, max: 1000 },
        daysToMature: 60
      },
      peach: {
        temperature: { min: 15, max: 25 },
        humidity: { min: 50, max: 70 },
        soilMoisture: { min: 50, max: 70 },
        light: { min: 600, max: 1000 },
        daysToMature: 140
      },
      mango: {
        temperature: { min: 24, max: 32 },
        humidity: { min: 60, max: 80 },
        soilMoisture: { min: 50, max: 70 },
        light: { min: 800, max: 1200 },
        daysToMature: 365
      },
      pineapple: {
        temperature: { min: 23, max: 32 },
        humidity: { min: 60, max: 80 },
        soilMoisture: { min: 50, max: 70 },
        light: { min: 800, max: 1200 },
        daysToMature: 365
      },
      coconut: {
        temperature: { min: 25, max: 35 },
        humidity: { min: 70, max: 90 },
        soilMoisture: { min: 60, max: 80 },
        light: { min: 1000, max: 1500 },
        daysToMature: 365
      },
      kiwi: {
        temperature: { min: 15, max: 25 },
        humidity: { min: 70, max: 90 },
        soilMoisture: { min: 60, max: 80 },
        light: { min: 600, max: 1000 },
        daysToMature: 180
      },
      spinach: {
        temperature: { min: 10, max: 20 },
        humidity: { min: 60, max: 80 },
        soilMoisture: { min: 60, max: 80 },
        light: { min: 400, max: 800 },
        daysToMature: 45
      },
      kale: {
        temperature: { min: 15, max: 25 },
        humidity: { min: 60, max: 80 },
        soilMoisture: { min: 60, max: 80 },
        light: { min: 600, max: 1000 },
        daysToMature: 60
      },
      cabbage: {
        temperature: { min: 15, max: 25 },
        humidity: { min: 60, max: 80 },
        soilMoisture: { min: 60, max: 80 },
        light: { min: 600, max: 1000 },
        daysToMature: 80
      },
      mushroom: {
        temperature: { min: 12, max: 18 },
        humidity: { min: 85, max: 95 },
        soilMoisture: { min: 70, max: 90 },
        light: { min: 50, max: 200 },
        daysToMature: 30
      },
      peanuts: {
        temperature: { min: 20, max: 30 },
        humidity: { min: 50, max: 70 },
        soilMoisture: { min: 40, max: 60 },
        light: { min: 600, max: 1000 },
        daysToMature: 120
      },
      chestnut: {
        temperature: { min: 15, max: 25 },
        humidity: { min: 60, max: 80 },
        soilMoisture: { min: 50, max: 70 },
        light: { min: 600, max: 1000 },
        daysToMature: 180
      },
      olive: {
        temperature: { min: 15, max: 25 },
        humidity: { min: 40, max: 60 },
        soilMoisture: { min: 30, max: 50 },
        light: { min: 800, max: 1200 },
        daysToMature: 180
      },
      wheat: {
        temperature: { min: 15, max: 25 },
        humidity: { min: 50, max: 70 },
        soilMoisture: { min: 50, max: 70 },
        light: { min: 600, max: 1000 },
        daysToMature: 120
      },
      rice: {
        temperature: { min: 20, max: 35 },
        humidity: { min: 70, max: 90 },
        soilMoisture: { min: 80, max: 100 },
        light: { min: 600, max: 1000 },
        daysToMature: 120
      },
      herbs: {
        temperature: { min: 15, max: 25 },
        humidity: { min: 50, max: 70 },
        soilMoisture: { min: 50, max: 70 },
        light: { min: 600, max: 1000 },
        daysToMature: 60
      },
      basil: {
        temperature: { min: 20, max: 30 },
        humidity: { min: 50, max: 70 },
        soilMoisture: { min: 50, max: 70 },
        light: { min: 600, max: 1000 },
        daysToMature: 60
      },
      mint: {
        temperature: { min: 15, max: 25 },
        humidity: { min: 60, max: 80 },
        soilMoisture: { min: 50, max: 70 },
        light: { min: 400, max: 800 },
        daysToMature: 90
      },
      rosemary: {
        temperature: { min: 15, max: 25 },
        humidity: { min: 40, max: 60 },
        soilMoisture: { min: 30, max: 50 },
        light: { min: 600, max: 1000 },
        daysToMature: 90
      },
      thyme: {
        temperature: { min: 15, max: 25 },
        humidity: { min: 40, max: 60 },
        soilMoisture: { min: 30, max: 50 },
        light: { min: 600, max: 1000 },
        daysToMature: 75
      },
      lavender: {
        temperature: { min: 15, max: 25 },
        humidity: { min: 40, max: 60 },
        soilMoisture: { min: 30, max: 50 },
        light: { min: 600, max: 1000 },
        daysToMature: 100
      }
    };

    this.optimalConditions = conditions[this.type] || conditions.tomato;
    this.daysToMature = (conditions[this.type] && conditions[this.type].daysToMature) || this.daysToMature;
  }
  next();
});

plantSchema.pre('save', function(next) {
  if (this.isModified('plantingDate') || this.isModified('daysToMature')) {
    const harvestDate = new Date(this.plantingDate);
    harvestDate.setDate(harvestDate.getDate() + this.daysToMature);
    this.estimatedHarvestDate = harvestDate;
  }
  next();
});

plantSchema.methods.getDaysUntilHarvest = function() {
  const today = new Date();
  const harvestDate = new Date(this.estimatedHarvestDate);
  const diffTime = harvestDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

plantSchema.methods.getHarvestStatus = function() {
  const daysLeft = this.getDaysUntilHarvest();
  
  if (daysLeft <= 0) {
    return { status: 'ready', text: 'Ready for harvest', color: 'success' };
  } else if (daysLeft <= 7) {
    return { status: 'soon', text: 'Harvest soon', color: 'warning' };
  } else if (daysLeft <= 30) {
    return { status: 'growing', text: 'Growing', color: 'info' };
  } else {
    return { status: 'seedling', text: 'Seedling', color: 'secondary' };
  }
};

const Plant = mongoose.model('Plant', plantSchema);

export default Plant

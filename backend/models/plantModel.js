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
    enum: ['tomato', 'cucumber', 'lettuce', 'bellpepper'],
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
  if (this.isModified('type') && !this.optimalConditions.temperature) {
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
      }
    };
    
    this.optimalConditions = conditions[this.type] || conditions.tomato;
    this.daysToMature = conditions[this.type].daysToMature;
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
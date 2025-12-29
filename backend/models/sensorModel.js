// backend/models/sensorModel.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const sensorSchema = new Schema({
  // Human‑friendly label that we auto-generate (e.g. "General Temperature Sensor 2")
  name: {
    type: String,
    trim: true
  },

  // What this sensor measures
  type: {
    type: String,
    required: [true, 'Sensor type is required'],
    enum: ['temperature', 'humidity', 'soilMoisture', 'light']
  },

  // Latest measured value
  value: {
    type: Number,
    default: function () {
      const defaults = {
        temperature: 25.0,
        humidity: 65.0,
        soilMoisture: 50.0,
        light: 750.0
      };
      return defaults[this.type] || 0;
    }
  },

  // Engineering unit for the value
  unit: {
    type: String,
    required: true,
    enum: ['°C', '%', 'lux'],
    default: function () {
      const units = {
        temperature: '°C',
        humidity: '%',
        soilMoisture: '%',
        light: 'lux'
      };
      return units[this.type] || '';
    }
  },

  // Scope: which zone this belongs to (always set)
  zone: {
    type: Schema.Types.ObjectId,
    ref: 'Zone',
    required: [true, 'Zone is required']
  },

  // Optional: if set, this sensor is dedicated to a specific plant
  plant: {
    type: Schema.Types.ObjectId,
    ref: 'Plant',
    default: null
  },

  // Unique hardware identifier (MAC‑like) printed on device
  hardwareId: {
    type: String,
    unique: true,
    sparse: true,
    default: function () {
      const hex = '0123456789ABCDEF';
      let mac = '';
      for (let i = 0; i < 6; i++) {
        mac += hex[Math.floor(Math.random() * 16)] + hex[Math.floor(Math.random() * 16)];
        if (i < 5) mac += ':';
      }
      return mac;
    }
  },

  // Network address inside greenhouse LAN (optional in simulation)
  ipAddress: {
    type: String
  },

  // Logical status from agronomy/operations perspective
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },

  // Connectivity state from IoT perspective
  connectionStatus: {
    type: String,
    enum: ['connected', 'disconnected'],
    default: 'connected'
  },

  // Battery level (0‑100%) – useful for wireless sensors
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },

  // Signal strength (0‑100%) – RSSI simplified
  signalStrength: {
    type: Number,
    min: 0,
    max: 100,
    default: function () {
      return 60 + Math.round(Math.random() * 35);
    }
  },

  // How often the sensor reports a new reading
  samplingIntervalSeconds: {
    type: Number,
    min: 5,
    max: 3600,
    default: 10
  },

  // Physical location inside the zone ("North bed, row 2")
  location: {
    type: String,
    trim: true
  },

  // When the last reading was taken
  lastUpdate: {
    type: Date,
    default: Date.now
  },

  // When the device last talked to the platform
  lastCommunication: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
sensorSchema.index({ zone: 1 });
sensorSchema.index({ plant: 1 });
sensorSchema.index({ type: 1 });

// Auto-generate a realistic, human-friendly sensor name with numbering
sensorSchema.pre('save', async function (next) {
  if (this.name) return next();

  const typeNames = {
    temperature: 'Temperature',
    humidity: 'Humidity',
    soilMoisture: 'Soil Moisture',
    light: 'Light'
  };

  const scopeFilter = {
    zone: this.zone,
    type: this.type,
    plant: this.plant || null
  };

  try {
    const existingCount = await this.constructor.countDocuments(scopeFilter);
    const index = existingCount + 1;
    const base = typeNames[this.type] || 'Sensor';

    if (this.plant) {
      // Per‑plant sensor
      this.name = `${base} Sensor ${index}`;
    } else {
      // General zone sensor
      this.name = `General ${base} Sensor ${index}`;
    }

    return next();
  } catch (err) {
    return next(err);
  }
});

// Simulation helpers for the IoT demo
sensorSchema.methods.simulateReading = function () {
  const fluctuation = (Math.random() - 0.5) * 4;
  let newValue = this.value + fluctuation;

  const limits = {
    temperature: { min: 15, max: 35 },
    humidity: { min: 40, max: 90 },
    soilMoisture: { min: 20, max: 80 },
    light: { min: 0, max: 1200 }
  };

  const limit = limits[this.type];
  if (limit) {
    newValue = Math.max(limit.min, Math.min(limit.max, newValue));
  }

  this.value = Math.round(newValue * 10) / 10;
  this.lastUpdate = new Date();
  this.lastCommunication = new Date();

  // Drain battery a bit and vary signal to feel realistic
  this.batteryLevel = Math.max(0, Math.min(100, this.batteryLevel - Math.random() * 0.5));
  this.signalStrength = Math.max(0, Math.min(100, this.signalStrength + (Math.random() - 0.5) * 5));

  return this.value;
};

sensorSchema.methods.simulateConnection = function () {
  // Simple toggle with some randomness for demo
  if (this.connectionStatus === 'disconnected') {
    this.connectionStatus = 'connected';
    this.signalStrength = 60 + Math.round(Math.random() * 35);
  } else if (Math.random() < 0.1) {
    // 10% chance to drop
    this.connectionStatus = 'disconnected';
    this.signalStrength = 0;
  }

  this.lastCommunication = new Date();
  return this.connectionStatus;
};

const Sensor = mongoose.model('Sensor', sensorSchema);

export default Sensor;
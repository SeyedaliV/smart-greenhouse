import Sensor from '../models/sensorModel.js';
import { createAuditLog } from './auditLogController.js';

export const getAllSensors = async (req, res) => {
  try {
    const { zone, type, status, plant } = req.query;
    
    const filter = {};
    if (zone) filter.zone = zone;
    if (type) filter.type = type;
    if (status) filter.connectionStatus = status;
    if (plant) filter.plant = plant;
    
    const sensors = await Sensor.find(filter)
      .populate('zone', 'name')
      .populate('plant', 'name type');
    
    res.status(200).json({
      status: 'success',
      results: sensors.length,
      data: { sensors }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching sensors',
      error: error.message
    });
  }
};

export const getSensor = async (req, res) => {
  try {
    const sensor = await Sensor.findById(req.params.id)
      .populate('zone', 'name')
      .populate('plant', 'name type');
    
    if (!sensor) {
      return res.status(404).json({
        status: 'error',
        message: 'Sensor not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { sensor }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching sensor',
      error: error.message
    });
  }
};

export const createSensor = async (req, res) => {
  try {
    console.log('📨 Creating sensor with data:', req.body);
    
    const {
      type,
      zone,
      plant,
      hardwareId,
      ipAddress,
      location,
      samplingIntervalSeconds
    } = req.body;

    if (!type || !zone) {
      return res.status(400).json({
        status: 'error',
        message: 'Type and zone are required'
      });
    }

    if (type === 'soilMoisture' && !plant) {
      return res.status(400).json({
        status: 'error',
        message: 'Soil moisture sensor must be assigned to a specific plant'
      });
    }

    const sensorData = {
      type,
      zone,
      plant: plant || undefined,
      hardwareId: hardwareId || undefined,
      ipAddress: ipAddress || undefined,
      location: location || undefined,
      samplingIntervalSeconds: samplingIntervalSeconds || undefined,
      connectionStatus: 'connected',
      lastUpdate: new Date(),
      lastCommunication: new Date(),
      batteryLevel: 100,
    };
    
    console.log('📊 Sensor data to create:', sensorData);

    const sensor = await Sensor.create(sensorData);

    console.log('✅ Sensor created:', sensor._id);

    const populatedSensor = await Sensor.findById(sensor._id)
      .populate('zone', 'name')
      .populate('plant', 'name type');

    await createAuditLog({
      req,
      actionType: 'SENSOR_CREATE',
      entityType: 'Sensor',
      entityId: populatedSensor._id.toString(),
      entityName: populatedSensor.name,
      description: 'Created sensor',
      meta: {
        type: populatedSensor.type,
        zone: populatedSensor.zone,
        plant: populatedSensor.plant,
        hardwareId: populatedSensor.hardwareId,
      },
    });
    
    res.status(201).json({
      status: 'success',
      message: 'Sensor created successfully',
      data: { sensor: populatedSensor }
    });
    
  } catch (error) {
    console.error('❌ Error creating sensor:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Hardware ID already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Error creating sensor',
      error: error.message
    });
  }
};









export const deleteSensor = async (req, res) => {
  try {
    const { id } = req.params;

    const sensor = await Sensor.findByIdAndDelete(id);

    if (!sensor) {
      return res.status(404).json({
        status: 'error',
        message: 'Sensor not found'
      });
    }

    await createAuditLog({
      req,
      actionType: 'SENSOR_DELETE',
      entityType: 'Sensor',
      entityId: sensor._id.toString(),
      entityName: sensor.name,
      description: 'Deleted sensor',
      meta: {
        type: sensor.type,
        zone: sensor.zone,
        plant: sensor.plant,
        hardwareId: sensor.hardwareId,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Sensor deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting sensor:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete sensor'
    });
  }
};
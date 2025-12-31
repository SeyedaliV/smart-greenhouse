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
        message: 'نوع و زون الزامی هستند'
      });
    }

    if (type === 'soilMoisture' && !plant) {
      return res.status(400).json({
        status: 'error',
        message: 'سنسور رطوبت خاک باید برای یک گیاه خاص باشد'
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
        message: 'شناسه سخت‌افزاری تکراری است'
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
      message: 'خطا در ایجاد سنسور',
      error: error.message
    });
  }
};

export const updateSensorValue = async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body;
    
    if (typeof value !== 'number') {
      return res.status(400).json({
        status: 'error',
        message: 'Value must be a number'
      });
    }
    
    const sensor = await Sensor.findById(id);
    
    if (!sensor) {
      return res.status(404).json({
        status: 'error',
        message: 'Sensor not found'
      });
    }
    
    sensor.value = value;
    sensor.lastUpdate = new Date();
    sensor.lastCommunication = new Date();
    
    await sensor.save();

    await createAuditLog({
      req,
      actionType: 'SENSOR_UPDATE',
      entityType: 'Sensor',
      entityId: sensor._id.toString(),
      entityName: sensor.name,
      description: 'Updated sensor value manually',
      meta: {
        type: sensor.type,
        zone: sensor.zone,
        plant: sensor.plant,
        value: sensor.value,
      },
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Sensor value updated',
      data: { sensor }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating sensor value',
      error: error.message
    });
  }
};

export const simulateSensorUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sensor = await Sensor.findById(id);
    
    if (!sensor) {
      return res.status(404).json({
        status: 'error',
        message: 'Sensor not found'
      });
    }
    
    if (sensor.connectionStatus === 'disconnected') {
      await sensor.simulateConnection();
    }
    
    const newValue = sensor.simulateReading();
    await sensor.save();

    await createAuditLog({
      req,
      actionType: 'SENSOR_READING',
      entityType: 'Sensor',
      entityId: sensor._id.toString(),
      entityName: sensor.name,
      description: 'Simulated sensor reading',
      meta: {
        type: sensor.type,
        zone: sensor.zone,
        plant: sensor.plant,
        value: newValue,
      },
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Sensor reading simulated',
      data: {
        sensor: {
          id: sensor._id,
          name: sensor.name,
          type: sensor.type,
          value: sensor.value,
          unit: sensor.unit,
          lastUpdate: sensor.lastUpdate,
          connectionStatus: sensor.connectionStatus,
          batteryLevel: sensor.batteryLevel,
          signalStrength: sensor.signalStrength
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error simulating sensor reading',
      error: error.message
    });
  }
};

export const simulateConnection = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sensor = await Sensor.findById(id);
    
    if (!sensor) {
      return res.status(404).json({
        status: 'error',
        message: 'Sensor not found'
      });
    }
    
    const previousStatus = sensor.connectionStatus;
    await sensor.simulateConnection();

    await createAuditLog({
      req,
      actionType: 'SENSOR_CONNECTION',
      entityType: 'Sensor',
      entityId: sensor._id.toString(),
      entityName: sensor.name,
      description: 'Simulated sensor connection state change',
      meta: {
        type: sensor.type,
        zone: sensor.zone,
        plant: sensor.plant,
        from: previousStatus,
        to: sensor.connectionStatus,
      },
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Sensor connection simulated',
      data: {
        sensor: {
          id: sensor._id,
          connectionStatus: sensor.connectionStatus,
          signalStrength: sensor.signalStrength,
          lastCommunication: sensor.lastCommunication
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error simulating connection',
      error: error.message
    });
  }
};

export const getSensorMetrics = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sensor = await Sensor.findById(id)
      .select('hardwareId batteryLevel signalStrength connectionStatus');
    
    if (!sensor) {
      return res.status(404).json({
        status: 'error',
        message: 'Sensor not found'
      });
    }
    
    const metrics = {
      hardwareInfo: {
        hardwareId: sensor.hardwareId
      },
      networkInfo: {
        connectionStatus: sensor.connectionStatus,
        signalStrength: `${sensor.signalStrength}%`,
        batteryLevel: `${sensor.batteryLevel.toFixed(1)}%`
      }
    };
    
    res.status(200).json({
      status: 'success',
      data: { metrics }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching sensor metrics',
      error: error.message
    });
  }
};

export const getPlantSensors = async (req, res) => {
  try {
    const { plantId } = req.params;
    
    const sensors = await Sensor.find({ plant: plantId })
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
      message: 'Error fetching plant sensors',
      error: error.message
    });
  }
};

export const getZoneSensors = async (req, res) => {
  try {
    const { zoneId } = req.params;
    
    const sensors = await Sensor.find({ 
      zone: zoneId,
      plant: null
    }).populate('zone', 'name');
    
    res.status(200).json({
      status: 'success',
      results: sensors.length,
      data: { sensors }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching zone sensors',
      error: error.message
    });
  }
};

export const startSimulation = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Sensor simulation started',
      data: { status: 'simulation_started' }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error starting simulation',
      error: error.message
    });
  }
};

export const stopSimulation = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Sensor simulation stopped',
      data: { status: 'simulation_stopped' }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error stopping simulation',
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
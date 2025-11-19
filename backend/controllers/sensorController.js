import Sensor from '../models/sensorModel.js';

export const getSensors = async (req, res) => {
  try {
    const sensors = await Sensor.find();
    res.json(sensors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSensor = async (req, res) => {
  try {
    const sensor = await Sensor.findById(req.params.id);
    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found' });
    }
    res.json(sensor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
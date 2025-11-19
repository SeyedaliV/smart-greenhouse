import Plant from '../models/plantModel.js';

export const getAllPlants = async (req, res) => {
  try {
    const plants = await Plant.find().populate('zone');

    res.status(200).json({
      status: 'success',
      results: plants.length,
      data: {
        plants
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching plants',
      error: error.message
    });
  }
};

// export const getPlant = async (req, res) => {
//   try {
//     const plant = await Plant.findOne({ type: req.params.type });

//     if (!plant) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'Plant not found'
//       });
//     }

//     res.status(200).json({
//       status: 'success',
//       data: {
//         plant
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: 'error',
//       message: 'Error fetching plant',
//       error: error.message
//     });
//   }
// };

export const getPlant = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id).populate('zone');
    
    if (!plant) {
      return res.status(404).json({
        status: 'error',
        message: 'Plant not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        plant: plant
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const updatePlantStats = async (req, res) => {
  try {
    const { temperature, humidity, soilMoisture, light } = req.body;
    
    const plant = await Plant.findOneAndUpdate(
      { type: req.params.type },
      {
        $set: {
          'currentStats.temperature': temperature,
          'currentStats.humidity': humidity,
          'currentStats.soilMoisture': soilMoisture,
          'currentStats.light': light,
          'currentStats.lastUpdated': new Date()
        }
      },
      { new: true, runValidators: true }
    );

    if (!plant) {
      return res.status(404).json({
        status: 'error',
        message: 'Plant not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        plant
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating plant stats',
      error: error.message
    });
  }
};

export const createPlant = async (req, res) => {
  try {
    const plant = new Plant(req.body);
    await plant.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        plant: plant
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const updatePlant = async (req, res) => {
  try {
    const plant = await Plant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!plant) {
      return res.status(404).json({
        status: 'error',
        message: 'Plant not found'
      });
    }
    
    res.json({
      status: 'success',
      data: {
        plant: plant
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const deletePlant = async (req, res) => {
  try {
    const plant = await Plant.findByIdAndDelete(req.params.id);
    
    if (!plant) {
      return res.status(404).json({
        status: 'error',
        message: 'Plant not found'
      });
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
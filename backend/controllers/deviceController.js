import Device from '../models/deviceModel.js';
import Zone from '../models/zoneModel.js';
import { createAuditLog } from './auditLogController.js';

export const getAllDevices = async (req, res) => {
  try {
    const devices = await Device.find().populate('zone');

    res.status(200).json({
      status: 'success',
      results: devices.length,
      data: {
        devices
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching devices',
      error: error.message
    });
  }
};

export const controlDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { status } = req.body;

    if (!['ON', 'OFF', 'AUTO'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Use ON, OFF, or AUTO'
      });
    }

    const device = await Device.findByIdAndUpdate(
      deviceId,
      {
        status,
        lastAction: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!device) {
      return res.status(404).json({
        status: 'error',
        message: 'Device not found'
      });
    }

    // Audit log for device control
    await createAuditLog({
      req,
      actionType: 'DEVICE_CONTROL',
      entityType: 'Device',
      entityId: device._id.toString(),
      entityName: device.name,
      description: `Changed device status to ${status}`,
      meta: {
        status,
        zone: device.zone,
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        device
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error controlling device',
      error: error.message
    });
  }
};

export const createDevice = async (req, res) => {
  try {
    const { type, zone: zoneName, powerConsumption } = req.body;

    // Find the zone by name
    const zone = await Zone.findOne({ name: zoneName });
    if (!zone) {
      return res.status(400).json({
        status: 'error',
        message: `Zone ${zoneName} not found`
      });
    }

    // Generate device name based on type and count
    const deviceNameMap = {
      waterPump: 'Water Pump',
      fan: 'Ventilation Fan',
      light: 'Grow Light',
      heater: 'Heater'
    };

    const baseName = deviceNameMap[type];

    // Count existing devices of this type in this zone
    const existingDevicesCount = await Device.countDocuments({
      type,
      zone: zone._id
    });

    const deviceName = `${baseName} ${existingDevicesCount + 1}`;

    // Generate specific code
    const typeMap = {
      waterPump: 'PUMP',
      fan: 'FAN',
      light: 'LIGHT',
      heater: 'HEATER'
    };

    const zoneMap = {};

    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(65 + i); // A تا Z
      zoneMap[`Zone ${letter}`] = `Z${letter}`;
    }


    const typePrefix = typeMap[type];
    const zonePrefix = zoneMap[zoneName];

    // Find the highest number for this type-zone combination
    const regex = new RegExp(`^${typePrefix}-${zonePrefix}-(\\d{3})$`);
    const existingCodes = await Device.find({ specificCode: regex }).select('specificCode');

    let nextNumber = 1;
    if (existingCodes.length > 0) {
      const numbers = existingCodes.map(code => {
        const match = code.specificCode.match(regex);
        return match ? parseInt(match[1], 10) : 0;
      });
      nextNumber = Math.max(...numbers) + 1;
    }

    const specificCode = `${typePrefix}-${zonePrefix}-${String(nextNumber).padStart(3, '0')}`;

    const device = await Device.create({
      name: deviceName,
      type,
      zone: zone._id,
      powerConsumption,
      specificCode
    });

    await createAuditLog({
      req,
      actionType: 'DEVICE_CONTROL',
      entityType: 'Device',
      entityId: device._id.toString(),
      entityName: device.name,
      description: 'Created device',
      meta: {
        type: device.type,
        zone: device.zone,
        specificCode: device.specificCode,
        powerConsumption: device.powerConsumption,
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        device
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating device',
      error: error.message
    });
  }
};

export const deleteDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const device = await Device.findByIdAndDelete(deviceId);

    if (!device) {
      return res.status(404).json({
        status: 'error',
        message: 'Device not found'
      });
    }

    // Audit log for device deletion
    await createAuditLog({
      req,
      actionType: 'DEVICE_CONTROL',
      entityType: 'Device',
      entityId: device._id.toString(),
      entityName: device.name,
      description: 'Deleted device',
      meta: {
        type: device.type,
        zone: device.zone,
        specificCode: device.specificCode,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Device deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting device',
      error: error.message
    });
  }
};

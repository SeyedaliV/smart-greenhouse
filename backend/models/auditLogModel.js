import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // allow system actions
    },
    username: {
      type: String,
      required: false,
    },
    actionType: {
      type: String,
      enum: [
        'DEVICE_CONTROL',
        'PLANT_CREATE',
        'PLANT_UPDATE',
        'PLANT_DELETE',
        'ZONE_CREATE',
        'ZONE_UPDATE',
        'ZONE_DELETE',
        'SENSOR_UPDATE',
        'ALERT_RESOLVE',
        'ALERT_ACK',
        'SEED_RUN',
        'LOGIN',
      ],
      required: true,
    },
    entityType: {
      type: String,
      enum: ['Device', 'Plant', 'Zone', 'Sensor', 'Alert', 'System', 'User'],
      required: true,
    },
    entityId: {
      type: String,
      required: false,
    },
    entityName: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;



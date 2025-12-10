import AuditLog from '../models/auditLogModel.js';

// Helper used by other controllers to write an audit record
export const createAuditLog = async ({
  req,
  actionType,
  entityType,
  entityId,
  entityName,
  description,
  meta = {},
}) => {
  try {
    const user = req?.user;
    await AuditLog.create({
      user: user?._id,
      username: user?.username,
      actionType,
      entityType,
      entityId,
      entityName,
      description,
      meta,
      ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
  } catch (err) {
    // For a student project we only log this on server and don't fail the main request
    console.error('Audit log error:', err.message);
  }
};

// List logs for the UI (with basic filtering)
export const getAuditLogs = async (req, res) => {
  try {
    const { actionType, entityType } = req.query;

    const filter = {};
    if (actionType) filter.actionType = actionType;
    if (entityType) filter.entityType = entityType;

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(200);

    res.status(200).json({
      status: 'success',
      results: logs.length,
      data: {
        logs,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching audit logs',
      error: error.message,
    });
  }
};

// Delete all audit logs
export const deleteAllLogs = async (req, res) => {
  try {
    const result = await AuditLog.deleteMany({});

    // Log this action
    await createAuditLog({
      req,
      actionType: 'SYSTEM_MAINTENANCE',
      entityType: 'AuditLog',
      entityId: null,
      entityName: 'All Logs',
      description: `Deleted ${result.deletedCount} audit log entries`,
      meta: {
        deletedCount: result.deletedCount
      },
    });

    res.status(200).json({
      status: 'success',
      message: `Successfully deleted ${result.deletedCount} logs`,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting audit logs',
      error: error.message,
    });
  }
};

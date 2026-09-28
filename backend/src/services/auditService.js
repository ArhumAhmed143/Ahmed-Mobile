const { AuditLog } = require('../models');

const fallbackAuditLogs = [];

async function logAdminAction({ adminId = 'system', action, entityType, entityId, details = '' }) {
  try {
    return await AuditLog.create({
      admin_id: String(adminId),
      action,
      entity_type: entityType,
      entity_id: String(entityId),
      details
    });
  } catch (error) {
    const entry = {
      admin_id: String(adminId),
      action,
      entity_type: entityType,
      entity_id: String(entityId),
      details,
      created_at: new Date().toISOString()
    };
    fallbackAuditLogs.push(entry);
    return entry;
  }
}

module.exports = { logAdminAction, fallbackAuditLogs };
'use strict';
// Server integration helper only. Do not include in the static page.
// Call only after a verified form/LINE/CRM change has been durably saved.
const { createHash } = require('node:crypto');
const stages = Object.freeze({
  consultation_received: 'generate_lead',
  qualified: 'qualify_lead',
  won: 'close_convert_lead',
});

function buildLeadEvent(record, now = Date.now()) {
  if (!record || record.analyticsAllowed !== true) throw new Error('analytics_permission_required');
  const name = stages[record.stage];
  if (!name) throw new Error('unknown_lead_stage');
  // CRM-specific random opaque key, NOT a LINE ID, name, email, phone or message.
  if (!/^[a-z0-9-]{16,80}$/i.test(record.leadKey || '')) throw new Error('opaque_lead_key_required');
  if (!/^\d+\.\d+$/.test(record.clientId || '')) throw new Error('verified_ga_client_id_required');
  if (!Number.isFinite(record.occurredAt) || record.occurredAt > now || now - record.occurredAt > 72 * 3600000) {
    throw new Error('recent_recorded_timestamp_required');
  }
  const eventId = createHash('sha256').update(`bangkok_manga:v1:${record.leadKey}:${record.stage}`).digest('hex');
  const params = {
    event_id: eventId,
    page_id: 'bangkok_manga',
    environment: 'test',
    lead_source: 'bangkok_manga',
    offer_id: 'lp_outline_main_visual_rough',
  };
  // Never invent a monetary value. A real documented amount is optional.
  if (record.value !== undefined) {
    if (!Number.isFinite(record.value) || record.value < 0 || record.currency !== 'THB') throw new Error('invalid_actual_value');
    params.value = record.value;
    params.currency = 'THB';
  }
  return Object.freeze({
    // Use this as a UNIQUE key in the server outbox before sending.
    idempotencyKey: eventId,
    payload: {
      client_id: record.clientId,
      timestamp_micros: Math.round(record.occurredAt * 1000),
      events: [{ name, params }],
    },
  });
}

module.exports = { buildLeadEvent };

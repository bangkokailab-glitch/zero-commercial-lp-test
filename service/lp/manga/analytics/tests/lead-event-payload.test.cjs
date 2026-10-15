'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildLeadEvent } = require('../server/lead-event-payload.cjs');
const now = 1760000000000;
const base = { stage: 'consultation_received', leadKey: 'aaaaaabb-bbbb-4ccc-8ddd-eeeeeeeeeeee', analyticsAllowed: true,
  clientId: '12345.67890', occurredAt: now - 1000 };

test('three actual CRM milestones use recommended event names, stable dedup keys and allowlisted fields', () => {
  const results = ['consultation_received', 'qualified', 'won'].map(stage => buildLeadEvent({ ...base, stage,
    email: 'private@example.com', message: 'private conversation', phone: '0123456789' }, now));
  assert.deepEqual(results.map(result => result.payload.events[0].name), ['generate_lead', 'qualify_lead', 'close_convert_lead']);
  assert.equal(new Set(results.map(result => result.idempotencyKey)).size, 3);
  assert.equal(results[0].idempotencyKey, buildLeadEvent(base, now).idempotencyKey);
  assert.ok(!JSON.stringify(results).includes('private'));
  assert.ok(!JSON.stringify(results).includes('0123456789'));
  assert.ok(!JSON.stringify(results).includes(base.leadKey));
  assert.equal(results[0].payload.timestamp_micros, base.occurredAt * 1000);
  assert.equal(results[0].payload.events[0].params.value, undefined);
});

test('unconfirmed permission/attribution, PII-shaped keys, invalid stage/time/value are rejected', () => {
  const invalids = [
    { analyticsAllowed: false }, { analyticsAllowed: undefined }, { clientId: '' }, { clientId: 'user@example.com' },
    { leadKey: 'user@example.com' }, { stage: 'cta_click' }, { occurredAt: now + 1 },
    { occurredAt: now - 73 * 3600000 }, { value: -1, currency: 'THB' }, { value: 70000, currency: 'USD' },
  ];
  invalids.forEach(delta => assert.throws(() => buildLeadEvent({ ...base, ...delta }, now)));
  const won = buildLeadEvent({ ...base, stage: 'won', value: 70000, currency: 'THB' }, now);
  assert.equal(won.payload.events[0].params.value, 70000);
});

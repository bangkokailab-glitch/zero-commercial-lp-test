-- PostgreSQL example for the FUTURE authenticated CRM/form integration.
-- Not a deployed database; not a public browser endpoint.
CREATE TABLE manga_lead_event_outbox (
  idempotency_key text PRIMARY KEY,
  event_name text NOT NULL CHECK (event_name IN ('generate_lead', 'qualify_lead', 'close_convert_lead')),
  payload jsonb NOT NULL,
  delivery_state text NOT NULL DEFAULT 'pending'
    CHECK (delivery_state IN ('pending', 'sending', 'delivered', 'failed', 'uncertain')),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz
);
-- Insert in the SAME transaction as the verified lead-stage update:
-- INSERT INTO manga_lead_event_outbox (idempotency_key, event_name, payload)
-- VALUES ($1, $2, $3) ON CONFLICT (idempotency_key) DO NOTHING;
-- Claim pending rows atomically (FOR UPDATE SKIP LOCKED); repeated webhooks
-- therefore do not enqueue repeated milestones. A transport timeout has an
-- unknown delivery outcome: mark uncertain, do not blindly resend.

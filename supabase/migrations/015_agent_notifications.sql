-- =============================================
-- AGENT NOTIFICATIONS
-- Migration: 015_agent_notifications.sql
--
-- 1. Extend notifications.type CHECK to include agent-specific types
-- 2. Add trigger: notify assigned agent when a lead is created/assigned
-- 3. Add trigger: notify agent when an appointment is created
-- =============================================

-- ─── 1. Extend the type enum ──────────────────────────────────────────────────
-- Drop the existing CHECK constraint and replace with one that includes
-- the new agent-specific types (lead, appointment, commission, client_update).

ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'message',
    'inquiry',
    'review',
    'property_update',
    'system',
    'lead',
    'appointment',
    'commission',
    'client_update'
  ));

-- ─── 2. New-lead-assigned notification trigger ────────────────────────────────
-- Fires on INSERT into leads (when a lead is first created with an assigned agent)
-- and on UPDATE when assigned_to changes (reassignment).

CREATE OR REPLACE FUNCTION notify_on_lead_assigned()
RETURNS TRIGGER AS $$
DECLARE
  v_agent_user_id UUID;
  v_lead_type_label TEXT;
  v_urgency_note TEXT;
BEGIN
  -- Only proceed if there is an assigned agent
  IF NEW.assigned_to IS NULL THEN
    RETURN NEW;
  END IF;

  -- On UPDATE: only proceed if the assignment actually changed
  IF TG_OP = 'UPDATE' AND OLD.assigned_to = NEW.assigned_to THEN
    RETURN NEW;
  END IF;

  -- Resolve the agent's profile (user) id from the agents table
  SELECT user_id INTO v_agent_user_id
  FROM agents
  WHERE id = NEW.assigned_to;

  IF v_agent_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Human-readable lead type
  v_lead_type_label := CASE NEW.lead_type
    WHEN 'buyer_lead'          THEN 'Buyer Lead'
    WHEN 'seller_lead'         THEN 'Seller Lead'
    WHEN 'rental_lead'         THEN 'Rental Lead'
    WHEN 'property_valuation'  THEN 'Valuation Request'
    WHEN 'general_inquiry'     THEN 'General Inquiry'
    ELSE 'New Lead'
  END;

  -- Urgency note: agents have 5 minutes to claim
  v_urgency_note := 'You have 5 minutes to claim this lead.';

  PERFORM create_notification(
    v_agent_user_id,
    'lead',
    v_lead_type_label || ' Assigned to You',
    COALESCE(NEW.contact_name, 'Someone') || ' needs help. ' || v_urgency_note,
    '/agent/leads',
    jsonb_build_object(
      'lead_id',    NEW.id,
      'lead_type',  NEW.lead_type,
      'lead_score', NEW.lead_score,
      'claim_deadline_at', NEW.claim_deadline_at
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach the trigger to the leads table
DROP TRIGGER IF EXISTS trg_notify_on_lead_assigned ON leads;
CREATE TRIGGER trg_notify_on_lead_assigned
  AFTER INSERT OR UPDATE OF assigned_to
  ON leads
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_lead_assigned();

-- ─── 3. New-appointment notification trigger ──────────────────────────────────
-- Fires on INSERT into appointments to notify the agent.

CREATE OR REPLACE FUNCTION notify_on_appointment_created()
RETURNS TRIGGER AS $$
DECLARE
  v_agent_user_id UUID;
  v_appt_type_label TEXT;
  v_appt_date TEXT;
BEGIN
  -- Resolve agent user_id
  SELECT user_id INTO v_agent_user_id
  FROM agents
  WHERE id = NEW.agent_id;

  IF v_agent_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  v_appt_type_label := CASE NEW.appointment_type
    WHEN 'tour'         THEN 'Property Tour'
    WHEN 'open_house'   THEN 'Open House'
    WHEN 'consultation' THEN 'Consultation'
    WHEN 'meeting'      THEN 'Meeting'
    WHEN 'inspection'   THEN 'Inspection'
    WHEN 'appraisal'    THEN 'Appraisal'
    ELSE 'Appointment'
  END;

  v_appt_date := TO_CHAR(NEW.scheduled_at AT TIME ZONE 'UTC', 'Mon DD, YYYY at HH12:MI AM');

  PERFORM create_notification(
    v_agent_user_id,
    'appointment',
    v_appt_type_label || ' Scheduled',
    COALESCE(NEW.title, v_appt_type_label) || ' on ' || v_appt_date,
    '/agent/calendar',
    jsonb_build_object(
      'appointment_id',   NEW.id,
      'appointment_type', NEW.appointment_type,
      'scheduled_at',     NEW.scheduled_at,
      'client_id',        NEW.client_id,
      'property_id',      NEW.property_id
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_on_appointment_created ON appointments;
CREATE TRIGGER trg_notify_on_appointment_created
  AFTER INSERT
  ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_appointment_created();

-- ─── 4. Appointment status-change notification ────────────────────────────────
-- Notifies the agent when an appointment is confirmed or cancelled to keep
-- them in the loop on status changes they didn't make themselves.

CREATE OR REPLACE FUNCTION notify_on_appointment_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_agent_user_id UUID;
  v_title TEXT;
  v_description TEXT;
BEGIN
  -- Ignore if status didn't change
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Only care about confirmed and cancelled
  IF NEW.status NOT IN ('confirmed', 'cancelled', 'no_show') THEN
    RETURN NEW;
  END IF;

  SELECT user_id INTO v_agent_user_id
  FROM agents
  WHERE id = NEW.agent_id;

  IF v_agent_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  v_title := CASE NEW.status
    WHEN 'confirmed'  THEN 'Appointment Confirmed'
    WHEN 'cancelled'  THEN 'Appointment Cancelled'
    WHEN 'no_show'    THEN 'No-Show Recorded'
    ELSE 'Appointment Update'
  END;

  v_description := COALESCE(NEW.title, 'Appointment') || ' status changed to ' || NEW.status;

  PERFORM create_notification(
    v_agent_user_id,
    'appointment',
    v_title,
    v_description,
    '/agent/calendar',
    jsonb_build_object(
      'appointment_id',   NEW.id,
      'appointment_type', NEW.appointment_type,
      'scheduled_at',     NEW.scheduled_at,
      'new_status',       NEW.status
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_on_appointment_status_change ON appointments;
CREATE TRIGGER trg_notify_on_appointment_status_change
  AFTER UPDATE OF status
  ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_appointment_status_change();

import { NextRequest, NextResponse } from "next/server";

const FALLBACK_OWNER = "bookkit-demo-owner";

function ownerEmail(request: NextRequest) {
  return request.headers.get("oai-authenticated-user-email") || FALLBACK_OWNER;
}

export async function GET(request: NextRequest) {
  const { env } = await import("cloudflare:workers");
  const owner = ownerEmail(request);
  const profile = await env.DB.prepare(
    "SELECT * FROM business_profiles WHERE owner_email = ? LIMIT 1",
  ).bind(owner).first();
  const appointmentRows = await env.DB.prepare(
    "SELECT * FROM appointments WHERE owner_email = ? ORDER BY appointment_date, start_time",
  ).bind(owner).all();
  const paymentAccount = await env.DB.prepare(
    "SELECT * FROM payment_accounts WHERE owner_email = ? LIMIT 1",
  ).bind(owner).first();
  const transactionRows = await env.DB.prepare(
    "SELECT * FROM payment_transactions WHERE owner_email = ? ORDER BY created_at DESC LIMIT 20",
  ).bind(owner).all();
  const schedulingSettings = await env.DB.prepare(
    "SELECT * FROM scheduling_settings WHERE owner_email = ? LIMIT 1",
  ).bind(owner).first();
  return NextResponse.json({
    profile,
    appointments: appointmentRows.results,
    paymentAccount,
    transactions: transactionRows.results,
    schedulingSettings,
  });
}

export async function POST(request: NextRequest) {
  const { env } = await import("cloudflare:workers");
  const owner = ownerEmail(request);
  const body = await request.json() as Record<string, unknown>;
  const now = new Date().toISOString();

  if (body.type === "profile") {
    const profile = body.profile as Record<string, unknown>;
    const id = `profile:${owner}`;
    await env.DB.prepare(
      `INSERT INTO business_profiles
        (id, owner_email, business_name, tagline, slug, template, brand_color, background, sections_json, published, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
        business_name = excluded.business_name,
        tagline = excluded.tagline,
        slug = excluded.slug,
        template = excluded.template,
        brand_color = excluded.brand_color,
        background = excluded.background,
        sections_json = excluded.sections_json,
        published = excluded.published,
        updated_at = excluded.updated_at`,
    ).bind(
      id,
      owner,
      String(profile.businessName || "Your Business"),
      String(profile.tagline || ""),
      String(profile.slug || "your-business"),
      String(profile.template || "Editorial"),
      String(profile.brandColor || "#4464e7"),
      String(profile.background || "light"),
      JSON.stringify(profile.sections || []),
      profile.published ? 1 : 0,
      now,
    ).run();
    return NextResponse.json({ ok: true, savedAt: now });
  }

  if (body.type === "appointment") {
    const appointment = body.appointment as Record<string, unknown>;
    const id = crypto.randomUUID();
    const manageToken = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
    const clientName = String(appointment.client || "Client").trim();
    const clientEmail = String(appointment.email || "").trim().toLowerCase();
    const clientPhone = String(appointment.phone || "").trim();
    const notes = String(appointment.notes || "").trim();
    try {
      await env.DB.prepare(
      `INSERT INTO appointments
        (id, owner_email, client_name, client_email, client_phone, service_name, appointment_date, start_time, status, manage_token, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      id,
      owner,
      clientName,
      clientEmail,
      clientPhone,
      appointment.service,
      appointment.date,
      appointment.time,
      "Confirmed",
      manageToken,
      notes,
      now,
      now,
    ).run();
    } catch (error) {
      if (String(error).toLowerCase().includes("unique")) {
        return NextResponse.json({ ok: false, error: "That time was just booked. Please choose another opening." }, { status: 409 });
      }
      throw error;
    }
    const actions = [
      env.DB.prepare(
        `INSERT INTO appointment_events (id, appointment_id, owner_email, event_type, event_data_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      ).bind(crypto.randomUUID(), id, owner, "booked", JSON.stringify({ date: appointment.date, time: appointment.time }), now),
    ];
    if (clientEmail) {
      actions.push(env.DB.prepare(
        `INSERT INTO clients (id, owner_email, email, phone, name, notes, visit_count, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
         ON CONFLICT(owner_email, email) DO UPDATE SET
          phone = excluded.phone, name = excluded.name, notes = excluded.notes,
          visit_count = clients.visit_count + 1, updated_at = excluded.updated_at`,
      ).bind(crypto.randomUUID(), owner, clientEmail, clientPhone, clientName, notes, now, now));
      actions.push(env.DB.prepare(
        `INSERT INTO notification_outbox
          (id, appointment_id, owner_email, channel, template, recipient, status, scheduled_for, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(crypto.randomUUID(), id, owner, "email", "booking_confirmation", clientEmail, "pending_provider", now, now));
    }
    if (clientPhone) {
      actions.push(env.DB.prepare(
        `INSERT INTO notification_outbox
          (id, appointment_id, owner_email, channel, template, recipient, status, scheduled_for, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(crypto.randomUUID(), id, owner, "sms", "booking_confirmation", clientPhone, "pending_provider", now, now));
    }
    await env.DB.batch(actions);
    return NextResponse.json({ ok: true, id, manageToken, createdAt: now });
  }

  if (body.type === "manage_appointment") {
    const token = String(body.manageToken || "");
    const action = String(body.action || "");
    const existing = await env.DB.prepare(
      "SELECT * FROM appointments WHERE manage_token = ? LIMIT 1",
    ).bind(token).first<Record<string, unknown>>();
    if (!existing) return NextResponse.json({ ok: false, error: "This manage-booking link is invalid." }, { status: 404 });
    if (action === "cancel") {
      if (existing.status === "Cancelled") return NextResponse.json({ ok: true, status: "Cancelled" });
      await env.DB.batch([
        env.DB.prepare(
          "UPDATE appointments SET status = 'Cancelled', cancellation_reason = ?, updated_at = ? WHERE id = ?",
        ).bind(String(body.reason || "Cancelled by client"), now, existing.id),
        env.DB.prepare(
          `INSERT INTO appointment_events (id, appointment_id, owner_email, event_type, event_data_json, created_at)
           VALUES (?, ?, ?, 'cancelled', ?, ?)`,
        ).bind(crypto.randomUUID(), existing.id, existing.owner_email, JSON.stringify({ reason: body.reason || "Cancelled by client" }), now),
      ]);
      return NextResponse.json({ ok: true, status: "Cancelled" });
    }
    if (action === "reschedule") {
      const date = String(body.date || "");
      const time = String(body.time || "");
      try {
        await env.DB.prepare(
          "UPDATE appointments SET appointment_date = ?, start_time = ?, status = 'Confirmed', updated_at = ? WHERE id = ?",
        ).bind(date, time, now, existing.id).run();
      } catch (error) {
        if (String(error).toLowerCase().includes("unique")) {
          return NextResponse.json({ ok: false, error: "That new time is no longer open." }, { status: 409 });
        }
        throw error;
      }
      await env.DB.prepare(
        `INSERT INTO appointment_events (id, appointment_id, owner_email, event_type, event_data_json, created_at)
         VALUES (?, ?, ?, 'rescheduled', ?, ?)`,
      ).bind(crypto.randomUUID(), existing.id, existing.owner_email, JSON.stringify({ date, time }), now).run();
      return NextResponse.json({ ok: true, status: "Confirmed", date, time });
    }
    return NextResponse.json({ ok: false, error: "Unknown appointment action." }, { status: 400 });
  }

  if (body.type === "payment_account") {
    const settings = body.settings as Record<string, unknown>;
    const id = `payments:${owner}`;
    await env.DB.prepare(
      `INSERT INTO payment_accounts
        (id, owner_email, provider, mode, onboarding_status, payouts_enabled, default_payment_rule, default_deposit_amount, cancellation_window_hours, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
        mode = excluded.mode,
        onboarding_status = excluded.onboarding_status,
        payouts_enabled = excluded.payouts_enabled,
        default_payment_rule = excluded.default_payment_rule,
        default_deposit_amount = excluded.default_deposit_amount,
        cancellation_window_hours = excluded.cancellation_window_hours,
        updated_at = excluded.updated_at`,
    ).bind(
      id,
      owner,
      "stripe_connect",
      "test",
      String(settings.onboardingStatus || "test_ready"),
      settings.payoutsEnabled ? 1 : 0,
      String(settings.paymentRule || "fixed_deposit"),
      Number(settings.depositAmount || 3000),
      Number(settings.cancellationHours || 24),
      now,
    ).run();
    return NextResponse.json({ ok: true, savedAt: now });
  }

  if (body.type === "test_payment") {
    const payment = body.payment as Record<string, unknown>;
    const id = crypto.randomUUID();
    const reference = `test_${crypto.randomUUID().replaceAll("-", "").slice(0, 18)}`;
    await env.DB.prepare(
      `INSERT INTO payment_transactions
        (id, owner_email, client_name, service_name, kind, status, amount, tip_amount, provider_reference, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      id,
      owner,
      String(payment.clientName || "Demo client"),
      String(payment.serviceName || "Service deposit"),
      String(payment.kind || "Deposit"),
      "succeeded_test",
      Number(payment.amount || 3000),
      Number(payment.tipAmount || 0),
      reference,
      now,
    ).run();
    return NextResponse.json({ ok: true, id, reference, createdAt: now });
  }

  if (body.type === "scheduling_settings") {
    const settings = body.settings as Record<string, unknown>;
    const id = `scheduling:${owner}`;
    await env.DB.prepare(
      `INSERT INTO scheduling_settings
        (id, owner_email, google_calendar, outlook_calendar, prevent_conflicts, email_confirmation, sms_confirmation, reminder_24h, reminder_2h, client_reschedule, client_cancel, minimum_notice_hours, booking_window_days, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
        google_calendar = excluded.google_calendar,
        outlook_calendar = excluded.outlook_calendar,
        prevent_conflicts = excluded.prevent_conflicts,
        email_confirmation = excluded.email_confirmation,
        sms_confirmation = excluded.sms_confirmation,
        reminder_24h = excluded.reminder_24h,
        reminder_2h = excluded.reminder_2h,
        client_reschedule = excluded.client_reschedule,
        client_cancel = excluded.client_cancel,
        minimum_notice_hours = excluded.minimum_notice_hours,
        booking_window_days = excluded.booking_window_days,
        updated_at = excluded.updated_at`,
    ).bind(
      id, owner,
      settings.googleCalendar ? 1 : 0,
      settings.outlookCalendar ? 1 : 0,
      settings.preventConflicts ? 1 : 0,
      settings.emailConfirmation ? 1 : 0,
      settings.smsConfirmation ? 1 : 0,
      settings.reminder24h ? 1 : 0,
      settings.reminder2h ? 1 : 0,
      settings.clientReschedule ? 1 : 0,
      settings.clientCancel ? 1 : 0,
      Number(settings.minimumNoticeHours || 24),
      Number(settings.bookingWindowDays || 90),
      now,
    ).run();
    return NextResponse.json({ ok: true, savedAt: now });
  }

  return NextResponse.json({ ok: false, error: "Unknown operation." }, { status: 400 });
}

# BookKit Booking Engine — Build Spec (v1)

Scope: the **booking core only** — the thing every profession runs on. Payments beyond deposits, inventory, marketing, and POS are explicitly out of scope for v1 and slot in later behind the same data model. This spec is what a developer needs to build the engine the prototypes demonstrate.

Companion doc: `services-research.md` (per-trade durations, add-ons, deposit norms) defines the seed data. This spec defines the machinery.

---

## 1. Architecture principle
Three layers, so professions are **configuration, not forks**:

1. **Engine (this spec)** — availability, appointments, staff/resources, deposits, intake, reminders. Trade-agnostic.
2. **Profession pack** — a data record per trade (services, add-ons, flags, theme, template). No engine code.
3. **Presentation** — client booking flow + owner booking desk, both reading the engine.

A new trade = new pack + template. If building an 11th profession touches engine code, the abstraction leaked.

---

## 2. Data model

```
Business
  id, name, slug, timezone, professionPackId
  hours: [{ dow, open, close }]        // per weekday, supports splits
  bufferDefaultMin                      // padding after appointments

Resource (staff OR chair/room/table — same primitive)
  id, businessId, name, type: 'staff'|'station'
  workingHours (optional override of business hours)
  services: [serviceId]                 // what this resource can perform

Service
  id, businessId, name, category
  durationMin                           // realistic, incl. cleanup
  price | priceFrom                     // fixed or "from"
  depositType: 'none'|'fixed'|'percent'
  depositValue
  requiresConsult: bool                 // gates booking behind a consult
  requiresUpload: bool
  addonIds: [addonId]
  bookableBy: [resourceId] | 'any'

Addon
  id, name
  extraMin                              // changes reserved time
  extraPrice
  // e.g. nail removal +20min, braid color +$10, lashes +15min

Appointment
  id, businessId, clientId, serviceId, resourceId
  addonIds: []
  start, end (UTC)                      // end = start + service.dur + Σ addon.extraMin
  status: 'pending'|'confirmed'|'checked_in'|'completed'|'no_show'|'cancelled'
  deposit: { required, amount, status: 'none'|'held'|'paid'|'forfeited' }
  intake: { ...profession fields }
  uploads: [url]
  source: 'online'|'walk_in'|'staff'

Client
  id, businessId, name, phone, email
  history: [appointmentId]
  noShowCount

ConsultationLink (for consult-gated services)
  consultAppointmentId -> mainServiceId  // main booked only after consult
```

**Key derived rule:** an appointment's `end` is always `start + service.durationMin + Σ(addon.extraMin)`. The calendar reserves that full block. This is why add-ons must be structured data, not free text — they change the block the engine holds.

---

## 3. Availability algorithm (the heart)
Given: `serviceId`, optional `resourceId` (or 'any'), a date, and the client's timezone.

```
duration = service.durationMin + Σ selected addon.extraMin
candidates = []
for each resource that can perform service (or the one requested):
  windows = resource working hours ∩ business hours for that date
  existing = confirmed/pending appointments for that resource that date
  for slot = window.start; slot + duration <= window.end; slot += granularity (15m):
     block = [slot, slot + duration + buffer]
     if block does not overlap any existing appointment (incl. their buffers)
        and slot >= now + minLeadTime
        candidates.push({ start: slot, resourceId })
merge across resources by start time (first available resource wins for 'any')
return candidates in the client's timezone
```

Requirements:
- **Timezone:** store UTC, resolve to client tz for display, echo tz explicitly in UI and confirmations. Never rely on server-local time.
- **Buffer:** every reserved block includes `bufferDefaultMin` after, so back-to-backs don't cascade.
- **Min lead time:** configurable (e.g. no bookings within 1 hr).
- **Sync latency target:** external calendar/hold changes reflected in < 2 min to avoid double-booking.
- **Concurrency:** last-write-wins is not acceptable for booking; use a short hold/lock on the slot during checkout (e.g. 5-min soft hold) and confirm against live state on commit.

---

## 4. Booking flow (client-facing)
Order, matching the prototypes: **service → [consult gate] → staff → time → intake → confirm/deposit → booked.**

1. **Service** — from the pack; shows duration + price/from.
2. **Consult gate** — if `service.requiresConsult`, the client books a *consultation* now; the main appointment is created in `pending` and linked, scheduled after the consult. (Tattoo custom, loctician starter/instant/extensions.)
3. **Staff** — 'Any available' or a specific resource; availability computed per §3.
4. **Time** — only genuinely bookable slots for the chosen duration; show scarcity when few remain; graying a taken slot must explain and offer the next open one.
5. **Intake** — profession fields from the pack (see §6). Required intake blocks progress; style-detail intake doesn't.
6. **Confirm + deposit** — if `depositType != none`, collect deposit (fixed or % of price/estimate); show it's applied to balance and the cancellation terms; capture consent.
7. **Booked** — confirmation with code, tz-explicit time, deposit paid / balance due, and reminder schedule. Fire confirmation immediately.

**No-show protection built in:** deposit hold where configured, plus the reminder schedule below.

---

## 5. Owner booking desk (staff-facing)
Reads the same engine. Must support:
- **Proportional day grid**, one lane per resource, appointments sized by true duration, live "now" bar.
- **Actions:** new appointment (runs the flow), block time (non-bookable), check-in, mark no-show (→ increments `client.noShowCount`, frees/holds slot per policy), reschedule (drag; validate against §3 — reject if it doesn't fit + buffer).
- **Walk-in:** quick-add on the current resource at now.
- **Find opening:** first slot ≥ now across resources (§3).
- **Live stats** derived from appointments: utilization, upcoming count, no-show watch (new/unconfirmed clients), first opening.

---

## 6. Profession pack schema
```
ProfessionPack {
  id, name, icon, theme{bg,fg,accent,...}, templateId,
  services: [Service defaults],           // from services-research.md
  addons:   [Addon defaults],
  flags: {
    walkIns, recurring, progressPhotos, measurements,
    depositDefault: 'none'|'fixed'|'percent', depositValueDefault,
    consultDefault: bool,                 // gate services by default
    intakeRequired: bool                  // health/consent blocking
  },
  intakeFields: [ {id,label,type:'chip'|'chipmulti'|'text',opts?,required} ],
  gallery: { groupBy: 'style'|'length'|'artist' },
  reminderLeadDefault: '2h'|'1d'|'2d'
}
```
Seed all 10 from the research doc. Defaults per trade (deposit posture, consult gate, required intake, recurring model, reminder lead) are tabulated at the end of `services-research.md`.

---

## 7. Reminders & notifications
- **Confirmation:** immediately, SMS + email.
- **Reminder:** SMS the configured lead before (default 1 day; 2 days for events like tattoo/makeup; 2 hours for barber). SMS is the highest-impact no-show reducer — on by default.
- **Follow-up (optional):** rebook nudge for recurring trades (barber, loc retwist, nail fills, spa membership).
- SMS costs money — meter it; make the included allotment explicit, don't sell "reminders" that are email-only.

---

## 8. Deposits (v1 payment scope)
Only deposits are in scope for payments in v1.
- Support **fixed** and **percent-of-estimate**; percent needed for tattoo custom.
- **Non-refundable within the cancellation window** (default 48 hr; tattoo 48–72); applied to final balance; configurable forfeiture on no-show / late / major-change.
- Deposit `status` lifecycle: `held → paid` (on completion) or `forfeited`.
- Validity window (e.g. 12 months) and non-transferable flag for tattoo.

---

## 9. Acceptance criteria
1. Selecting a service + add-ons reserves a block equal to duration + add-on minutes + buffer; the grid and availability both reflect it.
2. 'Any available' returns the first free resource; a taken slot is never offered.
3. Timezone: a booking made in another tz shows the correct local time in both the client confirmation and the owner grid.
4. Consult-gated services can't be finally booked until the consult exists.
5. Required intake blocks confirmation; deposit is enforced when the pack/service says so.
6. Marking no-show frees the slot per policy and updates stats and `noShowCount`.
7. Reschedule that doesn't fit an opening (with buffer) is rejected with a reason.
8. Adding an 11th profession requires only a new pack + template — no engine edits.

---

## 10. Build order
1. Data model + timezone-correct storage (UTC).
2. Availability algorithm (§3) with buffer + lead time — unit-tested against overlap cases.
3. Booking flow API (service → time → intake → confirm) with soft-hold on checkout.
4. Deposit handling (fixed + percent, forfeiture rules).
5. Reminder scheduler (confirmation + lead-time SMS/email).
6. Owner desk grid + actions reading the same engine.
7. Pack loader; seed all 10 from the research doc.
8. Publish client booking page at `{slug}.domain`.

The prototypes (`booking-desk-flow.html`, `calendar.html`, `intake-step.html`) are the reference for how each of these should feel; this spec is what makes them real.

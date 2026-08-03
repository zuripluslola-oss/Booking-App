import test from "node:test";
import assert from "node:assert/strict";
import { availableSlots, depositCents, overlaps, reservedMinutes } from "../app/lib/booking-engine.mjs";

test("service add-ons and buffer reserve the full block", () => {
  assert.equal(reservedMinutes({ durationMinutes: 60 }, [{ durationMinutes: 20 }], 15), 95);
});

test("adjacent appointments do not overlap", () => {
  assert.equal(overlaps(0, 60, 60, 120), false);
  assert.equal(overlaps(0, 61, 60, 120), true);
});

test("availability excludes conflicts and preserves service end separately from buffer", () => {
  const slots = availableSlots({
    windowStart: "2026-08-03T13:00:00.000Z",
    windowEnd: "2026-08-03T17:00:00.000Z",
    service: { durationMinutes: 60 },
    bufferMinutes: 15,
    granularityMinutes: 30,
    appointments: [{ startsAt: "2026-08-03T14:00:00.000Z", endsAt: "2026-08-03T15:00:00.000Z", status: "confirmed" }],
  });
  assert.deepEqual(slots.map((slot) => slot.startsAt), ["2026-08-03T15:00:00.000Z", "2026-08-03T15:30:00.000Z"]);
  assert.equal(slots[0].endsAt, "2026-08-03T16:00:00.000Z");
  assert.equal(slots[0].reservedUntil, "2026-08-03T16:15:00.000Z");
});

test("cancelled and no-show appointments release their slots", () => {
  const common = { windowStart: "2026-08-03T13:00:00Z", windowEnd: "2026-08-03T14:00:00Z", service: { durationMinutes: 60 } };
  for (const status of ["cancelled", "no_show"]) {
    assert.equal(availableSlots({ ...common, appointments: [{ startsAt: common.windowStart, endsAt: common.windowEnd, status }] }).length, 1);
  }
});

test("fixed and percentage deposits are capped at the service price", () => {
  assert.equal(depositCents({ priceCents: 10000, depositType: "percent", depositValue: 25 }), 2500);
  assert.equal(depositCents({ priceCents: 10000, depositType: "fixed", depositValue: 12000 }), 10000);
});

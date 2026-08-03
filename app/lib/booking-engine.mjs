/** Trade-agnostic booking calculations shared by every profession pack. */

export function reservedMinutes(service, addons = [], bufferMinutes = 0) {
  const duration = Number(service.durationMinutes || 0);
  const addonMinutes = addons.reduce(
    (total, addon) => total + Number(addon.durationMinutes || 0),
    0,
  );
  return duration + addonMinutes + Number(bufferMinutes || 0);
}

export function overlaps(leftStart, leftEnd, rightStart, rightEnd) {
  return leftStart < rightEnd && rightStart < leftEnd;
}

/**
 * Produces UTC slot ranges inside one UTC availability window.
 * The database remains the final concurrency authority; this function is for
 * deterministic display and preflight validation.
 */
export function availableSlots({
  windowStart,
  windowEnd,
  service,
  addons = [],
  bufferMinutes = 0,
  appointments = [],
  blocks = [],
  granularityMinutes = 15,
  minimumStart,
}) {
  const start = new Date(windowStart).getTime();
  const end = new Date(windowEnd).getTime();
  const minimum = minimumStart ? new Date(minimumStart).getTime() : start;
  const slotStep = granularityMinutes * 60_000;
  const serviceMinutes = reservedMinutes(service, addons, 0);
  const reservedMs = reservedMinutes(service, addons, bufferMinutes) * 60_000;
  const busy = [...appointments, ...blocks]
    .filter((item) => !["cancelled", "no_show"].includes(item.status))
    .map((item) => [new Date(item.startsAt).getTime(), new Date(item.endsAt).getTime()]);

  const slots = [];
  for (let candidate = start; candidate + reservedMs <= end; candidate += slotStep) {
    if (candidate < minimum) continue;
    if (busy.some(([busyStart, busyEnd]) => overlaps(candidate, candidate + reservedMs, busyStart, busyEnd))) continue;
    slots.push({
      startsAt: new Date(candidate).toISOString(),
      endsAt: new Date(candidate + serviceMinutes * 60_000).toISOString(),
      reservedUntil: new Date(candidate + reservedMs).toISOString(),
    });
  }
  return slots;
}

export function depositCents(service) {
  const price = Number(service.priceCents || 0);
  if (service.depositType === "fixed") return Math.min(price, Number(service.depositValue || 0));
  if (service.depositType === "percent") {
    return Math.min(price, Math.round(price * Number(service.depositValue || 0) / 100));
  }
  return 0;
}

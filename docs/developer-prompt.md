# Developer Prompt — Profession-Specific Booking Platform

## Core thesis
Ship **profession-specific experiences**, not one generic template everyone customizes. During onboarding the business picks a trade, and the entire experience — onboarding questions, service catalog, booking flow, and site design — reconfigures to that trade. All professions run on **one shared booking engine**; only the profession layer differs.

## Architecture (the key idea)
Separate three layers so professions are *configuration*, not forks:

1. **Booking engine (shared core)** — calendar, availability, staff/resources, deposits, payments, notifications, recurring appointments, intake forms, reviews. Trade-agnostic.
2. **Profession pack (data-driven config)** — a JSON/DB record per trade defining: onboarding questions, default services, gallery taxonomy, required flags (deposit/consultation/intake), theme tokens, template ID, default enabled add-ons.
3. **Template + add-ons (presentation)** — a template component keyed to the profession, plus toggleable enhancement modules.

A new profession = one new pack + one template. No engine changes.

```
ProfessionPack {
  id, name, icon,
  theme: { bg, fg, accent, tileBg, btnFg, radius, fontDisplay, fontBody },
  templateId,
  onboarding: [ { id, label, type: 'single'|'multi', options[], required } ],
  services:  [ { id, name, category, durationMin, price, deposit? } ],
  gallery:   { groupBy: 'style'|'length'|'artist', categories[] },
  flags:     { consultationRequired, depositRequired, intakeForm, walkIns, progressPhotos, measurements },
  defaultAddons: [ addonId... ]
}
```

## Onboarding flow
Step 1 — **Business type** (10 cards, one selection).
Step 2 — **Configure**: render `pack.onboarding` questions dynamically; answers set service defaults + engine flags.
Step 3 — **Design**: live template preview; toggle add-ons on/off; publish.

Answers must drive real behavior, e.g. Tattoo "deposit required = yes" → engine enforces deposit at checkout; Braider "hair included = client brings" → hides add-on-hair line items; Loctician "consultation required" → gates booking behind a consult step.

## The 10 profession packs
| # | Profession | Signature onboarding | Template direction |
|---|-----------|----------------------|--------------------|
| 1 | Barber | fade styles, beard services, walk-in toggle, staff chairs, recurring | dark, masculine, before/after fades |
| 2 | Hair Salon | color/highlights/balayage/blowout/treatment, # stylists, product recs | editorial fashion look |
| 3 | Braider | hair included?, length, braid size, add-on hair, gallery grouping | large hairstyle galleries, braid categories, floating book button |
| 4 | Loctician | consultation, starter/retwist/instant, maintenance plans, progress photos | educational, consultation emphasis, progress timeline |
| 5 | Wig Specialist | customization, measurements, coloring, install, ready-to-ship | product catalog + appointments |
| 6 | Nail Studio | shape, length, art, removal, fill-ins, gel vs acrylic | colorful, visual, trending designs |
| 7 | Esthetician/Spa | facials, skin analysis, peels, waxing, memberships | calm, luxurious, wellness |
| 8 | Massage Therapy | types, pressure, focus areas, medical intake, room selection | serene, clean, calming |
| 9 | Tattoo Studio | consultation required, placement, size estimate, reference uploads, deposit | portfolio-first, artist galleries |
| 10 | Makeup Artist | bridal packages, trials, event bookings, mobile service, travel fees | bridal & event-focused |

## Bells & whistles (per-template optional modules)
Each is an independent, lazy-loaded module toggled per business; store enabled IDs on the site record and render conditionally:
Animated hero · Video background · Before/after slider · Instagram/TikTok feed · Floating "Book Now" · Team intros · FAQ accordion · Promo countdown · Gift cards · Memberships · Loyalty rewards · Testimonials · Live chat · Google Reviews · Maps/directions · Blog/news · Online store · Multi-language.

Each profession pack ships **sensible defaults on** (e.g. barber → floating Book Now + before/after + Google Reviews; wig → online store; loctician → FAQ + blog). Businesses override freely.

## Theming
Drive every template from CSS custom properties in `theme` tokens (bg/fg/accent/tileBg/btnFg/radius/fonts). Templates read tokens only — never hardcode color — so a new profession restyles by swapping the pack, and businesses can nudge tokens without touching template code.

## Build order
1. Booking engine core + data model above.
2. Profession pack schema + admin loader; seed all 10 packs.
3. Dynamic onboarding renderer (reads `pack.onboarding`).
4. Template registry (one component per `templateId`, token-driven).
5. Add-on module system (registry + per-site enable flags + lazy load).
6. Publish pipeline → live site at `{slug}.domain`.

## Acceptance criteria
- Switching profession in onboarding changes questions, seeded services, gallery taxonomy, engine flags, and template design — with no engine code change.
- Add-ons toggle live in preview and persist per site.
- Onboarding answers measurably alter the booking flow (deposit, consult gate, intake, walk-ins).
- Adding an 11th profession requires only a new pack + template, no core edits.

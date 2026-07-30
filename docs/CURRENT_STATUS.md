# BookKit Current Status

Reviewed against branch: `build/stripe-connect-foundation`

Status date: 2026-07-30

## Executive summary

BookKit currently has a substantial interactive front-end proof of concept, an early database schema, Supabase client dependencies, and a draft business-onboarding pull request. It is not yet a production booking platform. The next milestone is to replace demo/local behavior with a secure multi-tenant booking engine and real integrations.

## What currently exists

### Application foundation

- Vinext/Next/React application scaffold
- TypeScript
- Tailwind tooling
- Cloudflare-oriented build setup
- Drizzle ORM and D1-compatible schema foundation
- Supabase browser/SSR dependencies

### Main interactive application

The current `app/page.tsx` is a large all-in-one client component containing much of the product demonstration and service catalog. It includes substantial service data for braiders, weave/wig specialists, barbers, locticians, and universal add-ons, plus interactive booking/business screens.

This is useful as a product prototype, but it should be separated into routes, reusable components, profession-pack configuration, server APIs, and database-backed modules before production.

### Early database schema

The repository currently defines early tables for:

- Business profiles
- Appointments
- Appointment events
- Clients
- Notification outbox
- Payment accounts
- Payment transactions
- Scheduling settings

This establishes the beginning of persistence, payments, communication, and scheduling. The schema is not yet the complete production model required by the booking-engine specification.

### Business onboarding work

Draft pull request #1 adds:

- Business-detail onboarding
- Template selection
- Optional feature switches
- Consultations
- Video consultations
- Approval workflows
- VIP/private bookings
- Group appointments
- Booking from images/videos

The pull request currently changes only `app/business/onboarding/page.tsx` and is still draft/unmerged.

### Locked documentation

- Product vision and phased roadmap
- Booking engine v1 specification
- Profession-specific service research
- Booking Desk direction previously documented

### Uploaded prototype references

The following uploaded prototypes remain authoritative design references and should be carried into implementation:

- Client intake/confirmation flow
- Appointment-linked POS checkout
- Booking Desk/calendar prototype

## What is prototype/demo behavior today

The following must not be described as production-complete yet:

- Stripe Connect onboarding, live charges, refunds, and payouts
- Real card-present or Tap to Pay transactions
- Real email and SMS sending
- Google and Outlook calendar synchronization
- Secure public authentication and account recovery across all roles
- Strong tenant isolation and row-level security
- Database-enforced simultaneous booking protection
- Full availability/resource engine
- Complete cancellation, rescheduling, and no-show enforcement
- Private client uploads and signed-file access
- Tax, tip, receipt, commission, and payout reconciliation
- Verified-review eligibility
- Production reporting and analytics
- Memberships, packages, gift cards, inventory, payroll, and multi-location operations

## Architecture gap

The current application concentrates a large amount of product logic and catalog data in one client page. The locked architecture requires three layers:

1. Shared booking engine
2. Profession packs as configuration
3. Separate client and business presentation layers

The next implementation work should move toward that architecture instead of continuing to add isolated UI inside the main page.

## Recommended immediate milestone

### Production Foundation v1

1. Normalize business, membership, staff/resource, service, add-on, availability, client, appointment, intake, upload, payment, notification, and audit tables.
2. Add business IDs and tenant-safe authorization to every business-owned record.
3. Build the UTC/time-zone-correct availability service.
4. Add database-level overlap protection and temporary slot holds.
5. Implement the complete appointment lifecycle.
6. Connect booking flow and Booking Desk to the same server-side engine.
7. Implement real authentication and account recovery.
8. Add Stripe Connect test-mode onboarding and deposits.
9. Add real email confirmations, then SMS reminders.
10. Add client self-service management links.

## Definition of the first sellable release

A real business can:

- Create an account and business
- Select a profession pack and template
- Configure services, staff, hours, resources, policies, and deposits
- Publish a booking page
- Accept a booking without double-booking
- Collect a real deposit
- Send real confirmation/reminder messages
- View and manage the appointment on the Booking Desk
- Store the client, intake, notes, and private reference photos
- Reschedule, cancel, complete, or mark no-show according to policy
- Issue a receipt and view basic revenue/appointment reporting

Anything beyond this remains on the locked roadmap but should not block the first sellable release.

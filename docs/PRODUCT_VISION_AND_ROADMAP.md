# BookKit Product Vision and Roadmap — Locked

Status: **Locked end goal**

This document defines the long-term target for BookKit. We will begin with a small, sellable booking product and expand deliberately. The goal is not merely to copy Booksy, Meevo, Boulevard, Vagaro, Square, or Mangomint. The goal is to combine a modern booking marketplace, profession-specific operations, beautiful business websites, and an integrated business operating system.

## Product promise

BookKit gives service businesses one connected system for discovery, booking, scheduling, intake, client records, payments, checkout, communication, retention, and business management.

A business completes onboarding once. Its profession pack then configures its services, booking rules, intake, deposits, appointment flow, client records, calendar behavior, website template, and optional operating modules.

## Core differentiators

### 1. Profession intelligence

Barbers, braiders, locticians, wig specialists, nail artists, estheticians, massage therapists, tattoo artists, makeup artists, and salons do not operate the same way. BookKit uses profession packs instead of forcing every business into one generic workflow.

Profession packs control:

- Service catalogs and realistic durations
- Add-ons that change time and price
- Consultation requirements
- Deposit defaults
- Required intake and consent
- Uploads, measurements, progress photos, treatment charts, and formulas
- Walk-ins, recurring appointments, group bookings, resources, and assistants
- Profession-specific website and booking templates

### 2. Booking-to-website system

A business can choose:

1. Booking page only
2. Booking page plus professional website

The same onboarding data should generate the service menu, policies, intake, booking flow, staff profiles, gallery structure, and business website.

### 3. Visual booking

Clients can book from a hairstyle, nail set, tattoo, wig, service image, or video. The selected media carries the correct service, add-ons, provider, duration, and price into the booking flow.

### 4. Operational calendar

The calendar must do more than display appointments. It must protect time, resources, qualifications, buffers, deposits, and policies while recommending openings that avoid unusable gaps.

### 5. Complete visit record

Every visit connects:

- Booking source
- Appointment
- Intake and consent
- Notes and private photos
- Services, add-ons, and retail
- Deposit, balance, taxes, tip, and receipt
- Staff commission
- Review eligibility
- Rebooking and retention follow-up

## Complete end-state feature set

### Customer experience

- Client accounts and secure self-service portal
- View, confirm, cancel, and reschedule appointments
- Complete forms and sign waivers
- Upload reference and consultation photos
- Manage contact information and cards
- View receipts, balances, credits, packages, memberships, and gift cards
- Rebook the same service
- Book for family or friends
- Apple, Google, and Outlook calendar links

### Scheduling engine

- Database-level double-booking protection
- Soft slot holds during checkout
- Business hours, staff hours, breaks, vacation, and blocked time
- Service buffers and cleanup time
- Staff qualifications
- Rooms, chairs, tables, equipment, and assistants
- Multi-service, group, recurring, and multi-session appointments
- Consultation-before-service rules
- Travel time for mobile providers
- Minimum notice and maximum booking window
- Service-specific cancellation policies
- Time-zone and daylight-saving correctness
- Gap optimization and best-slot recommendations
- Smart waitlist matching

### Booking Desk

- Day, week, agenda, resource, walk-in, opening, and unconfirmed views
- Staff/resource columns and proportional appointment cards
- Drag-and-drop with server-side validation
- Appointment side panel
- Check-in, start, complete, reschedule, cancel, no-show, and rebook
- Notes, photos, forms, deposits, balances, and messages
- Walk-in queue and fair-turn rotation
- Live utilization, openings, risk, and appointment metrics

### Payments and POS

- Stripe Connect onboarding per business
- Online cards, card on file, cash, card-present, and Tap to Pay
- Deposits and remaining balances
- Partial payments and split tender
- Tips and split-tip allocation
- Taxes by location, service, and product
- Receipts
- Refunds, partial refunds, and voids
- Cancellation and no-show charges
- Gift cards, account credit, packages, and memberships
- Retail products and inventory updates
- Service, product, tiered, and role-based commissions
- Cash drawer opening, closing, and discrepancy tracking
- Processor payout reconciliation
- Financial audit log

### Client records

- Appointment, cancellation, and no-show history
- Preferred services and providers
- Forms, waivers, allergies, sensitivities, and private notes
- Before-and-after photos
- Profession-specific charts, formulas, measurements, references, and progress timelines
- Product purchases and recommendations
- Memberships, packages, gift cards, and credits
- Communication history and consent
- Lifetime spending, retention, and rebooking status

### Communication and automation

- Real email and SMS confirmations
- Configurable reminders
- Two-way business texting
- Confirmation requests and running-late messages
- Self-service cancellation and rescheduling links
- Waitlist and opening alerts
- Abandoned-booking recovery
- Consultation follow-up
- Verified review requests after completed appointments
- Service-cycle rebooking reminders
- Birthday and lapsed-client campaigns
- Staff notifications
- Consent and unsubscribe handling

### Marketplace and growth

- Business marketplace and discovery
- Search by location, service, date, availability, profession, price, and rating
- Verified business profiles
- Verified reviews tied to completed appointments
- Service-linked portfolio media
- Favorites and recommendations
- Promotions and last-minute openings
- Referrals and loyalty
- Google, Instagram, Facebook, and website booking entry points
- Booking-source attribution and conversion analytics
- Profession-specific business websites

### Staff and business operations

- Roles and granular permissions
- Employee schedules and time clock
- Commission and tip-payable reports
- Booth rental and suite arrangements
- Payroll exports
- Goals and performance reporting
- Resource and room management
- Multiple locations and centralized controls
- Inventory, vendors, purchase orders, counts, transfers, and low-stock alerts
- Cost of goods and margins

### Reporting and analytics

- Revenue, refunds, taxes, tips, net sales, and outstanding balances
- Deposits and payout reconciliation
- Cash discrepancies
- Utilization by staff and location
- Rebooking and retention
- New versus returning clients
- Cancellation and no-show rates
- Average ticket and service profitability
- Product margins
- Commission liability
- Membership recurring revenue and churn
- Package and gift-card liability
- Marketing attribution
- Marketplace and website conversion
- Forecasted revenue
- CSV and accounting exports

### Security, reliability, and compliance

- Secure authentication and account recovery
- Strong tenant separation and row-level security
- Encryption in transit and at rest
- Optional multifactor authentication
- Staff permission controls
- Audit logs
- Signed private-file URLs and virus scanning
- Rate limiting and bot protection
- Backups and tested restoration
- Monitoring and error alerts
- Idempotent payment and booking operations
- Webhook retries and reconciliation
- Disaster recovery
- Data export and deletion
- Privacy, terms, consent records, PCI-safe payment handling, and accessibility

## Delivery roadmap

### Phase 1 — First sellable booking platform

- Secure authentication
- Production database and tenant separation
- Profession-pack onboarding
- Services, staff, resources, availability, and calendar
- Database-enforced double-booking protection
- Complete appointment lifecycle
- Client profiles, intake, notes, and private uploads
- Deposits and Stripe Connect foundation
- Real email and SMS confirmations/reminders
- Client self-service cancel/reschedule
- Business booking pages and basic websites
- Basic reporting and audit events

### Phase 2 — Integrated checkout and retention

- Appointment-linked POS checkout
- Taxes, tips, receipts, refunds, and payout reconciliation
- Retail products and inventory
- Gift cards, packages, memberships, and account credit
- Commissions
- Waitlist automation
- Verified reviews
- Two-way messaging
- Rebooking, retention, and campaign automation
- Expanded reporting

### Phase 3 — Marketplace and multi-location operating system

- Full marketplace discovery
- Visual booking from media
- Favorites, referrals, loyalty, promotions, and last-minute openings
- Multi-location controls
- Advanced staff operations and payroll exports
- Enterprise reporting
- Public APIs and integrations

## Build rule

We begin small, but every early decision must support this end state. New features should extend the shared booking engine and profession-pack architecture rather than create isolated one-off systems.

Approved specifications and prototypes belong in GitHub and are the source of truth. Chat discussion is not a substitute for committed documentation or implementation.

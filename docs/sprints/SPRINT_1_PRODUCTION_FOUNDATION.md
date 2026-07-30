# Sprint 1 — Production Foundation

Status: In progress

## Objective

Turn the current BookKit prototype into the first production-grade platform foundation without changing the locked long-term vision.

## This sprint builds

1. Multi-tenant business model
2. Business memberships and role-ready access
3. Locations
4. Staff
5. Resources such as chairs, rooms, stations, and equipment
6. Service categories and services
7. Staff qualifications for services
8. Weekly availability and time off
9. Appointment links to businesses, locations, staff, services, and resources
10. Client-file and audit-log foundations

## Compatibility rule

The current owner-email fields and prototype behavior remain temporarily available while the application is migrated. New production fields are introduced additively so existing screens do not have to be rewritten in one unsafe change.

## Definition of done

- Every production record can belong to a business tenant.
- A business can have multiple locations, staff members, resources, and services.
- Staff can be qualified for specific services.
- Availability can be represented by weekly rules and date-specific time off.
- Appointments can reference the correct tenant, location, staff member, service, and resource.
- Sensitive files have metadata for private storage rather than public URLs.
- Important mutations can be recorded in an audit log.
- Existing prototype code continues to compile while migration work proceeds.

## Next implementation slice

After the schema foundation:

1. Create tenant-aware repository functions.
2. Add database-enforced appointment conflict checks.
3. Move profession service data out of the large page component into profession-pack configuration.
4. Connect business onboarding to persisted business, location, staff, and service records.
5. Add tests for tenant isolation and simultaneous booking attempts.

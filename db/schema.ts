import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// Production tenant foundation. Legacy ownerEmail fields remain temporarily so
// current prototype screens can migrate without an unsafe all-at-once rewrite.
export const businesses = sqliteTable("businesses", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  professionPack: text("profession_pack").notNull(),
  timezone: text("timezone").notNull().default("America/New_York"),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const businessMemberships = sqliteTable(
  "business_memberships",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id").notNull(),
    userEmail: text("user_email").notNull(),
    role: text("role").notNull().default("owner"),
    status: text("status").notNull().default("active"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("business_membership_business_user_unique").on(
      table.businessId,
      table.userEmail,
    ),
  ],
);

export const locations = sqliteTable("locations", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull(),
  name: text("name").notNull(),
  timezone: text("timezone").notNull(),
  addressJson: text("address_json").notNull().default("{}"),
  phone: text("phone").notNull().default(""),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const staffMembers = sqliteTable("staff_members", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull(),
  locationId: text("location_id"),
  userEmail: text("user_email"),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("provider"),
  bio: text("bio").notNull().default(""),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  acceptsBookings: integer("accepts_bookings", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const resources = sqliteTable("resources", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull(),
  locationId: text("location_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  capacity: integer("capacity").notNull().default(1),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const serviceCategories = sqliteTable("service_categories", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const services = sqliteTable("services", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull(),
  categoryId: text("category_id"),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  durationMinutes: integer("duration_minutes").notNull(),
  priceAmount: integer("price_amount").notNull().default(0),
  depositRule: text("deposit_rule").notNull().default("business_default"),
  depositAmount: integer("deposit_amount").notNull().default(0),
  bufferBeforeMinutes: integer("buffer_before_minutes").notNull().default(0),
  bufferAfterMinutes: integer("buffer_after_minutes").notNull().default(0),
  capacity: integer("capacity").notNull().default(1),
  requiresConsultation: integer("requires_consultation", { mode: "boolean" }).notNull().default(false),
  requiresApproval: integer("requires_approval", { mode: "boolean" }).notNull().default(false),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const staffServices = sqliteTable(
  "staff_services",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id").notNull(),
    staffId: text("staff_id").notNull(),
    serviceId: text("service_id").notNull(),
    customDurationMinutes: integer("custom_duration_minutes"),
    customPriceAmount: integer("custom_price_amount"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("staff_service_unique").on(table.staffId, table.serviceId),
  ],
);

export const availabilityRules = sqliteTable("availability_rules", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull(),
  locationId: text("location_id").notNull(),
  staffId: text("staff_id"),
  weekday: integer("weekday").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  effectiveFrom: text("effective_from"),
  effectiveUntil: text("effective_until"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const timeOff = sqliteTable("time_off", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull(),
  locationId: text("location_id"),
  staffId: text("staff_id"),
  startsAt: text("starts_at").notNull(),
  endsAt: text("ends_at").notNull(),
  reason: text("reason").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const businessProfiles = sqliteTable("business_profiles", {
  id: text("id").primaryKey(),
  businessId: text("business_id"),
  ownerEmail: text("owner_email").notNull(),
  businessName: text("business_name").notNull(),
  tagline: text("tagline").notNull(),
  slug: text("slug").notNull().unique(),
  template: text("template").notNull(),
  brandColor: text("brand_color").notNull(),
  background: text("background").notNull(),
  sectionsJson: text("sections_json").notNull(),
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull(),
});

export const appointments = sqliteTable("appointments", {
  id: text("id").primaryKey(),
  businessId: text("business_id"),
  locationId: text("location_id"),
  staffId: text("staff_id"),
  serviceId: text("service_id"),
  clientId: text("client_id"),
  ownerEmail: text("owner_email").notNull(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull().default(""),
  clientPhone: text("client_phone").notNull().default(""),
  serviceName: text("service_name").notNull(),
  appointmentDate: text("appointment_date").notNull(),
  startTime: text("start_time").notNull(),
  startsAt: text("starts_at"),
  endsAt: text("ends_at"),
  status: text("status").notNull().default("Confirmed"),
  manageToken: text("manage_token").notNull().unique(),
  notes: text("notes").notNull().default(""),
  cancellationReason: text("cancellation_reason"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const appointmentResources = sqliteTable(
  "appointment_resources",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id").notNull(),
    appointmentId: text("appointment_id").notNull(),
    resourceId: text("resource_id").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("appointment_resource_unique").on(
      table.appointmentId,
      table.resourceId,
    ),
  ],
);

export const appointmentEvents = sqliteTable("appointment_events", {
  id: text("id").primaryKey(),
  businessId: text("business_id"),
  appointmentId: text("appointment_id").notNull(),
  ownerEmail: text("owner_email").notNull(),
  eventType: text("event_type").notNull(),
  eventDataJson: text("event_data_json").notNull().default("{}"),
  createdAt: text("created_at").notNull(),
});

export const clients = sqliteTable("clients", {
  id: text("id").primaryKey(),
  businessId: text("business_id"),
  ownerEmail: text("owner_email").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  name: text("name").notNull(),
  notes: text("notes").notNull().default(""),
  visitCount: integer("visit_count").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const clientFiles = sqliteTable("client_files", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull(),
  clientId: text("client_id").notNull(),
  appointmentId: text("appointment_id"),
  uploadedByStaffId: text("uploaded_by_staff_id"),
  storageKey: text("storage_key").notNull(),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  fileKind: text("file_kind").notNull().default("reference"),
  private: integer("private", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
});

export const notificationOutbox = sqliteTable("notification_outbox", {
  id: text("id").primaryKey(),
  businessId: text("business_id"),
  appointmentId: text("appointment_id").notNull(),
  ownerEmail: text("owner_email").notNull(),
  channel: text("channel").notNull(),
  template: text("template").notNull(),
  recipient: text("recipient").notNull(),
  status: text("status").notNull().default("pending_provider"),
  scheduledFor: text("scheduled_for").notNull(),
  createdAt: text("created_at").notNull(),
});

export const paymentAccounts = sqliteTable("payment_accounts", {
  id: text("id").primaryKey(),
  businessId: text("business_id"),
  ownerEmail: text("owner_email").notNull().unique(),
  provider: text("provider").notNull().default("stripe_connect"),
  mode: text("mode").notNull().default("test"),
  onboardingStatus: text("onboarding_status").notNull().default("not_started"),
  payoutsEnabled: integer("payouts_enabled", { mode: "boolean" }).notNull().default(false),
  defaultPaymentRule: text("default_payment_rule").notNull().default("fixed_deposit"),
  defaultDepositAmount: integer("default_deposit_amount").notNull().default(3000),
  cancellationWindowHours: integer("cancellation_window_hours").notNull().default(24),
  updatedAt: text("updated_at").notNull(),
});

export const paymentTransactions = sqliteTable("payment_transactions", {
  id: text("id").primaryKey(),
  businessId: text("business_id"),
  appointmentId: text("appointment_id"),
  ownerEmail: text("owner_email").notNull(),
  clientName: text("client_name").notNull(),
  serviceName: text("service_name").notNull(),
  kind: text("kind").notNull(),
  status: text("status").notNull(),
  amount: integer("amount").notNull(),
  tipAmount: integer("tip_amount").notNull().default(0),
  providerReference: text("provider_reference"),
  createdAt: text("created_at").notNull(),
});

export const schedulingSettings = sqliteTable("scheduling_settings", {
  id: text("id").primaryKey(),
  businessId: text("business_id"),
  ownerEmail: text("owner_email").notNull().unique(),
  googleCalendar: integer("google_calendar", { mode: "boolean" }).notNull().default(false),
  outlookCalendar: integer("outlook_calendar", { mode: "boolean" }).notNull().default(false),
  preventConflicts: integer("prevent_conflicts", { mode: "boolean" }).notNull().default(true),
  emailConfirmation: integer("email_confirmation", { mode: "boolean" }).notNull().default(true),
  smsConfirmation: integer("sms_confirmation", { mode: "boolean" }).notNull().default(true),
  reminder24h: integer("reminder_24h", { mode: "boolean" }).notNull().default(true),
  reminder2h: integer("reminder_2h", { mode: "boolean" }).notNull().default(true),
  clientReschedule: integer("client_reschedule", { mode: "boolean" }).notNull().default(true),
  clientCancel: integer("client_cancel", { mode: "boolean" }).notNull().default(true),
  minimumNoticeHours: integer("minimum_notice_hours").notNull().default(24),
  bookingWindowDays: integer("booking_window_days").notNull().default(90),
  updatedAt: text("updated_at").notNull(),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull(),
  actorEmail: text("actor_email"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  metadataJson: text("metadata_json").notNull().default("{}"),
  createdAt: text("created_at").notNull(),
});

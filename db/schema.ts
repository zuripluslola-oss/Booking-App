import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const businessProfiles = sqliteTable("business_profiles", {
  id: text("id").primaryKey(),
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
  ownerEmail: text("owner_email").notNull(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull().default(""),
  clientPhone: text("client_phone").notNull().default(""),
  serviceName: text("service_name").notNull(),
  appointmentDate: text("appointment_date").notNull(),
  startTime: text("start_time").notNull(),
  status: text("status").notNull().default("Confirmed"),
  manageToken: text("manage_token").notNull().unique(),
  notes: text("notes").notNull().default(""),
  cancellationReason: text("cancellation_reason"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const appointmentEvents = sqliteTable("appointment_events", {
  id: text("id").primaryKey(),
  appointmentId: text("appointment_id").notNull(),
  ownerEmail: text("owner_email").notNull(),
  eventType: text("event_type").notNull(),
  eventDataJson: text("event_data_json").notNull().default("{}"),
  createdAt: text("created_at").notNull(),
});

export const clients = sqliteTable("clients", {
  id: text("id").primaryKey(),
  ownerEmail: text("owner_email").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  name: text("name").notNull(),
  notes: text("notes").notNull().default(""),
  visitCount: integer("visit_count").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const notificationOutbox = sqliteTable("notification_outbox", {
  id: text("id").primaryKey(),
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

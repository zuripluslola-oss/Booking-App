ALTER TABLE `appointments` ADD `client_email` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `appointments` ADD `client_phone` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `appointments` ADD `manage_token` text;
--> statement-breakpoint
ALTER TABLE `appointments` ADD `notes` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `appointments` ADD `cancellation_reason` text;
--> statement-breakpoint
ALTER TABLE `appointments` ADD `updated_at` text DEFAULT '' NOT NULL;
--> statement-breakpoint
UPDATE `appointments` SET `manage_token` = lower(hex(randomblob(32))) WHERE `manage_token` IS NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX `appointments_manage_token_unique` ON `appointments` (`manage_token`);
--> statement-breakpoint
CREATE UNIQUE INDEX `appointments_active_slot_unique`
ON `appointments` (`owner_email`, `appointment_date`, `start_time`)
WHERE `status` <> 'Cancelled';
--> statement-breakpoint
CREATE TABLE `appointment_events` (
  `id` text PRIMARY KEY NOT NULL,
  `appointment_id` text NOT NULL,
  `owner_email` text NOT NULL,
  `event_type` text NOT NULL,
  `event_data_json` text DEFAULT '{}' NOT NULL,
  `created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `appointment_events_appointment_idx` ON `appointment_events` (`appointment_id`, `created_at`);
--> statement-breakpoint
CREATE TABLE `clients` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_email` text NOT NULL,
  `email` text NOT NULL,
  `phone` text DEFAULT '' NOT NULL,
  `name` text NOT NULL,
  `notes` text DEFAULT '' NOT NULL,
  `visit_count` integer DEFAULT 0 NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clients_owner_email_unique` ON `clients` (`owner_email`, `email`);
--> statement-breakpoint
CREATE TABLE `notification_outbox` (
  `id` text PRIMARY KEY NOT NULL,
  `appointment_id` text NOT NULL,
  `owner_email` text NOT NULL,
  `channel` text NOT NULL,
  `template` text NOT NULL,
  `recipient` text NOT NULL,
  `status` text DEFAULT 'pending_provider' NOT NULL,
  `scheduled_for` text NOT NULL,
  `created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `notification_outbox_status_idx` ON `notification_outbox` (`status`, `scheduled_for`);

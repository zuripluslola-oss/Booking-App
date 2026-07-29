CREATE TABLE `scheduling_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_email` text NOT NULL,
	`google_calendar` integer DEFAULT false NOT NULL,
	`outlook_calendar` integer DEFAULT false NOT NULL,
	`prevent_conflicts` integer DEFAULT true NOT NULL,
	`email_confirmation` integer DEFAULT true NOT NULL,
	`sms_confirmation` integer DEFAULT true NOT NULL,
	`reminder_24h` integer DEFAULT true NOT NULL,
	`reminder_2h` integer DEFAULT true NOT NULL,
	`client_reschedule` integer DEFAULT true NOT NULL,
	`client_cancel` integer DEFAULT true NOT NULL,
	`minimum_notice_hours` integer DEFAULT 24 NOT NULL,
	`booking_window_days` integer DEFAULT 90 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `scheduling_settings_owner_email_unique` ON `scheduling_settings` (`owner_email`);
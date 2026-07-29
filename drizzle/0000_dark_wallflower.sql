CREATE TABLE `appointments` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_email` text NOT NULL,
	`client_name` text NOT NULL,
	`service_name` text NOT NULL,
	`appointment_date` text NOT NULL,
	`start_time` text NOT NULL,
	`status` text DEFAULT 'Confirmed' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `business_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_email` text NOT NULL,
	`business_name` text NOT NULL,
	`tagline` text NOT NULL,
	`slug` text NOT NULL,
	`template` text NOT NULL,
	`brand_color` text NOT NULL,
	`background` text NOT NULL,
	`sections_json` text NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `business_profiles_slug_unique` ON `business_profiles` (`slug`);
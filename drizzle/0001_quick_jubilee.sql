CREATE TABLE `payment_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_email` text NOT NULL,
	`provider` text DEFAULT 'stripe_connect' NOT NULL,
	`mode` text DEFAULT 'test' NOT NULL,
	`onboarding_status` text DEFAULT 'not_started' NOT NULL,
	`payouts_enabled` integer DEFAULT false NOT NULL,
	`default_payment_rule` text DEFAULT 'fixed_deposit' NOT NULL,
	`default_deposit_amount` integer DEFAULT 3000 NOT NULL,
	`cancellation_window_hours` integer DEFAULT 24 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_accounts_owner_email_unique` ON `payment_accounts` (`owner_email`);--> statement-breakpoint
CREATE TABLE `payment_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_email` text NOT NULL,
	`client_name` text NOT NULL,
	`service_name` text NOT NULL,
	`kind` text NOT NULL,
	`status` text NOT NULL,
	`amount` integer NOT NULL,
	`tip_amount` integer DEFAULT 0 NOT NULL,
	`provider_reference` text,
	`created_at` text NOT NULL
);

CREATE TABLE `popularDestinations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`nameZh` text NOT NULL,
	`category` varchar(50) NOT NULL,
	`latitude` decimal(10,7) NOT NULL,
	`longitude` decimal(10,7) NOT NULL,
	`accessibilityRating` int NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `popularDestinations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `category_idx` ON `popularDestinations` (`category`);--> statement-breakpoint
CREATE INDEX `location_idx` ON `popularDestinations` (`latitude`,`longitude`);
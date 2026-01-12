CREATE TABLE `accessibilityNotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`facilityType` enum('lift','footbridge','zebra_crossing','mtr_station','bus_stop','general') NOT NULL,
	`facilityId` int,
	`locationName` text NOT NULL,
	`latitude` decimal(10,7) NOT NULL,
	`longitude` decimal(10,7) NOT NULL,
	`rating` int NOT NULL,
	`condition` enum('excellent','good','fair','poor','inaccessible') NOT NULL,
	`comment` text NOT NULL,
	`isVerified` boolean NOT NULL DEFAULT false,
	`verifiedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accessibilityNotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `liftStatus` (
	`id` int AUTO_INCREMENT NOT NULL,
	`liftId` int NOT NULL,
	`status` enum('operational','out_of_service','under_maintenance','unknown') NOT NULL DEFAULT 'operational',
	`reportedBy` varchar(100),
	`reportedAt` timestamp NOT NULL DEFAULT (now()),
	`estimatedFixDate` timestamp,
	`notes` text,
	`isVerified` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `liftStatus_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notePhotos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`noteId` int NOT NULL,
	`photoUrl` text NOT NULL,
	`photoKey` text NOT NULL,
	`caption` text,
	`uploadedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notePhotos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `user_idx` ON `accessibilityNotes` (`userId`);--> statement-breakpoint
CREATE INDEX `location_idx` ON `accessibilityNotes` (`latitude`,`longitude`);--> statement-breakpoint
CREATE INDEX `facility_idx` ON `accessibilityNotes` (`facilityType`,`facilityId`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `accessibilityNotes` (`createdAt`);--> statement-breakpoint
CREATE INDEX `lift_idx` ON `liftStatus` (`liftId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `liftStatus` (`status`);--> statement-breakpoint
CREATE INDEX `reported_at_idx` ON `liftStatus` (`reportedAt`);--> statement-breakpoint
CREATE INDEX `note_idx` ON `notePhotos` (`noteId`);
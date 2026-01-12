CREATE TABLE `footbridges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bridgeNumber` varchar(50) NOT NULL,
	`name` text NOT NULL,
	`location` text NOT NULL,
	`district` varchar(100),
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`hasLift` boolean NOT NULL DEFAULT false,
	`hasEscalator` boolean NOT NULL DEFAULT false,
	`hasRamp` boolean NOT NULL DEFAULT false,
	`isAccessible` boolean NOT NULL DEFAULT false,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `footbridges_id` PRIMARY KEY(`id`),
	CONSTRAINT `footbridges_bridgeNumber_unique` UNIQUE(`bridgeNumber`)
);
--> statement-breakpoint
CREATE TABLE `lifts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`liftNumber` varchar(100) NOT NULL,
	`location` text NOT NULL,
	`address` text,
	`district` varchar(100),
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`type` varchar(100),
	`isAccessible` boolean NOT NULL DEFAULT true,
	`isOperational` boolean NOT NULL DEFAULT true,
	`lastInspection` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lifts_id` PRIMARY KEY(`id`),
	CONSTRAINT `lifts_liftNumber_unique` UNIQUE(`liftNumber`)
);
--> statement-breakpoint
CREATE TABLE `pedestrianLinks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`linkId` varchar(100) NOT NULL,
	`fromNodeId` varchar(100) NOT NULL,
	`toNodeId` varchar(100) NOT NULL,
	`distance` decimal(8,2) NOT NULL,
	`linkType` varchar(50),
	`isAccessible` boolean NOT NULL DEFAULT true,
	`hasStairs` boolean NOT NULL DEFAULT false,
	`hasRamp` boolean NOT NULL DEFAULT false,
	`hasLift` boolean NOT NULL DEFAULT false,
	`slope` decimal(5,2),
	`surface` varchar(50),
	`width` decimal(5,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pedestrianLinks_id` PRIMARY KEY(`id`),
	CONSTRAINT `pedestrianLinks_linkId_unique` UNIQUE(`linkId`)
);
--> statement-breakpoint
CREATE TABLE `pedestrianNodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nodeId` varchar(100) NOT NULL,
	`name` text,
	`latitude` decimal(10,7) NOT NULL,
	`longitude` decimal(10,7) NOT NULL,
	`elevation` decimal(8,2),
	`nodeType` varchar(50),
	`isAccessible` boolean NOT NULL DEFAULT true,
	`facilityType` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pedestrianNodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `pedestrianNodes_nodeId_unique` UNIQUE(`nodeId`)
);
--> statement-breakpoint
CREATE TABLE `routeHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fromAddress` text NOT NULL,
	`toAddress` text NOT NULL,
	`fromLatitude` decimal(10,7) NOT NULL,
	`fromLongitude` decimal(10,7) NOT NULL,
	`toLatitude` decimal(10,7) NOT NULL,
	`toLongitude` decimal(10,7) NOT NULL,
	`distance` decimal(8,2),
	`duration` int,
	`routeData` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `routeHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savedLocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` text NOT NULL,
	`address` text,
	`latitude` decimal(10,7) NOT NULL,
	`longitude` decimal(10,7) NOT NULL,
	`category` varchar(50),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `savedLocations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `zebraCrossings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`location` text NOT NULL,
	`district` varchar(100),
	`latitude` decimal(10,7) NOT NULL,
	`longitude` decimal(10,7) NOT NULL,
	`hasOctopusExtension` boolean NOT NULL DEFAULT false,
	`hasAudioSignal` boolean NOT NULL DEFAULT false,
	`crossingWidth` decimal(5,2),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `zebraCrossings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `fontSize` enum('normal','large','extra-large') DEFAULT 'large' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `highContrast` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `voiceNavigation` boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE INDEX `location_idx` ON `footbridges` (`latitude`,`longitude`);--> statement-breakpoint
CREATE INDEX `accessible_idx` ON `footbridges` (`isAccessible`);--> statement-breakpoint
CREATE INDEX `location_idx` ON `lifts` (`latitude`,`longitude`);--> statement-breakpoint
CREATE INDEX `district_idx` ON `lifts` (`district`);--> statement-breakpoint
CREATE INDEX `from_node_idx` ON `pedestrianLinks` (`fromNodeId`);--> statement-breakpoint
CREATE INDEX `to_node_idx` ON `pedestrianLinks` (`toNodeId`);--> statement-breakpoint
CREATE INDEX `accessible_idx` ON `pedestrianLinks` (`isAccessible`);--> statement-breakpoint
CREATE INDEX `location_idx` ON `pedestrianNodes` (`latitude`,`longitude`);--> statement-breakpoint
CREATE INDEX `accessible_idx` ON `pedestrianNodes` (`isAccessible`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `routeHistory` (`userId`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `routeHistory` (`createdAt`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `savedLocations` (`userId`);--> statement-breakpoint
CREATE INDEX `location_idx` ON `zebraCrossings` (`latitude`,`longitude`);--> statement-breakpoint
CREATE INDEX `octopus_idx` ON `zebraCrossings` (`hasOctopusExtension`);
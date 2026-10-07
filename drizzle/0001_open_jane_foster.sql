CREATE TABLE `check_ins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matchId` int NOT NULL,
	`memberId` int NOT NULL,
	`checkedInAt` timestamp NOT NULL DEFAULT (now()),
	`queueOrder` int NOT NULL,
	`status` enum('confirmed','waiting','playing','finished') NOT NULL DEFAULT 'confirmed',
	CONSTRAINT `check_ins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `league_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`fullName` varchar(160) NOT NULL,
	`nickname` varchar(80),
	`phone` varchar(32),
	`memberType` enum('monthly','guest') NOT NULL DEFAULT 'monthly',
	`position` enum('GOL','DEF','MEI','ATA') NOT NULL DEFAULT 'MEI',
	`dominantFoot` enum('right','left','both') NOT NULL DEFAULT 'right',
	`shirtNumber` int,
	`age` int,
	`favoriteTeam` varchar(80),
	`isAdmin` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `league_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `match_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matchId` int NOT NULL,
	`memberId` int NOT NULL,
	`type` enum('goal','assist','yellow_card','red_card','substitution') NOT NULL,
	`note` varchar(240),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `match_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`venue` varchar(160) NOT NULL DEFAULT 'Arena Marrechal',
	`status` enum('scheduled','live','finished') NOT NULL DEFAULT 'scheduled',
	`blueScore` int NOT NULL DEFAULT 0,
	`redScore` int NOT NULL DEFAULT 0,
	`bluePlayers` text,
	`redPlayers` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`endedAt` timestamp,
	CONSTRAINT `matches_id` PRIMARY KEY(`id`)
);

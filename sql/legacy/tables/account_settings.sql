CREATE TABLE `account_settings` (
	`account_id` INT UNSIGNED NOT NULL,
	`default_measure_id` INT UNSIGNED NULL DEFAULT NULL,
	`created_at` TIMESTAMP NULL DEFAULT NULL,
	`updated_at` TIMESTAMP NULL DEFAULT NULL,
	PRIMARY KEY (`account_id`) USING BTREE,
	CONSTRAINT `fk_account_settings_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON UPDATE NO ACTION ON DELETE CASCADE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

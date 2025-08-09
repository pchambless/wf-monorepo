CREATE TABLE `users` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`email` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`password` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`password_new` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`first_name` VARCHAR(25) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`last_name` VARCHAR(25) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`role` INT UNSIGNED NOT NULL DEFAULT '1',
	`default_account_id` INT UNSIGNED NULL DEFAULT NULL,
	`last_login` TIMESTAMP NULL DEFAULT NULL,
	`remember_token` VARCHAR(100) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`created_at` TIMESTAMP NULL DEFAULT NULL,
	`updated_at` TIMESTAMP NULL DEFAULT NULL,
	`deleted_at` TIMESTAMP NULL DEFAULT NULL,
	`created_by` INT UNSIGNED NULL DEFAULT NULL,
	`updated_by` INT UNSIGNED NULL DEFAULT NULL,
	`deleted_by` INT UNSIGNED NULL DEFAULT NULL,
	`active` CHAR(1) AS ((case when (`deleted_at` is null) then _utf8mb4'Y' else _utf8mb4'' end)) stored,
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `users_email_unique` (`email`) USING BTREE,
	INDEX `users_default_account_id_foreign` (`default_account_id`) USING BTREE,
	CONSTRAINT `users_default_account_id_foreign` FOREIGN KEY (`default_account_id`) REFERENCES `accounts` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=57
;

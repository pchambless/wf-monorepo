-- --------------------------------------------------------
-- Host:                         159.223.104.19
-- Server version:               8.0.39-0ubuntu0.20.04.1 - (Ubuntu)
-- Server OS:                    Linux
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for function wf_backup.f_shop_event
DELIMITER //
CREATE FUNCTION `f_shop_event`(
	`iID` INT
) RETURNS text CHARSET utf8mb4
    DETERMINISTIC
BEGIN
	declare oVal 	VARCHAR(100);
	
	if isnull(iID) then
		set oVal = '-';  -- This is the default or Not Determined Value
	else
		select concat(b.`name`,': ',date_format(a.shop_date,'%Y-%m-%d')) into oVal
			from shop_event a
			join vendors b
			on a.vendor_id = b.id
		where a.id = iID;

		if isnull(oVal) then
			set oVal = '-';  -- This is the default or Not Determined Value
		end if;
	end if;

	return oVal;
END//
DELIMITER ;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

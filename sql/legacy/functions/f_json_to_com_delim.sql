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

-- Dumping structure for function wf_backup.f_json_to_com_delim
DELIMITER //
CREATE FUNCTION `f_json_to_com_delim`(
	`i_json` varchar(1000)
) RETURNS varchar(1000) CHARSET latin1
    READS SQL DATA
    COMMENT 'IN: JSON OUT: measure_unit'
BEGIN
	declare o_val 	VARCHAR(1000);if isnull(i_json) then
		set o_val = '';	-- This is the default or Not Determined Value
	else
		set o_val = replace(i_json,'[','');
		set o_val = replace(o_val,']','');
		set o_val = replace(o_val,'"','');
		set o_val = replace(o_val,',',', ');
	end if;
	return o_val;
END//
DELIMITER ;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

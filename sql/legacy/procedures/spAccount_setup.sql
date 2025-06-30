-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.25 - MySQL Community Server - GPL
-- Server OS:                    Linux
-- HeidiSQL Version:             11.3.0.6369
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for procedure whatsfresh.spAccount_setup
DELIMITER //
CREATE PROCEDURE `spAccount_setup`(
	IN `iName` VARCHAR(50),
	IN `iCity` VARCHAR(50),
	IN `iState` VARCHAR(50),
	IN `iZipCode` VARCHAR(50),
	IN `iURL` VARCHAR(50),
	IN `iEmail` varchar(50),
	IN `iFirstName` VARCHAR(50),
	IN `iLastName` VARCHAR(50),
	IN `iUserID` VARCHAR(50)
)
BEGIN
	declare uAcctID INT;
	declare uUserID INT;
-- Create the new Account	
	INSERT INTO accounts
	  (name, city, state_code, zip_code, url, created_at, created_by)
	VALUES
	  (iName, iCity, iState, ifnull(iZipCode,'00000'), iURL, current_timestamp(), iUserID)
  ;
  SELECT LAST_INSERT_ID() into uAcctID;
  
  
-- Check to see if the User exists already	
	select id into uUserID
  	from users
  	where email = iEmail;
-- If this is a new User, Insert him/her	  
	if uUserID is null then
  		INSERT INTO users
	  		(first_name, last_name, email, role, password, default_account_id, created_at, created_by)
		VALUES
		  (
		    iFirstName,
		    iLastName,
		    iEmail,
		    0,
			 'Replace Password',
			 uAcctID,
			 current_timestamp(),
			 iUserID
			);
		SELECT LAST_INSERT_ID() into uUserID;
	end if;
-- Associate the Account / User in the accounts_users table.
	INSERT INTO accounts_users
		(account_id, user_id, is_owner, created_at, created_by)
	values
		(uAcctID, uUserID, 1, current_timestamp(), iUserID );
END//
DELIMITER ;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

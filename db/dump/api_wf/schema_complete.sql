-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: 159.223.104.19    Database: api_wf
-- ------------------------------------------------------
-- Server version	8.0.42-0ubuntu0.20.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `AISql`
--

DROP TABLE IF EXISTS `AISql`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AISql` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'investigation, testing, validation, context',
  `qryName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `qrySQL` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT 'Use :paramName syntax',
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '-',
  `usage_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'claude',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `active` tinyint(1) GENERATED ALWAYS AS ((case when (`deleted_at` is null) then 1 else 0 end)) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `USI_AISql` (`qryName`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `_old_eventComp_xref`
--

DROP TABLE IF EXISTS `_old_eventComp_xref`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_old_eventComp_xref` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pageID` int DEFAULT NULL,
  `comp_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `title` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `parent_id` int DEFAULT NULL,
  `comp_type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `composite_id` int DEFAULT NULL COMMENT 'References eventComposite.id - which template/recipe to use',
  `posOrder` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '00,00,00,left',
  `props` text COLLATE utf8mb4_general_ci,
  `triggers` text COLLATE utf8mb4_general_ci,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `style` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Paul',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `active` tinyint(1) GENERATED ALWAYS AS ((case when (`deleted_at` is null) then 1 else 0 end)) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usi_pageID_compName` (`pageID`,`comp_name`),
  KEY `eventComp_xref_comp_type_FK` (`comp_type`),
  KEY `idx_composite_id` (`composite_id`),
  CONSTRAINT `eventComp_xref_comp_type_FK` FOREIGN KEY (`comp_type`) REFERENCES `_old_eventType` (`name`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_eventComp_xref_composite` FOREIGN KEY (`composite_id`) REFERENCES `composites` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=184 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `_old_eventProps`
--

DROP TABLE IF EXISTS `_old_eventProps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_old_eventProps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `xref_id` int DEFAULT NULL,
  `pageID` int DEFAULT NULL,
  `paramName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `paramVal` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Paul',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `active` tinyint(1) GENERATED ALWAYS AS ((case when (`deleted_at` is null) then 1 else 0 end)) STORED,
  PRIMARY KEY (`id`),
  KEY `eventProps_eventType_xref_FK` (`xref_id`),
  KEY `idx_xref_page` (`xref_id`,`pageID`),
  CONSTRAINT `eventProps_eventComp_xref_FK` FOREIGN KEY (`xref_id`) REFERENCES `_old_eventComp_xref` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=160 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `_old_eventSQL`
--

DROP TABLE IF EXISTS `_old_eventSQL`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_old_eventSQL` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `qryName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `qrySQL` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `description` varchar(100) COLLATE utf8mb4_general_ci DEFAULT '-',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Paul',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `active` tinyint(1) GENERATED ALWAYS AS ((case when (`deleted_at` is null) then 1 else 0 end)) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `USI_eventSQL` (`qryName`)
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `_old_eventTrigger`
--

DROP TABLE IF EXISTS `_old_eventTrigger`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_old_eventTrigger` (
  `id` int NOT NULL AUTO_INCREMENT,
  `xref_id` int DEFAULT NULL,
  `pageID` int DEFAULT NULL,
  `class` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `action` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ordr` int DEFAULT '1',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Paul',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `active` tinyint(1) GENERATED ALWAYS AS ((case when (`deleted_at` is null) then 1 else 0 end)) STORED,
  PRIMARY KEY (`id`),
  KEY `eventTrigger_triggers_FK` (`class`),
  KEY `eventTrigger_triggers_FK_1` (`action`),
  KEY `idx_xref_page` (`xref_id`,`pageID`),
  CONSTRAINT `eventTrigger_eventComp_xref_FK` FOREIGN KEY (`xref_id`) REFERENCES `_old_eventComp_xref` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `eventTrigger_triggers_FK` FOREIGN KEY (`class`) REFERENCES `triggers` (`name`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `eventTrigger_triggers_FK_1` FOREIGN KEY (`action`) REFERENCES `triggers` (`name`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=173 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `_old_eventType`
--

DROP TABLE IF EXISTS `_old_eventType`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_old_eventType` (
  `id` int NOT NULL AUTO_INCREMENT,
  `Hier` int DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `category` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `style` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `config` text COLLATE utf8mb4_general_ci,
  `purpose` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'Paul',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `active` tinyint(1) GENERATED ALWAYS AS ((case when (`deleted_at` is null) then 1 else 0 end)) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `acctList`
--

DROP TABLE IF EXISTS `acctList`;
/*!50001 DROP VIEW IF EXISTS `acctList`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `acctList` AS SELECT 
 1 AS `acctID`,
 1 AS `acctName`,
 1 AS `acctDesc`,
 1 AS `acctAddr`,
 1 AS `acctCity`,
 1 AS `acctState`,
 1 AS `acctZipCode`,
 1 AS `acctCompCode`,
 1 AS `acctDfltLoc`,
 1 AS `acctURL`,
 1 AS `acctPayCustCode`,
 1 AS `acctSubsptnCode`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `app`
--

DROP TABLE IF EXISTS `app`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `mono_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `base_url` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `appbarConfig` text COLLATE utf8mb4_general_ci,
  `sidebarConfig` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `footerConfig` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` enum('active','development','deprecated') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'active',
  `roles` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Paul',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `active` tinyint(1) GENERATED ALWAYS AS ((case when (`deleted_at` is null) then 1 else 0 end)) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `brndList`
--

DROP TABLE IF EXISTS `brndList`;
/*!50001 DROP VIEW IF EXISTS `brndList`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `brndList` AS SELECT 
 1 AS `brndID`,
 1 AS `brndName`,
 1 AS `brndComments`,
 1 AS `brndURL`,
 1 AS `acctID`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `btchMapRcpeList`
--

DROP TABLE IF EXISTS `btchMapRcpeList`;
/*!50001 DROP VIEW IF EXISTS `btchMapRcpeList`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `btchMapRcpeList` AS SELECT 
 1 AS `rcpeID`,
 1 AS `ingrOrdr`,
 1 AS `ingrName`,
 1 AS `ingrID`,
 1 AS `prodID`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `composites`
--

DROP TABLE IF EXISTS `composites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `composites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `name` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `title` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `components` text COLLATE utf8mb4_general_ci,
  `layout` text COLLATE utf8mb4_general_ci,
  `dependencies` text COLLATE utf8mb4_general_ci,
  `props` json DEFAULT NULL,
  `eventSQL` json DEFAULT NULL,
  `triggers` json DEFAULT NULL,
  `style` text COLLATE utf8mb4_general_ci,
  `purpose` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Paul',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `active` tinyint(1) GENERATED ALWAYS AS ((case when (`deleted_at` is null) then 1 else 0 end)) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usi_composite_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `context_store`
--

DROP TABLE IF EXISTS `context_store`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `context_store` (
  `id` int NOT NULL AUTO_INCREMENT,
  `paramName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `paramVal` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updates` int DEFAULT '0',
  `getVals` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `USI_context_store` (`email`,`paramName`),
  KEY `context_store_email_IDX` (`email`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=16668 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `gridMapped`
--

DROP TABLE IF EXISTS `gridMapped`;
/*!50001 DROP VIEW IF EXISTS `gridMapped`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `gridMapped` AS SELECT 
 1 AS `mapID`,
 1 AS `ingrBtchNbr`,
 1 AS `purchDate`,
 1 AS `vndrName`,
 1 AS `prodRcpeID`,
 1 AS `ingrID`,
 1 AS `prodBtchID`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `gridRcpe`
--

DROP TABLE IF EXISTS `gridRcpe`;
/*!50001 DROP VIEW IF EXISTS `gridRcpe`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `gridRcpe` AS SELECT 
 1 AS `prodRcpeID`,
 1 AS `ingrOrdr`,
 1 AS `ingrName`,
 1 AS `ingrID`,
 1 AS `prodID`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `ingrBtchList`
--

DROP TABLE IF EXISTS `ingrBtchList`;
/*!50001 DROP VIEW IF EXISTS `ingrBtchList`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `ingrBtchList` AS SELECT 
 1 AS `ingrBtchID`,
 1 AS `btchNbr`,
 1 AS `vndrID`,
 1 AS `brndID`,
 1 AS `purchDate`,
 1 AS `unitQty`,
 1 AS `unitPrice`,
 1 AS `purchQty`,
 1 AS `measID`,
 1 AS `lotNbr`,
 1 AS `bestByDate`,
 1 AS `comments`,
 1 AS `ingrID`,
 1 AS `purch_dtl`,
 1 AS `ingrName`,
 1 AS `ingrCode`,
 1 AS `ingrType`,
 1 AS `vndrName`,
 1 AS `brndName`,
 1 AS `unitRate`,
 1 AS `purchAmt`,
 1 AS `usageCount`,
 1 AS `batchStatus`,
 1 AS `shopEventRef`,
 1 AS `acctID`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `ingrList`
--

DROP TABLE IF EXISTS `ingrList`;
/*!50001 DROP VIEW IF EXISTS `ingrList`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `ingrList` AS SELECT 
 1 AS `ingrID`,
 1 AS `ingrName`,
 1 AS `ingrCode`,
 1 AS `ingrDesc`,
 1 AS `measID`,
 1 AS `vndrID`,
 1 AS `ingrGrmsPerOz`,
 1 AS `ingrTypeID`,
 1 AS `acctID`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `ingrTypeList`
--

DROP TABLE IF EXISTS `ingrTypeList`;
/*!50001 DROP VIEW IF EXISTS `ingrTypeList`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `ingrTypeList` AS SELECT 
 1 AS `ingrTypeID`,
 1 AS `ingrTypeName`,
 1 AS `ingrTypeDesc`,
 1 AS `acctID`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `measList`
--

DROP TABLE IF EXISTS `measList`;
/*!50001 DROP VIEW IF EXISTS `measList`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `measList` AS SELECT 
 1 AS `measID`,
 1 AS `name`,
 1 AS `abbrev`,
 1 AS `acctID`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `module_xref`
--

DROP TABLE IF EXISTS `module_xref`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `module_xref` (
  `id` int NOT NULL AUTO_INCREMENT,
  `module_id` int NOT NULL,
  `parent_id` int NOT NULL,
  `dependency_type` enum('internal','external') COLLATE utf8mb4_general_ci DEFAULT 'internal',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `last_detected_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `active` tinyint(1) GENERATED ALWAYS AS ((case when (`last_detected_at` = `updated_at`) then 1 else 0 end)) STORED,
  PRIMARY KEY (`id`),
  KEY `module_xref_idx_module` (`module_id`),
  KEY `module_xref_idx_parent` (`parent_id`),
  CONSTRAINT `module_xref_ibfk_1` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `module_xref_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1005 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `modules`
--

DROP TABLE IF EXISTS `modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `file_path` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `blast_radius` enum('low','medium','high') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fileName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci GENERATED ALWAYS AS (substring_index(`file_path`,_utf8mb4'/',-(1))) STORED,
  `fileFolder` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci GENERATED ALWAYS AS (substr(`file_path`,1,((length(`file_path`) - length(substring_index(`file_path`,_utf8mb4'/',-(1)))) - 1))) STORED,
  `package` varchar(50) COLLATE utf8mb4_general_ci GENERATED ALWAYS AS (substring_index(substring_index(`file_path`,_utf8mb4'/',2),_utf8mb4'/',-(1))) STORED,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `last_detected_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `active` tinyint(1) GENERATED ALWAYS AS ((case when (`last_detected_at` = `updated_at`) then 1 else 0 end)) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `file_path` (`file_path`),
  KEY `module_idx_path` (`file_path`),
  KEY `modules_package_IDX` (`package`) USING BTREE,
  KEY `modules_last_detected_at_IDX` (`last_detected_at`) USING BTREE,
  KEY `modules_fileName_IDX` (`fileName`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=813 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pageComponents`
--

DROP TABLE IF EXISTS `pageComponents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pageComponents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pageID` int NOT NULL,
  `comp_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Unique name on this page',
  `composite_id` int NOT NULL COMMENT 'References eventComposite.id',
  `parent_id` int DEFAULT NULL COMMENT 'References pageComponents.id (self)',
  `posOrder` varchar(25) COLLATE utf8mb4_general_ci DEFAULT '00,00,00,left' COMMENT 'Row, column, order, alignment',
  `title` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Display title override',
  `style` text COLLATE utf8mb4_general_ci COMMENT 'Component-specific style overrides',
  `description` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'system',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `active` tinyint(1) GENERATED ALWAYS AS ((case when (`deleted_at` is null) then 1 else 0 end)) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usi_page_component` (`pageID`,`comp_name`),
  KEY `idx_pageID` (`pageID`),
  KEY `idx_composite_id` (`composite_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_active` (`active`),
  CONSTRAINT `fk_pageComponents_composite` FOREIGN KEY (`composite_id`) REFERENCES `composites` (`id`),
  CONSTRAINT `fk_pageComponents_page` FOREIGN KEY (`pageID`) REFERENCES `page_registry` (`id`),
  CONSTRAINT `fk_pageComponents_parent` FOREIGN KEY (`parent_id`) REFERENCES `pageComponents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Component instances on pages - replaces eventComp_xref';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pageConfig`
--

DROP TABLE IF EXISTS `pageConfig`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pageConfig` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pageID` int NOT NULL,
  `pageComponent_id` int NOT NULL,
  `props` json DEFAULT NULL,
  `triggers` json DEFAULT NULL,
  `eventSQL` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `description` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'Paul',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `active` tinyint(1) GENERATED ALWAYS AS ((case when (`deleted_at` is null) then 1 else 0 end)) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_page_component` (`pageID`,`pageComponent_id`),
  KEY `idx_pageID` (`pageID`),
  KEY `idx_xref_id` (`pageComponent_id`),
  KEY `idx_active` (`active`),
  CONSTRAINT `fk_pageConfig_pageComponent` FOREIGN KEY (`pageComponent_id`) REFERENCES `pageComponents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pageConfig_ibfk_1` FOREIGN KEY (`pageID`) REFERENCES `page_registry` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `page_registry`
--

DROP TABLE IF EXISTS `page_registry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `page_registry` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appID` int DEFAULT NULL,
  `appName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `pageName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'New',
  `props` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `routePath` varchar(200) COLLATE utf8mb4_unicode_ci GENERATED ALWAYS AS (concat(_utf8mb4'/',`appName`,_utf8mb4'/',`pageName`)) STORED,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `dmlConfig` text COLLATE utf8mb4_unicode_ci,
  `pageConfig` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `active` tinyint(1) GENERATED ALWAYS AS ((case when (`deleted_at` is null) then 1 else 0 end)) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_app_page` (`appName`,`pageName`),
  KEY `idx_appName` (`appName`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `plan_communications`
--

DROP TABLE IF EXISTS `plan_communications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plan_communications` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `plan_id` int unsigned NOT NULL,
  `from_agent` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `to_agent` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'created',
  `created_at` timestamp NULL DEFAULT (now()),
  `created_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_plan_comm_plan_id` (`plan_id`),
  KEY `idx_plan_comm_status` (`status`),
  CONSTRAINT `plan_communications_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=257 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `plan_documents`
--

DROP TABLE IF EXISTS `plan_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plan_documents` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `plan_id` int unsigned NOT NULL,
  `document_type` varchar(30) COLLATE utf8mb4_general_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `author` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT (now()),
  `created_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `updated_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deleted_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_plan_docs_plan_id` (`plan_id`),
  KEY `idx_plan_docs_type` (`document_type`),
  CONSTRAINT `plan_documents_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `plan_impacts`
--

DROP TABLE IF EXISTS `plan_impacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plan_impacts` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `plan_id` int unsigned NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `phase` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'idea',
  `change_type` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pending',
  `description` text COLLATE utf8mb4_general_ci,
  `batch_id` varchar(50) COLLATE utf8mb4_general_ci GENERATED ALWAYS AS (concat(`created_by`,_utf8mb4'-',date_format(`created_at`,_utf8mb4'%Y-%m-%d %H%i'))) STORED,
  `affected_apps` json DEFAULT NULL COMMENT 'Array of apps affected by the change',
  `auto_generated` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'True if auto-generated impact',
  `cross_app_analysis` json DEFAULT NULL COMMENT 'Cross-app dependency analysis results',
  `fileName` varchar(255) COLLATE utf8mb4_general_ci GENERATED ALWAYS AS (substring_index(`file_path`,_utf8mb4'/',-(1))) STORED,
  `fileFolder` varchar(255) COLLATE utf8mb4_general_ci GENERATED ALWAYS AS (substr(`file_path`,1,((length(`file_path`) - length(substring_index(`file_path`,_utf8mb4'/',-(1)))) - 1))) STORED,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_plan_impacts_plan_id` (`plan_id`),
  KEY `idx_plan_impacts_file` (`file_path`),
  KEY `Idx_plan_impacts_phase` (`phase`),
  KEY `idx_plan_impacts_folder` (`fileFolder`),
  KEY `idx_plan_impacts_batch_id` (`batch_id`) USING BTREE,
  KEY `idx_plan_impacts_auto_generated` (`auto_generated`) USING BTREE,
  CONSTRAINT `plan_impacts_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=720 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `plans`
--

DROP TABLE IF EXISTS `plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plans` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `priority` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `comments` text COLLATE utf8mb4_unicode_ci,
  `assigned_to` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT (now()),
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` tinyint(1) GENERATED ALWAYS AS ((case when (`deleted_at` is null) then 1 else 0 end)) STORED,
  PRIMARY KEY (`id`),
  KEY `idx_plans_status` (`status`),
  KEY `idx_plans_created_by` (`created_by`)
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `prodBtchList`
--

DROP TABLE IF EXISTS `prodBtchList`;
/*!50001 DROP VIEW IF EXISTS `prodBtchList`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `prodBtchList` AS SELECT 
 1 AS `prodBtchID`,
 1 AS `btchNbr`,
 1 AS `btchStart`,
 1 AS `btchLoc`,
 1 AS `btchQty`,
 1 AS `measID`,
 1 AS `bestByDate`,
 1 AS `comments`,
 1 AS `prodID`,
 1 AS `prodName`,
 1 AS `prodType`,
 1 AS `acctID`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `prodList`
--

DROP TABLE IF EXISTS `prodList`;
/*!50001 DROP VIEW IF EXISTS `prodList`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `prodList` AS SELECT 
 1 AS `prodID`,
 1 AS `prodName`,
 1 AS `prodCode`,
 1 AS `prodDfltLoc`,
 1 AS `prodDfltBestBy`,
 1 AS `prodDesc`,
 1 AS `prodUpcItemRef`,
 1 AS `prodUpcChkDgt`,
 1 AS `prodTypeID`,
 1 AS `acctID`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `prodTypeList`
--

DROP TABLE IF EXISTS `prodTypeList`;
/*!50001 DROP VIEW IF EXISTS `prodTypeList`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `prodTypeList` AS SELECT 
 1 AS `prodTypeID`,
 1 AS `prodTypeName`,
 1 AS `acctID`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `rcpeList`
--

DROP TABLE IF EXISTS `rcpeList`;
/*!50001 DROP VIEW IF EXISTS `rcpeList`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `rcpeList` AS SELECT 
 1 AS `rcpeID`,
 1 AS `ingrOrdr`,
 1 AS `ingrName`,
 1 AS `qtyMeas`,
 1 AS `prodID`,
 1 AS `ingrTypeSel`,
 1 AS `ingrSel`,
 1 AS `measID`,
 1 AS `Qty`,
 1 AS `Comments`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `select_val`
--

DROP TABLE IF EXISTS `select_val`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `select_val` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ordr` int NOT NULL DEFAULT '1',
  `colName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `value` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `label` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `color` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'Paul',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `active` tinyint(1) GENERATED ALWAYS AS ((case when (`deleted_at` is null) then 1 else 0 end)) STORED,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `taskList`
--

DROP TABLE IF EXISTS `taskList`;
/*!50001 DROP VIEW IF EXISTS `taskList`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `taskList` AS SELECT 
 1 AS `taskID`,
 1 AS `taskName`,
 1 AS `taskDesc`,
 1 AS `taskOrder`,
 1 AS `prodTypeID`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `triggers`
--

DROP TABLE IF EXISTS `triggers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `triggers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trigType` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_dom_event` int DEFAULT NULL,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `content_type` enum('string','object','array','number') COLLATE utf8mb4_general_ci DEFAULT 'object',
  `api_id` int DEFAULT NULL,
  `wrkFlow_id` int DEFAULT NULL,
  `controller_id` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `example` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Paul',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `active` tinyint(1) GENERATED ALWAYS AS ((case when (`deleted_at` is null) then 1 else 0 end)) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `action` (`name`),
  UNIQUE KEY `triggers_USI` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `userAcctList`
--

DROP TABLE IF EXISTS `userAcctList`;
/*!50001 DROP VIEW IF EXISTS `userAcctList`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `userAcctList` AS SELECT 
 1 AS `acctID`,
 1 AS `acctName`,
 1 AS `userID`,
 1 AS `firstName`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `userList`
--

DROP TABLE IF EXISTS `userList`;
/*!50001 DROP VIEW IF EXISTS `userList`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `userList` AS SELECT 
 1 AS `userID`,
 1 AS `lastName`,
 1 AS `firstName`,
 1 AS `userEmail`,
 1 AS `password`,
 1 AS `roleID`,
 1 AS `dfltAcctID`,
 1 AS `lastLogin`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vndrList`
--

DROP TABLE IF EXISTS `vndrList`;
/*!50001 DROP VIEW IF EXISTS `vndrList`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vndrList` AS SELECT 
 1 AS `vndrID`,
 1 AS `vndrName`,
 1 AS `vndrContactName`,
 1 AS `vndrContactPhone`,
 1 AS `vndrContactEmail`,
 1 AS `vndrComments`,
 1 AS `acctID`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_AISql`
--

DROP TABLE IF EXISTS `vw_AISql`;
/*!50001 DROP VIEW IF EXISTS `vw_AISql`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_AISql` AS SELECT 
 1 AS `id`,
 1 AS `category`,
 1 AS `qryName`,
 1 AS `qrySQL`,
 1 AS `description`,
 1 AS `params`,
 1 AS `usage_count`,
 1 AS `created_at`,
 1 AS `created_by`,
 1 AS `updated_at`,
 1 AS `updated_by`,
 1 AS `deleted_at`,
 1 AS `deleted_by`,
 1 AS `active`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_context_store`
--

DROP TABLE IF EXISTS `vw_context_store`;
/*!50001 DROP VIEW IF EXISTS `vw_context_store`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_context_store` AS SELECT 
 1 AS `id`,
 1 AS `paramName`,
 1 AS `paramVal`,
 1 AS `updates`,
 1 AS `getVals`,
 1 AS `email`,
 1 AS `updated_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_execEvents`
--

DROP TABLE IF EXISTS `vw_execEvents`;
/*!50001 DROP VIEW IF EXISTS `vw_execEvents`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_execEvents` AS SELECT 
 1 AS `qryName`,
 1 AS `qrySQL`,
 1 AS `source`,
 1 AS `source_id`,
 1 AS `component_name`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_module_audit`
--

DROP TABLE IF EXISTS `vw_module_audit`;
/*!50001 DROP VIEW IF EXISTS `vw_module_audit`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_module_audit` AS SELECT 
 1 AS `module_id`,
 1 AS `package`,
 1 AS `fileFolder`,
 1 AS `fileName`,
 1 AS `file_path`,
 1 AS `is_active`,
 1 AS `deleted_at`,
 1 AS `last_detected_at`,
 1 AS `days_since_detected`,
 1 AS `module_created`,
 1 AS `module_creator`,
 1 AS `depends_on_count`,
 1 AS `depended_by_count`,
 1 AS `impact_id`,
 1 AS `plan_id`,
 1 AS `change_type`,
 1 AS `phase`,
 1 AS `impact_description`,
 1 AS `impact_status`,
 1 AS `impact_date`,
 1 AS `changed_by`,
 1 AS `affected_apps`,
 1 AS `plan_name`,
 1 AS `plan_status`,
 1 AS `plan_priority`,
 1 AS `audit_status`,
 1 AS `orphan_package`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_module_impact_dtl`
--

DROP TABLE IF EXISTS `vw_module_impact_dtl`;
/*!50001 DROP VIEW IF EXISTS `vw_module_impact_dtl`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_module_impact_dtl` AS SELECT 
 1 AS `plan`,
 1 AS `change_type`,
 1 AS `package`,
 1 AS `fileFolder`,
 1 AS `fileName`,
 1 AS `file_path`,
 1 AS `active`,
 1 AS `last_detected_at`,
 1 AS `impact`,
 1 AS `impact_date`,
 1 AS `impact_by`,
 1 AS `plan_name`,
 1 AS `plan_status`,
 1 AS `affected_apps`,
 1 AS `impact_id`,
 1 AS `impact_status`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_module_map`
--

DROP TABLE IF EXISTS `vw_module_map`;
/*!50001 DROP VIEW IF EXISTS `vw_module_map`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_module_map` AS SELECT 
 1 AS `parent_package`,
 1 AS `child_package`,
 1 AS `status`,
 1 AS `parent_file`,
 1 AS `child_file`,
 1 AS `parent_path`,
 1 AS `child_path`,
 1 AS `crossed`,
 1 AS `child_id`,
 1 AS `parent_id`,
 1 AS `active_parent`,
 1 AS `active_child`,
 1 AS `parent_detected_at`,
 1 AS `child_detected_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_page_analysis`
--

DROP TABLE IF EXISTS `vw_page_analysis`;
/*!50001 DROP VIEW IF EXISTS `vw_page_analysis`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_page_analysis` AS SELECT 
 1 AS `pageID`,
 1 AS `pageName`,
 1 AS `appName`,
 1 AS `appID`,
 1 AS `status`,
 1 AS `tableName`,
 1 AS `template_type`,
 1 AS `parentID`,
 1 AS `tableID`,
 1 AS `contextKey`,
 1 AS `pageTitle`,
 1 AS `formHeadCol`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_plan45`
--

DROP TABLE IF EXISTS `vw_plan45`;
/*!50001 DROP VIEW IF EXISTS `vw_plan45`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_plan45` AS SELECT 
 1 AS `plan_id`,
 1 AS `source`,
 1 AS `agent`,
 1 AS `change_type`,
 1 AS `subject/path`,
 1 AS `message`,
 1 AS `created_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_plan_composite`
--

DROP TABLE IF EXISTS `vw_plan_composite`;
/*!50001 DROP VIEW IF EXISTS `vw_plan_composite`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_plan_composite` AS SELECT 
 1 AS `plan_id`,
 1 AS `source`,
 1 AS `agent`,
 1 AS `change_type`,
 1 AS `subject`,
 1 AS `message`,
 1 AS `created_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_routePath`
--

DROP TABLE IF EXISTS `vw_routePath`;
/*!50001 DROP VIEW IF EXISTS `vw_routePath`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_routePath` AS SELECT 
 1 AS `pageID`,
 1 AS `appID`,
 1 AS `appName`,
 1 AS `pageName`,
 1 AS `Name`,
 1 AS `routePath`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `wf__products`
--

DROP TABLE IF EXISTS `wf__products`;
/*!50001 DROP VIEW IF EXISTS `wf__products`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `wf__products` AS SELECT 
 1 AS `prodTypeName`,
 1 AS `prodName`,
 1 AS `prodCode`,
 1 AS `description`,
 1 AS `bestByDays`,
 1 AS `location`,
 1 AS `prodMeas`,
 1 AS `account_id`,
 1 AS `product_id`,
 1 AS `product_type_id`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `wf_btchSumry`
--

DROP TABLE IF EXISTS `wf_btchSumry`;
/*!50001 DROP VIEW IF EXISTS `wf_btchSumry`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `wf_btchSumry` AS SELECT 
 1 AS `acctName`,
 1 AS `yr`,
 1 AS `IngrCount`,
 1 AS `ProdCount`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `wf_btchTrace`
--

DROP TABLE IF EXISTS `wf_btchTrace`;
/*!50001 DROP VIEW IF EXISTS `wf_btchTrace`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `wf_btchTrace` AS SELECT 
 1 AS `acctName`,
 1 AS `btchCat`,
 1 AS `btchID`,
 1 AS `btchNbr`,
 1 AS `btchDate`,
 1 AS `account_id`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `wf_ingrBtchDtl`
--

DROP TABLE IF EXISTS `wf_ingrBtchDtl`;
/*!50001 DROP VIEW IF EXISTS `wf_ingrBtchDtl`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `wf_ingrBtchDtl` AS SELECT 
 1 AS `ingrTypeName`,
 1 AS `ingrName`,
 1 AS `ingrCode`,
 1 AS `ingrBtchNbr`,
 1 AS `gmsPerOz`,
 1 AS `ingrDesc`,
 1 AS `dfltMeasId`,
 1 AS `dfltVndrId`,
 1 AS `ingrLotNbr`,
 1 AS `purchDate`,
 1 AS `purchQty`,
 1 AS `purchMeas`,
 1 AS `unitQty`,
 1 AS `unitPrice`,
 1 AS `unitRate`,
 1 AS `purchDtl`,
 1 AS `purchAmt`,
 1 AS `purchTotalAmt`,
 1 AS `vndrName`,
 1 AS `brndName`,
 1 AS `bestByDate`,
 1 AS `prdBtchCnt`,
 1 AS `comments`,
 1 AS `shopEvent`,
 1 AS `ingrActv`,
 1 AS `ingrBtchActv`,
 1 AS `ingrTypeActv`,
 1 AS `account_id`,
 1 AS `ingredient_batch_id`,
 1 AS `ingredient_id`,
 1 AS `ingredient_type_id`,
 1 AS `vendor_id`,
 1 AS `brand_id`,
 1 AS `measure_id`,
 1 AS `shop_event_id`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `wf_ingrBtchLast`
--

DROP TABLE IF EXISTS `wf_ingrBtchLast`;
/*!50001 DROP VIEW IF EXISTS `wf_ingrBtchLast`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `wf_ingrBtchLast` AS SELECT 
 1 AS `ingredient_id`,
 1 AS `lastPurchDate`,
 1 AS `lastBtchNbr`,
 1 AS `btchCount`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `wf_ingrBtchMetrics`
--

DROP TABLE IF EXISTS `wf_ingrBtchMetrics`;
/*!50001 DROP VIEW IF EXISTS `wf_ingrBtchMetrics`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `wf_ingrBtchMetrics` AS SELECT 
 1 AS `ingrTypeName`,
 1 AS `ingrName`,
 1 AS `ingrCode`,
 1 AS `ingrDesc`,
 1 AS `gmsPerOz`,
 1 AS `recipes`,
 1 AS `batches`,
 1 AS `ingredient_type_id`,
 1 AS `ingredient_id`,
 1 AS `account_id`,
 1 AS `ingrActv`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `wf_ingrBtchSumry`
--

DROP TABLE IF EXISTS `wf_ingrBtchSumry`;
/*!50001 DROP VIEW IF EXISTS `wf_ingrBtchSumry`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `wf_ingrBtchSumry` AS SELECT 
 1 AS `ingrName`,
 1 AS `batches`,
 1 AS `totalQty`,
 1 AS `min_rate`,
 1 AS `max_rate`,
 1 AS `avgRate`,
 1 AS `units`,
 1 AS `totalCost`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `wf_ingrBtchTrace`
--

DROP TABLE IF EXISTS `wf_ingrBtchTrace`;
/*!50001 DROP VIEW IF EXISTS `wf_ingrBtchTrace`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `wf_ingrBtchTrace` AS SELECT 
 1 AS `ingrTypeName`,
 1 AS `ingrName`,
 1 AS `purchDate`,
 1 AS `vndrName`,
 1 AS `brndName`,
 1 AS `ingrBtchNbr`,
 1 AS `prodBtchNbr`,
 1 AS `prodBtchDate`,
 1 AS `product`,
 1 AS `location`,
 1 AS `prodQtyMeas`,
 1 AS `prodBtchQty`,
 1 AS `purchAmt`,
 1 AS `purchDtl`,
 1 AS `account_id`,
 1 AS `ingredient_id`,
 1 AS `product_id`,
 1 AS `ingredient_batch_id`,
 1 AS `product_batch_id`,
 1 AS `map_id`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `wf_ingrGrid`
--

DROP TABLE IF EXISTS `wf_ingrGrid`;
/*!50001 DROP VIEW IF EXISTS `wf_ingrGrid`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `wf_ingrGrid` AS SELECT 
 1 AS `id`,
 1 AS `code`,
 1 AS `name`,
 1 AS `default_vendor`,
 1 AS `default_measure`,
 1 AS `ingredient_type_id`,
 1 AS `account_id`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `wf_ingrPricing`
--

DROP TABLE IF EXISTS `wf_ingrPricing`;
/*!50001 DROP VIEW IF EXISTS `wf_ingrPricing`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `wf_ingrPricing` AS SELECT 
 1 AS `ingrTypeName`,
 1 AS `ingrName`,
 1 AS `ingredient_id`,
 1 AS `account_id`,
 1 AS `unitQty`,
 1 AS `purchMeas`,
 1 AS `purchases`,
 1 AS `maxPrice`,
 1 AS `minPrice`,
 1 AS `avgPrice`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `wf_prdBtchIngrMap`
--

DROP TABLE IF EXISTS `wf_prdBtchIngrMap`;
/*!50001 DROP VIEW IF EXISTS `wf_prdBtchIngrMap`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `wf_prdBtchIngrMap` AS SELECT 
 1 AS `prodBtchNbr`,
 1 AS `ingrOrdr`,
 1 AS `ingrName`,
 1 AS `ingrQtyMeas`,
 1 AS `ingrMaps`,
 1 AS `prodIngrDesc`,
 1 AS `ingredient_id`,
 1 AS `product_id`,
 1 AS `product_type_id`,
 1 AS `product_recipe_id`,
 1 AS `product_batch_id`,
 1 AS `btchQtyMeas`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `wf_prdBtchIngr_Map`
--

DROP TABLE IF EXISTS `wf_prdBtchIngr_Map`;
/*!50001 DROP VIEW IF EXISTS `wf_prdBtchIngr_Map`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `wf_prdBtchIngr_Map` AS SELECT 
 1 AS `prodBtchNbr`,
 1 AS `ingrOrdr`,
 1 AS `ingrName`,
 1 AS `ingrQtyMeas`,
 1 AS `ingrMaps`,
 1 AS `prodIngrDesc`,
 1 AS `ingredient_id`,
 1 AS `product_id`,
 1 AS `product_type_id`,
 1 AS `product_recipe_id`,
 1 AS `product_batch_id`,
 1 AS `btchQtyMeas`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `wf_prdBtchIngr_map`
--

DROP TABLE IF EXISTS `wf_prdBtchIngr_map`;
/*!50001 DROP VIEW IF EXISTS `wf_prdBtchIngr_map`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `wf_prdBtchIngr_map` AS SELECT 
 1 AS `prodBtchNbr`,
 1 AS `ingrOrdr`,
 1 AS `ingrName`,
 1 AS `ingrQtyMeas`,
 1 AS `ingrMaps`,
 1 AS `prodIngrDesc`,
 1 AS `ingredient_id`,
 1 AS `product_id`,
 1 AS `product_type_id`,
 1 AS `product_recipe_id`,
 1 AS `product_batch_id`,
 1 AS `btchQtyMeas`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `wf_prodBtchDtl`
--

DROP TABLE IF EXISTS `wf_prodBtchDtl`;
/*!50001 DROP VIEW IF EXISTS `wf_prodBtchDtl`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `wf_prodBtchDtl` AS SELECT 
 1 AS `prodName`,
 1 AS `prodCode`,
 1 AS `prodTypeName`,
 1 AS `rcpeQty`,
 1 AS `rcpeMeas`,
 1 AS `rcpeMultFctr`,
 1 AS `ingrMaps`,
 1 AS `taskMaps`,
 1 AS `totalMaps`,
 1 AS `location`,
 1 AS `btchQty`,
 1 AS `btchMeas`,
 1 AS `qtyMeas`,
 1 AS `prodBtchDate`,
 1 AS `comments`,
 1 AS `prodBtchNbr`,
 1 AS `bestByDate`,
 1 AS `prodActv`,
 1 AS `prodBtchActv`,
 1 AS `prdTypeActv`,
 1 AS `prodBtchCreatedAt`,
 1 AS `product_type_id`,
 1 AS `product_id`,
 1 AS `product_batch_id`,
 1 AS `account_id`,
 1 AS `measure_id`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `wf_prodBtchIngrDtl`
--

DROP TABLE IF EXISTS `wf_prodBtchIngrDtl`;
/*!50001 DROP VIEW IF EXISTS `wf_prodBtchIngrDtl`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `wf_prodBtchIngrDtl` AS SELECT 
 1 AS `prodTypeName`,
 1 AS `prodName`,
 1 AS `prodBtchDate`,
 1 AS `btchQty`,
 1 AS `btchComments`,
 1 AS `unitMeas`,
 1 AS `qtyMeas`,
 1 AS `prodBtchNbr`,
 1 AS `location`,
 1 AS `ingrComments`,
 1 AS `ingrOrdr`,
 1 AS `ingrName`,
 1 AS `ingrBtchNbr`,
 1 AS `ingrBtchSrceHTML`,
 1 AS `ingrBtchSrce`,
 1 AS `ingrLotNbr`,
 1 AS `purchDate`,
 1 AS `purchDtl`,
 1 AS `purchAmt`,
 1 AS `vndrName`,
 1 AS `brndName`,
 1 AS `prodIngrDesc`,
 1 AS `prodBtchActv`,
 1 AS `prodActv`,
 1 AS `ingrBtchActv`,
 1 AS `account_id`,
 1 AS `product_id`,
 1 AS `product_type_id`,
 1 AS `ingredient_id`,
 1 AS `map_id`,
 1 AS `measure_id`,
 1 AS `product_batch_id`,
 1 AS `product_recipe_id`,
 1 AS `ingredient_batch_id`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `wf_prodBtchIngrID`
--

DROP TABLE IF EXISTS `wf_prodBtchIngrID`;
/*!50001 DROP VIEW IF EXISTS `wf_prodBtchIngrID`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `wf_prodBtchIngrID` AS SELECT 
 1 AS `prodTypeName`,
 1 AS `prodName`,
 1 AS `prodBtchDate`,
 1 AS `btchQty`,
 1 AS `btchComments`,
 1 AS `unitMeas`,
 1 AS `qtyMeas`,
 1 AS `prodBtchNbr`,
 1 AS `location`,
 1 AS `ingrComments`,
 1 AS `ingrOrdr`,
 1 AS `ingrName`,
 1 AS `ingrBtchNbr`,
 1 AS `ingrBtchSrceHTML`,
 1 AS `ingrBtchSrce`,
 1 AS `ingrLotNbr`,
 1 AS `purchDate`,
 1 AS `purchDtl`,
 1 AS `purchAmt`,
 1 AS `vndrName`,
 1 AS `brndName`,
 1 AS `prodIngrDesc`,
 1 AS `prodBtchActv`,
 1 AS `prodActv`,
 1 AS `ingrBtchActv`,
 1 AS `account_id`,
 1 AS `product_id`,
 1 AS `product_type_id`,
 1 AS `ingredient_id`,
 1 AS `product_batch_ingredient_id`,
 1 AS `measure_id`,
 1 AS `product_batch_id`,
 1 AS `product_recipe_id`,
 1 AS `ingredient_batch_id`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `wf_prodBtchLast`
--

DROP TABLE IF EXISTS `wf_prodBtchLast`;
/*!50001 DROP VIEW IF EXISTS `wf_prodBtchLast`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `wf_prodBtchLast` AS SELECT 
 1 AS `prodTypeName`,
 1 AS `prodName`,
 1 AS `prodCode`,
 1 AS `prodBtchDate`,
 1 AS `prodBtchNbr`,
 1 AS `account_id`,
 1 AS `product_id`,
 1 AS `product_batch_id`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `wf_prodBtchTaskDtl`
--

DROP TABLE IF EXISTS `wf_prodBtchTaskDtl`;
/*!50001 DROP VIEW IF EXISTS `wf_prodBtchTaskDtl`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `wf_prodBtchTaskDtl` AS SELECT 
 1 AS `ordr`,
 1 AS `taskName`,
 1 AS `prodBtchNbr`,
 1 AS `workers`,
 1 AS `taskWrkrs`,
 1 AS `measureValue`,
 1 AS `comments`,
 1 AS `taskActv`,
 1 AS `product_batch_task_id`,
 1 AS `product_batch_id`,
 1 AS `product_id`,
 1 AS `task_id`,
 1 AS `account_id`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `wf_prodRcpeDtl`
--

DROP TABLE IF EXISTS `wf_prodRcpeDtl`;
/*!50001 DROP VIEW IF EXISTS `wf_prodRcpeDtl`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `wf_prodRcpeDtl` AS SELECT 
 1 AS `prodTypeName`,
 1 AS `prodName`,
 1 AS `rcpeQty`,
 1 AS `rcpeMeas`,
 1 AS `ingrOrdr`,
 1 AS `ingrCode`,
 1 AS `ingrName`,
 1 AS `ingrType`,
 1 AS `ingrQtyMeas`,
 1 AS `ingrQty`,
 1 AS `ingrMeas`,
 1 AS `prdDesc`,
 1 AS `prodIngrDesc`,
 1 AS `prodRcpeActv`,
 1 AS `prodActv`,
 1 AS `ingrActv`,
 1 AS `product_recipe_id`,
 1 AS `account_id`,
 1 AS `product_id`,
 1 AS `product_type_id`,
 1 AS `ingredient_id`,
 1 AS `ingredient_type_id`,
 1 AS `measure_id`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `wf_prodTypeTasks`
--

DROP TABLE IF EXISTS `wf_prodTypeTasks`;
/*!50001 DROP VIEW IF EXISTS `wf_prodTypeTasks`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `wf_prodTypeTasks` AS SELECT 
 1 AS `prdTypeName`,
 1 AS `taskOrdr`,
 1 AS `taskName`,
 1 AS `taskDesc`,
 1 AS `prodTypeActive`,
 1 AS `taskActive`,
 1 AS `account_id`,
 1 AS `task_id`,
 1 AS `prd_type_id`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `wf_shopEvent`
--

DROP TABLE IF EXISTS `wf_shopEvent`;
/*!50001 DROP VIEW IF EXISTS `wf_shopEvent`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `wf_shopEvent` AS SELECT 
 1 AS `shopName`,
 1 AS `totalAmt`,
 1 AS `items`,
 1 AS `comments`,
 1 AS `vndrName`,
 1 AS `shopDate`,
 1 AS `account_id`,
 1 AS `vendor_id`,
 1 AS `shop_event_id`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `wrkrList`
--

DROP TABLE IF EXISTS `wrkrList`;
/*!50001 DROP VIEW IF EXISTS `wrkrList`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `wrkrList` AS SELECT 
 1 AS `wrkrID`,
 1 AS `wrkrName`,
 1 AS `acctID`*/;
SET character_set_client = @saved_cs_client;

--
-- Dumping routines for database 'api_wf'
--
/*!50003 DROP FUNCTION IF EXISTS `f_acctActive` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_acctActive`(
	`iID` INT
) RETURNS char(1) CHARSET utf8mb4
    DETERMINISTIC
BEGIN
	declare oVal text;
	
	select active into oVal
	from accounts
	where id = iID;
	
	return oVal;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_aiParams` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_aiParams`(qryID INT) RETURNS text CHARSET utf8mb4 COLLATE utf8mb4_general_ci
    DETERMINISTIC
BEGIN
  DECLARE sql_text TEXT;
  DECLARE i INT DEFAULT 1;
  DECLARE param TEXT;
  DECLARE result TEXT DEFAULT '';

  SELECT qrySQL INTO sql_text
  FROM AISql
  WHERE id = qryID;

  param_loop: WHILE TRUE DO
    SET param = REGEXP_SUBSTR(sql_text, ':[a-zA-Z_][a-zA-Z0-9_]*', 1, i);
    IF param IS NULL THEN
      LEAVE param_loop;
    END IF;
    SET result = CONCAT(result, IF(result = '', '', ', '), param);
    SET i = i + 1;
  END WHILE param_loop;

  RETURN CONCAT('[', result, ']');
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_apiParent` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_apiParent`(
	`iID` INT
) RETURNS text CHARSET utf8mb4
    DETERMINISTIC
BEGIN
    DECLARE o_val text;
    
    IF ISNULL(iID) THEN
        SET o_val = '-';  -- This is the default or Not Determined Value
    ELSE
        SELECT grp INTO o_val
        FROM v_apiGroupParents
        WHERE id = iID;

        IF ISNULL(o_val) THEN
            SET o_val = '-';  -- This is the default or Not Determined Value
        END IF;
    END IF;

    RETURN o_val;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_brand` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_brand`(
	`iID` INT
) RETURNS text CHARSET utf8mb4
    DETERMINISTIC
BEGIN
	declare oVal 	VARCHAR(100);
	
	if isnull(iID) then
		set oVal = '-';  -- This is the default or Not Determined Value
	else
		select name into oVal
			from brands a
		where a.id = iID;

		if isnull(oVal) then
			set oVal = '-';  -- This is the default or Not Determined Value
		end if;
	end if;

	return oVal;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_EventStatus` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_EventStatus`(
	`iEventType` VARCHAR(50)
) RETURNS varchar(20) CHARSET utf8mb4
    DETERMINISTIC
BEGIN
DECLARE o_val text;

    IF ISNULL(iEventType) THEN
        SET o_val = '-';  -- This is the default or Not Determined Value
    ELSE
        SELECT status INTO o_val
        FROM apiTests
        WHERE eventType COLLATE utf8mb4_unicode_ci = iEventType COLLATE utf8mb4_unicode_ci;

        IF ISNULL(o_val) THEN
            SET o_val = '-';  -- This is the default or Not Determined Value
        END IF;
    END IF;

    RETURN o_val;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_json_to_com_delim` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_json_to_com_delim`(
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_measure_unit` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_measure_unit`(	i_id INT ) RETURNS varchar(100) CHARSET latin1
    READS SQL DATA
    COMMENT 'IN: measure_id OUT: measure_unit'
BEGIN
	declare o_val 	VARCHAR(100);
	
	if isnull(i_id) then
		set o_val = '-';  -- This is the default or Not Determined Value
	else
		select name into o_val
		from whatsfresh.measures
		where id = i_id;

		if isnull(o_val) then
			set o_val = '-';  -- This is the default or Not Determined Value
		end if;
	end if;

	return o_val;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_params` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_params`(qryID INT) RETURNS text CHARSET utf8mb4 COLLATE utf8mb4_general_ci
    DETERMINISTIC
BEGIN
  DECLARE sql_text TEXT;
  DECLARE i INT DEFAULT 1;
  DECLARE param TEXT;
  DECLARE result TEXT DEFAULT '';

  -- Get the qrySQL for the given ID
  SELECT qrySQL INTO sql_text
  FROM eventSQL
  WHERE id = qryID;

  -- Named loop to allow LEAVE
  param_loop: WHILE TRUE DO
    SET param = REGEXP_SUBSTR(sql_text, ':[a-zA-Z_][a-zA-Z0-9_]*', 1, i);
    IF param IS NULL THEN
      LEAVE param_loop;
    END IF;
    SET result = CONCAT(result, IF(result = '', '', ', '), param);
    SET i = i + 1;
  END WHILE param_loop;

  RETURN CONCAT('[', result, ']');
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_qryParam` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_qryParam`(
	`iParam` VARCHAR(50),
	`iEmail` VARCHAR(50)
) RETURNS text CHARSET utf8mb4 COLLATE utf8mb4_general_ci
    DETERMINISTIC
BEGIN
	DECLARE oVal VARCHAR(100);
	
	IF ISNULL(iParam) THEN
    SET oVal = 'Invalid Param';
  ELSE
    SELECT a.paramVal INTO oVal
    FROM context_store a
    WHERE a.paramName = iParam
      AND a.email = iEmail
    LIMIT 1;

    SET oVal = COALESCE(oVal, 'Param Not Found');
  END IF;
  return oVal;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_recipeCnt` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_recipeCnt`(
	`iID` INT
) RETURNS int
    DETERMINISTIC
BEGIN
	declare oVal int;
	
	select ingredient_id, ifnull(count(*),0) into oVal
		from   product_recipes
		where active = 'Y'
		and ingredient_id = iID
		group by 1;
	
		
	return oVal;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_resolvePageTokens` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_resolvePageTokens`(
content text,
pageID int) RETURNS text CHARSET utf8mb3 COLLATE utf8mb3_unicode_ci
    DETERMINISTIC
BEGIN                                                                                                                                
     DECLARE resolved TEXT;                                                                                                                                              
     DECLARE pageName VARCHAR(50);          
	 DECLARE appName VARCHAR(50);     
     DECLARE templateType VARCHAR(20);                                                                                                                                     
     DECLARE propsJson JSON;                                                                                                                                               
                                                                                                                                                                           
     -- Return NULL if content is NULL                                                                                                                                     
     IF content IS NULL THEN                                                                                                                                               
         RETURN NULL;                                                                                                                                                      
     END IF;                                                                                                                                                               
                                                                                                                                                                           
     -- Lookup page metadata                                                                                                                                               
     SELECT                                                                                                                                                                
         reg.pageName,                                                                                                                                                     
         reg.appName,                                                                                                                                                      
         JSON_UNQUOTE(JSON_EXTRACT(reg.props, '$.template_type')),                                                                                                         
         reg.props                                                                                                                                                         
     INTO pageName, appName, templateType, propsJson                                                                                                                       
     FROM api_wf.page_registry reg                                                                                                                                         
     WHERE reg.id = pageID;                                                                                                                                                
                                                                                                                                                                           
     -- Start with original content                                                                                                                                        
     SET resolved = content;                                                                                                                                               
                                                                                                                                                                           
     -- Replace top-level pageConfig tokens                                                                                                                                
     SET resolved = REPLACE(resolved, '{{pageConfig.pageName}}', IFNULL(pageName, ''));                                                                                    
     SET resolved = REPLACE(resolved, '{{pageConfig.appName}}', IFNULL(appName, ''));                                                                                      
                                                                                                                                                                              
     -- Replace pageConfig.props.* tokens if propsJson exists                                                                                                              
     IF propsJson IS NOT NULL THEN                                                                                                                                         
         -- tableName                                                                                                                                                      
         IF JSON_CONTAINS_PATH(propsJson, 'one', '$.tableName') THEN                                                                                                       
             SET resolved = REPLACE(resolved,                                                                                                                              
                 '{{pageConfig.props.tableName}}',                                                                                                                         
                 JSON_UNQUOTE(JSON_EXTRACT(propsJson, '$.tableName'))                                                                                                      
             );                                                                                                                                                            
         END IF;                                                                                                                                                           
                                                                                                                                                                           
         -- tableID                                                                                                                                                        
         IF JSON_CONTAINS_PATH(propsJson, 'one', '$.tableID') THEN                                                                                                         
             SET resolved = REPLACE(resolved,                                                                                                                              
                 '{{pageConfig.props.tableID}}',                                                                                                                           
                 JSON_UNQUOTE(JSON_EXTRACT(propsJson, '$.tableID'))                                                                                                        
             );                                                                                                                                                            
         END IF;                                                                                                                                                           
                                                                                                                                                                           
         -- contextKey                                                                                                                                                     
         IF JSON_CONTAINS_PATH(propsJson, 'one', '$.contextKey') THEN                                                                                                      
             SET resolved = REPLACE(resolved,                                                                                                                              
                 '{{pageConfig.props.contextKey}}',                                                                                                                        
                 JSON_UNQUOTE(JSON_EXTRACT(propsJson, '$.contextKey'))                                                                                                     
             );                                                                                                                                                            
         END IF;                                                                                                                                                           
                                                                                                                                                                           
         -- pageTitle                                                                                                                                                      
         IF JSON_CONTAINS_PATH(propsJson, 'one', '$.pageTitle') THEN                                                                                                       
             SET resolved = REPLACE(resolved,                                                                                                                              
                 '{{pageConfig.props.pageTitle}}',                                                                                                                         
                 JSON_UNQUOTE(JSON_EXTRACT(propsJson, '$.pageTitle'))                                                                                                      
             );                                                                                                                                                            
         END IF;                                                                                                                                                           
                                                                                                                                                                           
         -- formHeadCol                                                                                                                                                    
         IF JSON_CONTAINS_PATH(propsJson, 'one', '$.formHeadCol') THEN                                                                                                     
             SET resolved = REPLACE(resolved,                                                                                                                              
                 '{{pageConfig.props.formHeadCol}}',                                                                                                                       
                 JSON_UNQUOTE(JSON_EXTRACT(propsJson, '$.formHeadCol'))                                                                                                    
             );                                                                                                                                                            
         END IF;                                                                                                                                                           
                                                                                                                                                                           
         -- parentID (may contain [context] reference, but we resolve the prop name itself)                                                                                
         IF JSON_CONTAINS_PATH(propsJson, 'one', '$.parentID') THEN                                                                                                        
             SET resolved = REPLACE(resolved,                                                                                                                              
                 '{{pageConfig.props.parentID}}',                                                                                                                          
                 JSON_UNQUOTE(JSON_EXTRACT(propsJson, '$.parentID'))                                                                                                       
             );                                                                                                                                                            
         END IF;                                                                                                                                                           
     END IF;                                                                                                                                                               
                                                                                                                                                                           
     RETURN resolved;                                                                                                                                                      
 END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_shop_event` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_shop_event`(
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_vendor` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_vendor`(
	`iID` INT
) RETURNS text CHARSET utf8mb4
    DETERMINISTIC
BEGIN
	declare oVal 	VARCHAR(100);
	
	if isnull(iID) then
		set oVal = '-';  -- This is the default or Not Determined Value
	else
		select name into oVal
			from whatsfresh.vendors a
		where a.id = iID;

		if isnull(oVal) then
			set oVal = '-';  -- This is the default or Not Determined Value
		end if;
	end if;

	return oVal;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `f_xrefParent` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` FUNCTION `f_xrefParent`(
	`parentID` INT
) RETURNS text CHARSET utf8mb4
    DETERMINISTIC
BEGIN
    DECLARE o_val text;
    
    IF ISNULL(parentID) THEN
        SET o_val = '-';  -- This is the default or Not Determined Value
    ELSE
        SELECT comp_name INTO o_val
        FROM eventComp_xref
        WHERE id = parentID;

        IF ISNULL(o_val) THEN
            SET o_val = '-';  -- This is the default or Not Determined Value
        END IF;
    END IF;

    RETURN o_val;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GenColumnJSON` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` PROCEDURE `GenColumnJSON`(
	IN `iListEvent` VARCHAR(50)
)
    DETERMINISTIC
BEGIN
    DECLARE columns_json LONGTEXT DEFAULT '';

    -- Set the character set and collation for the session
    SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci';
    SET collation_connection = 'utf8mb4_unicode_ci';

    -- Convert iListEvent to the same collation
    SET iListEvent = CONVERT(iListEvent USING utf8mb4);

    -- Generate JSON for the specified listEvent
    SELECT 
        JSON_ARRAYAGG(
            CONCAT(
                '{"field": "', COLUMN_NAME, '",',
                '"label": "",',
                '"hidden": 0,',
                '"dbCol": "",',
                '"setVar": "', ':', COLUMN_NAME, '",',
                '"style": null,',
                '"required": null}'
            )
        )
    INTO columns_json
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'api_wf' COLLATE utf8mb4_unicode_ci
      AND TABLE_NAME = iListEvent COLLATE utf8mb4_unicode_ci
      AND TABLE_NAME NOT LIKE '%api%' COLLATE utf8mb4_unicode_ci;

    -- Ensure the target table column is set to the correct character set and collation
    UPDATE apiPages
    SET colmns = CONCAT('[', columns_json, ']')
    WHERE listEvent = iListEvent COLLATE utf8mb4_unicode_ci;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_genFields` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` PROCEDURE `sp_genFields`(
    IN p_xref_id INT
)
BEGIN
    DECLARE v_table_name VARCHAR(100);
    DECLARE v_schema_name VARCHAR(100);
    DECLARE v_component_type VARCHAR(20);
    DECLARE v_qry_sql TEXT;
    DECLARE v_full_table_name VARCHAR(200);
    DECLARE v_select_clause TEXT;

    -- Get component details from vw_eventSQL
    SELECT a.comp_type, a.qrySQL
    INTO v_component_type, v_qry_sql
    FROM vw_eventSQL a
    WHERE a.xref_id = p_xref_id;

    -- Extract SELECT clause (between SELECT and FROM)
    SET v_select_clause = SUBSTRING_INDEX(SUBSTRING_INDEX(LOWER(v_qry_sql), 'from ', 1), 'select ', -1);
    SET v_select_clause = REPLACE(REPLACE(REPLACE(v_select_clause, '\r\n', ' '), '\n', ' '), '\t', ' ');
    SET v_select_clause = TRIM(v_select_clause);

    -- Extract FROM clause for table name
    SET @from_pos = LOCATE('from ', LOWER(v_qry_sql));
    IF @from_pos > 0 THEN
        SET v_full_table_name = SUBSTRING(v_qry_sql, @from_pos + 5);
        SET v_full_table_name = REPLACE(REPLACE(REPLACE(v_full_table_name, '\r\n', ' '), '\n', ' '), '\t', ' ');
        SET v_full_table_name = TRIM(SUBSTRING_INDEX(v_full_table_name, ' ', 1));
    END IF;
    SET v_full_table_name = TRIM(BOTH ', ' FROM v_full_table_name);

    -- Extract schema and table name
    IF LOCATE('.', v_full_table_name) > 0 THEN
        SET v_schema_name = SUBSTRING_INDEX(v_full_table_name, '.', 1);
        SET v_table_name = SUBSTRING_INDEX(v_full_table_name, '.', -1);
    ELSE
        SET v_schema_name = 'api_wf';
        SET v_table_name = v_full_table_name;
    END IF;

    -- RESULT SET 1: Metadata
    SELECT
        p_xref_id as xref_id,
        v_table_name as table_name,
        v_schema_name as schema_name,
        v_component_type as component_type,
        v_select_clause as selected_columns;

    -- RESULT SET 2: Field configurations (only columns in SELECT)
    SELECT
        column_name as name,
        data_type as dataType,
        is_nullable as nullable,
        column_default as defaultValue,
        CASE
            WHEN data_type IN ('text', 'longtext') THEN 'textarea'
            WHEN data_type IN ('datetime', 'timestamp') THEN 'datetime-local'
            WHEN data_type = 'date' THEN 'date'
            WHEN data_type IN ('int', 'bigint', 'decimal', 'float', 'double') THEN 'number'
            WHEN data_type = 'tinyint' THEN 'checkbox'
            ELSE 'text'
        END as inputType
    FROM information_schema.columns
    WHERE table_schema = v_schema_name
      AND table_name = v_table_name
      AND FIND_IN_SET(column_name, REPLACE(v_select_clause, ' ', '')) > 0
    ORDER BY FIND_IN_SET(column_name, REPLACE(v_select_clause, ' ', ''));

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_hier_structure` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` PROCEDURE `sp_hier_structure`(IN pageID INT)
BEGIN
    WITH RECURSIVE component_tree AS (
        -- Anchor
        SELECT
            x.id AS xref_id,
            x.pageID,
            reg.pageName,
            reg.appName,
            x.parent_id,
            x.comp_name,
            reg.pageName AS parent_name,
            CONCAT(reg.pageName, '.', x.comp_name) AS parentCompName,
            x.title,
            x.comp_type,
            x.description,
            x.posOrder,
            x.style AS override_styles,
            0 AS level,
            CAST(x.id AS CHAR(500)) AS id_path
        FROM api_wf.eventComp_xref x
        JOIN api_wf.page_registry reg ON x.pageID = reg.id
        WHERE x.pageID = pageID
          AND x.parent_id = x.id
          AND x.active = 1

        UNION ALL

        -- Recursive
        SELECT
            child.id,
            child.pageID,
            reg.pageName,
            reg.appName,
            child.parent_id,
            child.comp_name,
            parent_tree.comp_name AS parent_name,
            CONCAT(parent_tree.comp_name, '.', child.comp_name) AS parentCompName,
            child.title,
            child.comp_type,
            child.description,
            child.posOrder,
            child.style,
            parent_tree.level + 1,
            CONCAT(parent_tree.id_path, ',', child.id)
        FROM api_wf.eventComp_xref child
        JOIN component_tree parent_tree ON child.parent_id = parent_tree.xref_id
        JOIN api_wf.page_registry reg ON child.pageID = reg.id
        WHERE child.active = 1
          AND child.parent_id != child.id
          AND parent_tree.level < 20
    )
    SELECT
        ct.xref_id AS id,
        ct.parent_id,
        ct.pageID,
        ct.pageName,
        ct.appName,
        ct.comp_name,
        ct.parent_name,
        ct.parentCompName,
        ct.title,
        ct.comp_type,
        ct.description,
        ct.posOrder,
        ct.override_styles,
        CASE WHEN ct.comp_type = 'Modal' THEN 0 ELSE ct.level END AS level,
        ct.id_path
    FROM component_tree ct
    ORDER BY 
        CASE WHEN ct.comp_type = 'Modal' THEN 0 ELSE ct.level END,
        ct.posOrder;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_module_load` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` PROCEDURE `sp_module_load`(
IN p_modules JSON,
IN p_user_id VARCHAR(50)
)
BEGIN
      DECLARE v_idx INT DEFAULT 0;
      DECLARE v_module_count INT;
      DECLARE v_file_path VARCHAR(500);
      DECLARE v_module_id INT;
      DECLARE v_upserted_count INT DEFAULT 0;
      DECLARE v_module JSON;
      DECLARE v_run_timestamp DATETIME;

      DECLARE EXIT HANDLER FOR SQLEXCEPTION
      BEGIN
          ROLLBACK;
          RESIGNAL;
      END;

      START TRANSACTION;

      -- Capture run timestamp at the beginning
      SET v_run_timestamp = NOW();
      SET v_module_count = JSON_LENGTH(p_modules);

      -- Mark ALL active modules with the run timestamp (but don't update last_detected_at yet)
      UPDATE api_wf.modules
      SET updated_at = v_run_timestamp,
          updated_by = p_user_id
      WHERE deleted_at IS NULL;

      -- Process each module detected in this run
      WHILE v_idx < v_module_count DO
          SET v_module = JSON_EXTRACT(p_modules, CONCAT('$[', v_idx, ']'));
          SET v_file_path = JSON_UNQUOTE(JSON_EXTRACT(v_module, '$.file_path'));

          SET v_module_id = NULL;

          -- Check if module exists
          SELECT id INTO v_module_id
          FROM api_wf.modules
          WHERE file_path = v_file_path;

          IF v_module_id IS NOT NULL THEN
              -- Update: reactivate if soft deleted, mark as detected
              UPDATE api_wf.modules
              SET
                  deleted_at = NULL,
                  deleted_by = NULL,
                  updated_at = v_run_timestamp,
                  updated_by = p_user_id,
                  last_detected_at = v_run_timestamp
              WHERE id = v_module_id;
          ELSE
              -- Insert new module
              INSERT INTO api_wf.modules (file_path, created_by, created_at, updated_at, last_detected_at)
              VALUES (v_file_path, p_user_id, v_run_timestamp, v_run_timestamp, v_run_timestamp);
          END IF;

          SET v_upserted_count = v_upserted_count + 1;
          SET v_idx = v_idx + 1;
      END WHILE;

      -- Soft delete modules that weren't detected in this run
      -- (updated_at = v_run_timestamp but last_detected_at < v_run_timestamp)
      UPDATE api_wf.modules
      SET
          deleted_at = v_run_timestamp,
          deleted_by = p_user_id
      WHERE deleted_at IS NULL
        AND updated_at = v_run_timestamp
        AND last_detected_at < v_run_timestamp;

      COMMIT;

      -- Return summary
      SELECT
          v_upserted_count AS modules_processed,
          (SELECT COUNT(*) FROM api_wf.modules WHERE deleted_at = v_run_timestamp) AS modules_soft_deleted,
          (SELECT COUNT(*) FROM api_wf.modules WHERE deleted_at IS NULL) AS active_modules;

  END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_module_map` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` PROCEDURE `sp_module_map`(
IN p_dependencies JSON,
IN firstName VARCHAR(50)
)
BEGIN
    DECLARE dependencies_mapped INT DEFAULT 0;
    DECLARE dependencies_skipped INT DEFAULT 0;
    DECLARE done INT DEFAULT FALSE;
    DECLARE current_from_path VARCHAR(500);
    DECLARE current_to_path VARCHAR(500);
    DECLARE from_module_id INT;
    DECLARE to_module_id INT;
    
    -- Variables for manual JSON parsing
    DECLARE v_idx INT DEFAULT 0;
    DECLARE v_dependency_count INT;
    DECLARE v_dependency JSON;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Soft delete existing dependencies (mark as obsolete)
    UPDATE api_wf.module_xref 
    SET 
        deleted_at = NOW(),
        deleted_by = firstName,
        updated_at = NOW(),
        updated_by = firstName
    WHERE deleted_at IS NULL;
    
    SET v_dependency_count = JSON_LENGTH(p_dependencies);
    
    -- Process each dependency
    WHILE v_idx < v_dependency_count DO
        SET v_dependency = JSON_EXTRACT(p_dependencies, CONCAT('$[', v_idx, ']'));
        SET current_from_path = JSON_UNQUOTE(JSON_EXTRACT(v_dependency, '$.from_path'));
        SET current_to_path = JSON_UNQUOTE(JSON_EXTRACT(v_dependency, '$.to_path'));
        
        -- Get module IDs for both paths
        SELECT id INTO from_module_id 
        FROM api_wf.modules 
        WHERE file_path = current_from_path AND deleted_at IS NULL
        LIMIT 1;
        
        SELECT id INTO to_module_id 
        FROM api_wf.modules 
        WHERE file_path = current_to_path AND deleted_at IS NULL
        LIMIT 1;
        
        -- Only create mapping if both modules exist
        IF from_module_id IS NOT NULL AND to_module_id IS NOT NULL THEN
            -- Check if dependency already exists (active or inactive)
            IF EXISTS (
                SELECT 1 FROM api_wf.module_xref 
                WHERE module_id = from_module_id 
                AND parent_id = to_module_id
            ) THEN
                -- Reactivate existing mapping
                UPDATE api_wf.module_xref
                SET 
                    deleted_at = NULL,
                    deleted_by = NULL,
                    updated_at = NOW(),
                    updated_by = firstName,
                    last_detected_at = NOW()
                WHERE module_id = from_module_id 
                AND parent_id = to_module_id;
            ELSE
                -- Insert new mapping
                INSERT INTO api_wf.module_xref (
                    module_id,
                    parent_id,
                    created_by,
                    created_at,
                    updated_by,
                    updated_at,
                    last_detected_at
                ) VALUES (
                    from_module_id,
                    to_module_id,
                    firstName,
                    NOW(),
                    firstName,
                    NOW(),
                    NOW()
                );
            END IF;
            
            SET dependencies_mapped = dependencies_mapped + 1;
        ELSE
            SET dependencies_skipped = dependencies_skipped + 1;
        END IF;
        
        -- Reset variables for next iteration
        SET from_module_id = NULL;
        SET to_module_id = NULL;
        
        SET dependencies_mapped = dependencies_mapped + 1;
        SET v_idx = v_idx + 1;
    END WHILE;
    
    -- Commit transaction
    COMMIT;
    
    -- Return statistics
    SELECT 
        dependencies_mapped,
        dependencies_skipped,
        'Phase 2: Dependency mapping complete' as message;
        
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_pageStructure` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`wf_admin`@`%` PROCEDURE `sp_pageStructure`(IN requestedPageID INT)
BEGIN
      DECLARE requestedPageName VARCHAR(50);
      DECLARE requestedAppName VARCHAR(50);

      -- Get page metadata
      SELECT pageName, appName
      INTO requestedPageName, requestedAppName
      FROM api_wf.page_registry
      WHERE id = requestedPageID;

      -- Build component list with merged overrides
      WITH component_data AS (
          SELECT
              pc.id AS pageComponent_id,
              pc.pageID,
              pc.comp_name,
              pc.composite_id,
              pc.parent_id,
              pc.posOrder,
              pc.title AS instance_title,
              pc.description AS instance_description,
              ec.name AS composite_name,
              ec.title AS composite_title,
              ec.components AS composite_components,
              -- Parse position into object parts
              SUBSTRING_INDEX(pc.posOrder, ',', 1) AS row_pos,
              SUBSTRING_INDEX(SUBSTRING_INDEX(pc.posOrder, ',', 2), ',', -1) AS col_pos,
              SUBSTRING_INDEX(SUBSTRING_INDEX(pc.posOrder, ',', 3), ',', -1) AS width_pos,
              SUBSTRING_INDEX(pc.posOrder, ',', -1) AS align_pos,
              -- Get page-specific overrides
              epc.props AS override_props,
              epc.triggers AS override_triggers,
              epc.eventSQL AS override_eventSQL
          FROM api_wf.pageComponents pc
          JOIN api_wf.composites ec ON pc.composite_id = ec.id
          LEFT JOIN api_wf.pageConfig epc ON pc.id = epc.pageComponent_id AND pc.pageID = epc.pageID
          WHERE pc.pageID = requestedPageID
            AND pc.active = 1
            AND ec.active = 1
            AND pc.parent_id IS NULL  -- Only root components (no nested hierarchy for now)
      )

      -- Return structured JSON
      SELECT
          requestedPageID AS pageID,
          requestedPageName AS pageName,
          requestedAppName AS appName,
          JSON_OBJECT(
              'components', JSON_ARRAYAGG(
                  JSON_OBJECT(
                      'id', comp_name,
                      'pageComponent_id', pageComponent_id,
                      'composite_id', composite_id,
                      'composite_name', composite_name,
                      'comp_type', composite_name,
                      'title', COALESCE(instance_title, composite_title),
                      'position', JSON_OBJECT(
                          'row', CAST(row_pos AS UNSIGNED),
                          'col', CAST(col_pos AS UNSIGNED),
                          'width', width_pos,
                          'align', align_pos
                      ),
                      'components', CAST(composite_components AS JSON),
                      'props', COALESCE(CAST(override_props AS JSON), JSON_OBJECT()),
                      'triggers', COALESCE(CAST(override_triggers AS JSON), JSON_ARRAY()),
                      'eventSQL', override_eventSQL
                  )
              )
          ) AS pageConfig
      FROM component_data
      ORDER BY row_pos, col_pos;

  END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `acctList`
--

/*!50001 DROP VIEW IF EXISTS `acctList`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `acctList` AS select `a`.`id` AS `acctID`,`a`.`name` AS `acctName`,`a`.`description` AS `acctDesc`,`a`.`street_address` AS `acctAddr`,`a`.`city` AS `acctCity`,`a`.`state_code` AS `acctState`,`a`.`zip_code` AS `acctZipCode`,`a`.`company_code` AS `acctCompCode`,`a`.`default_location` AS `acctDfltLoc`,`a`.`url` AS `acctURL`,`a`.`payment_customer_code` AS `acctPayCustCode`,`a`.`payment_subscription_code` AS `acctSubsptnCode` from `whatsfresh`.`accounts` `a` where (`a`.`active` = 'Y') */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `brndList`
--

/*!50001 DROP VIEW IF EXISTS `brndList`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `brndList` AS select `a`.`id` AS `brndID`,`a`.`name` AS `brndName`,`a`.`comments` AS `brndComments`,`a`.`url` AS `brndURL`,`a`.`account_id` AS `acctID` from `whatsfresh`.`brands` `a` where (`a`.`active` = 1) order by `a`.`account_id`,`a`.`name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `btchMapRcpeList`
--

/*!50001 DROP VIEW IF EXISTS `btchMapRcpeList`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `btchMapRcpeList` AS select `whatsfresh`.`a`.`prd_rcpe_id` AS `rcpeID`,`whatsfresh`.`a`.`ingr_ordr` AS `ingrOrdr`,`whatsfresh`.`a`.`ingr_name` AS `ingrName`,`whatsfresh`.`a`.`ingr_id` AS `ingrID`,`whatsfresh`.`a`.`prd_id` AS `prodID` from `whatsfresh`.`v_prd_rcpe_dtl` `a` where (`whatsfresh`.`a`.`prd_rcpe_actv` = 1) order by `whatsfresh`.`a`.`prd_id`,`whatsfresh`.`a`.`ingr_ordr` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `gridMapped`
--

/*!50001 DROP VIEW IF EXISTS `gridMapped`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `gridMapped` AS select `whatsfresh`.`a`.`prd_btch_ingr_id` AS `mapID`,`whatsfresh`.`a`.`ingr_btch_nbr` AS `ingrBtchNbr`,`whatsfresh`.`a`.`purch_date` AS `purchDate`,`whatsfresh`.`a`.`vndr_name` AS `vndrName`,`whatsfresh`.`a`.`prd_rcpe_id` AS `prodRcpeID`,`whatsfresh`.`a`.`ingr_id` AS `ingrID`,`whatsfresh`.`a`.`prd_btch_id` AS `prodBtchID` from `whatsfresh`.`v_prd_btch_ingr_dtl` `a` order by `whatsfresh`.`a`.`purch_date` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `gridRcpe`
--

/*!50001 DROP VIEW IF EXISTS `gridRcpe`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `gridRcpe` AS select `whatsfresh`.`a`.`prd_rcpe_id` AS `prodRcpeID`,`whatsfresh`.`a`.`ingr_ordr` AS `ingrOrdr`,`whatsfresh`.`a`.`ingr_name` AS `ingrName`,`whatsfresh`.`a`.`ingr_id` AS `ingrID`,`whatsfresh`.`a`.`prd_id` AS `prodID` from `whatsfresh`.`v_prd_rcpe_dtl` `a` where (`whatsfresh`.`a`.`prd_rcpe_actv` = 1) order by `whatsfresh`.`a`.`prd_id`,`whatsfresh`.`a`.`ingr_ordr` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `ingrBtchList`
--

/*!50001 DROP VIEW IF EXISTS `ingrBtchList`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `ingrBtchList` AS select `ib`.`id` AS `ingrBtchID`,`ib`.`batch_number` AS `btchNbr`,`ib`.`vendor_id` AS `vndrID`,`ib`.`brand_id` AS `brndID`,date_format(`ib`.`purchase_date`,'%Y-%m-%d') AS `purchDate`,`ib`.`unit_quantity` AS `unitQty`,`ib`.`unit_price` AS `unitPrice`,`ib`.`purchase_quantity` AS `purchQty`,`ib`.`measure_id` AS `measID`,`ib`.`lot_number` AS `lotNbr`,date_format(`ib`.`best_by_date`,'%Y-%m-%d') AS `bestByDate`,`ib`.`comments` AS `comments`,`ib`.`ingredient_id` AS `ingrID`,(case when (`ib`.`id` is not null) then concat(`ib`.`purchase_quantity`,' @ $',format(coalesce(`ib`.`unit_price`,0),2),' per ',cast(`ib`.`unit_quantity` as decimal(10,2)),' ',coalesce(`m`.`abbrev`,'')) else '' end) AS `purch_dtl`,`i`.`name` AS `ingrName`,`i`.`code` AS `ingrCode`,`it`.`name` AS `ingrType`,`v`.`name` AS `vndrName`,`b`.`name` AS `brndName`,cast((coalesce(`ib`.`unit_price`,0) / nullif(`ib`.`unit_quantity`,0)) as decimal(13,4)) AS `unitRate`,coalesce((`ib`.`purchase_quantity` * `ib`.`unit_price`),0) AS `purchAmt`,coalesce(`pbi`.`productBatchCount`,0) AS `usageCount`,(case when (coalesce(`pbi`.`productBatchCount`,0) > 0) then 'In Use' when (`ib`.`best_by_date` < curdate()) then 'Expired' when (`ib`.`best_by_date` <= (curdate() + interval 30 day)) then 'Expiring Soon' when (`ib`.`purchase_date` >= (curdate() - interval 30 day)) then 'Recently Purchased' else 'Available' end) AS `batchStatus`,(case when (`ib`.`shop_event_id` is not null) then concat('Shop Event #',`ib`.`shop_event_id`) when ((`ib`.`purchase_date` is not null) and (`v`.`name` is not null)) then concat(cast(`ib`.`purchase_date` as date),' : ',`v`.`name`) else NULL end) AS `shopEventRef`,`i`.`account_id` AS `acctID` from ((((((`whatsfresh`.`ingredient_batches` `ib` join `whatsfresh`.`ingredients` `i` on((`ib`.`ingredient_id` = `i`.`id`))) join `whatsfresh`.`ingredient_types` `it` on((`i`.`ingredient_type_id` = `it`.`id`))) left join `whatsfresh`.`vendors` `v` on(((`ib`.`vendor_id` = `v`.`id`) and (`v`.`active` = 'Y')))) left join `whatsfresh`.`brands` `b` on(((`ib`.`brand_id` = `b`.`id`) and (`b`.`active` = 'Y')))) left join `whatsfresh`.`measures` `m` on((`ib`.`measure_id` = `m`.`id`))) left join (select `pbi`.`ingredient_batch_id` AS `ingredient_batch_id`,count(0) AS `productBatchCount` from (`whatsfresh`.`product_batch_ingredients` `pbi` join `whatsfresh`.`product_batches` `pb` on((`pbi`.`product_batch_id` = `pb`.`id`))) where (`pb`.`active` = 'Y') group by `pbi`.`ingredient_batch_id`) `pbi` on((`ib`.`id` = `pbi`.`ingredient_batch_id`))) where ((`ib`.`active` = 1) and (`i`.`active` = 1) and (`it`.`active` = 1) and (`ib`.`purchase_date` >= (now() - interval 7 year))) order by `ib`.`purchase_date` desc,`ib`.`batch_number` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `ingrList`
--

/*!50001 DROP VIEW IF EXISTS `ingrList`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `ingrList` AS select `a`.`id` AS `ingrID`,`a`.`name` AS `ingrName`,`a`.`code` AS `ingrCode`,`a`.`description` AS `ingrDesc`,`a`.`default_measure_unit` AS `measID`,`a`.`default_vendor` AS `vndrID`,`a`.`grams_per_ounce` AS `ingrGrmsPerOz`,`a`.`ingredient_type_id` AS `ingrTypeID`,`a`.`account_id` AS `acctID` from `whatsfresh`.`ingredients` `a` order by `a`.`ingredient_type_id`,`a`.`name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `ingrTypeList`
--

/*!50001 DROP VIEW IF EXISTS `ingrTypeList`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `ingrTypeList` AS select `a`.`id` AS `ingrTypeID`,`a`.`name` AS `ingrTypeName`,`a`.`description` AS `ingrTypeDesc`,`a`.`account_id` AS `acctID` from `whatsfresh`.`ingredient_types` `a` where (`a`.`active` = 1) order by `a`.`account_id`,`a`.`name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `measList`
--

/*!50001 DROP VIEW IF EXISTS `measList`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `measList` AS select `a`.`id` AS `measID`,`a`.`name` AS `name`,`a`.`abbrev` AS `abbrev`,`a`.`account_id` AS `acctID` from `whatsfresh`.`measures` `a` order by `a`.`account_id`,`a`.`name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `prodBtchList`
--

/*!50001 DROP VIEW IF EXISTS `prodBtchList`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `prodBtchList` AS select `pb`.`id` AS `prodBtchID`,`pb`.`batch_number` AS `btchNbr`,date_format(`pb`.`batch_start`,'%Y-%m-%d') AS `btchStart`,`pb`.`location` AS `btchLoc`,`pb`.`batch_quantity` AS `btchQty`,`pb`.`global_measure_unit_id` AS `measID`,date_format(`pb`.`best_by_date`,'%Y-%m-%d') AS `bestByDate`,`pb`.`comments` AS `comments`,`pb`.`product_id` AS `prodID`,`p`.`name` AS `prodName`,`pt`.`name` AS `prodType`,`p`.`account_id` AS `acctID` from ((`whatsfresh`.`product_batches` `pb` join `whatsfresh`.`products` `p` on((`pb`.`product_id` = `p`.`id`))) join `whatsfresh`.`product_types` `pt` on((`p`.`product_type_id` = `pt`.`id`))) where ((`pb`.`active` = 1) and (`p`.`active` = 1) and (`pt`.`active` = 1)) order by `pb`.`batch_start` desc,`pb`.`batch_number` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `prodList`
--

/*!50001 DROP VIEW IF EXISTS `prodList`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `prodList` AS select `a`.`id` AS `prodID`,`a`.`name` AS `prodName`,`a`.`code` AS `prodCode`,`a`.`location` AS `prodDfltLoc`,`a`.`best_by_days` AS `prodDfltBestBy`,`a`.`description` AS `prodDesc`,`a`.`upc_item_reference` AS `prodUpcItemRef`,`a`.`upc_check_digit` AS `prodUpcChkDgt`,`a`.`product_type_id` AS `prodTypeID`,`a`.`account_id` AS `acctID` from `whatsfresh`.`products` `a` where (`a`.`active` = 1) order by `a`.`product_type_id`,`a`.`name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `prodTypeList`
--

/*!50001 DROP VIEW IF EXISTS `prodTypeList`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `prodTypeList` AS select `a`.`id` AS `prodTypeID`,`a`.`name` AS `prodTypeName`,`a`.`account_id` AS `acctID` from `whatsfresh`.`product_types` `a` order by `a`.`account_id`,`a`.`name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `rcpeList`
--

/*!50001 DROP VIEW IF EXISTS `rcpeList`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `rcpeList` AS select `whatsfresh`.`a`.`prd_rcpe_id` AS `rcpeID`,`whatsfresh`.`a`.`ingr_ordr` AS `ingrOrdr`,`whatsfresh`.`a`.`ingr_name` AS `ingrName`,`whatsfresh`.`a`.`ingr_qty_meas` AS `qtyMeas`,`whatsfresh`.`a`.`prd_id` AS `prodID`,`whatsfresh`.`a`.`ingr_type_id` AS `ingrTypeSel`,`whatsfresh`.`a`.`ingr_id` AS `ingrSel`,`whatsfresh`.`a`.`ingr_meas_id` AS `measID`,`whatsfresh`.`a`.`ingr_qty` AS `Qty`,`whatsfresh`.`a`.`prd_ingr_desc` AS `Comments` from `whatsfresh`.`v_prd_rcpe_dtl` `a` order by `whatsfresh`.`a`.`prd_id`,`whatsfresh`.`a`.`ingr_ordr` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `taskList`
--

/*!50001 DROP VIEW IF EXISTS `taskList`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `taskList` AS select `a`.`id` AS `taskID`,`a`.`name` AS `taskName`,`a`.`description` AS `taskDesc`,`a`.`ordr` AS `taskOrder`,`a`.`product_type_id` AS `prodTypeID` from `whatsfresh`.`tasks` `a` where (`a`.`active` = 1) order by `a`.`product_type_id`,`a`.`ordr` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `userAcctList`
--

/*!50001 DROP VIEW IF EXISTS `userAcctList`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `userAcctList` AS select `c`.`id` AS `acctID`,`c`.`name` AS `acctName`,`a`.`id` AS `userID`,`a`.`first_name` AS `firstName` from ((`whatsfresh`.`users` `a` join `whatsfresh`.`accounts_users` `b` on((`a`.`id` = `b`.`user_id`))) join `whatsfresh`.`accounts` `c` on((`b`.`account_id` = `c`.`id`))) where ((`a`.`active` = 1) and (`c`.`active` = 1)) order by `c`.`id`,`c`.`name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `userList`
--

/*!50001 DROP VIEW IF EXISTS `userList`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `userList` AS select `a`.`id` AS `userID`,`a`.`last_name` AS `lastName`,`a`.`first_name` AS `firstName`,`a`.`email` AS `userEmail`,`a`.`password` AS `password`,`a`.`role` AS `roleID`,`a`.`default_account_id` AS `dfltAcctID`,date_format(`a`.`last_login`,'%Y-%m-%d') AS `lastLogin` from `whatsfresh`.`users` `a` where (`a`.`active` = 1) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vndrList`
--

/*!50001 DROP VIEW IF EXISTS `vndrList`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vndrList` AS select `a`.`id` AS `vndrID`,`a`.`name` AS `vndrName`,`a`.`contact_name` AS `vndrContactName`,`a`.`contact_phone` AS `vndrContactPhone`,`a`.`contact_email` AS `vndrContactEmail`,`a`.`comments` AS `vndrComments`,`a`.`account_id` AS `acctID` from `whatsfresh`.`vendors` `a` where (`a`.`active` = 1) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_AISql`
--

/*!50001 DROP VIEW IF EXISTS `vw_AISql`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_AISql` AS select `AISql`.`id` AS `id`,`AISql`.`category` AS `category`,`AISql`.`qryName` AS `qryName`,`AISql`.`qrySQL` AS `qrySQL`,`AISql`.`description` AS `description`,`api_wf`.`f_aiParams`(`AISql`.`id`) AS `params`,`AISql`.`usage_count` AS `usage_count`,`AISql`.`created_at` AS `created_at`,`AISql`.`created_by` AS `created_by`,`AISql`.`updated_at` AS `updated_at`,`AISql`.`updated_by` AS `updated_by`,`AISql`.`deleted_at` AS `deleted_at`,`AISql`.`deleted_by` AS `deleted_by`,`AISql`.`active` AS `active` from `AISql` where (`AISql`.`active` = 1) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_context_store`
--

/*!50001 DROP VIEW IF EXISTS `vw_context_store`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_context_store` AS select `context_store`.`id` AS `id`,`context_store`.`paramName` AS `paramName`,`context_store`.`paramVal` AS `paramVal`,`context_store`.`updates` AS `updates`,`context_store`.`getVals` AS `getVals`,`context_store`.`email` AS `email`,`context_store`.`updated_at` AS `updated_at` from `context_store` order by date_format(`context_store`.`updated_at`,'%Y-%m-%d %H:%i:%s') desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_execEvents`
--

/*!50001 DROP VIEW IF EXISTS `vw_execEvents`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_execEvents` AS select json_unquote(json_extract(`jt`.`value`,'$.qryName')) AS `qryName`,json_unquote(json_extract(`jt`.`value`,'$.qrySQL')) AS `qrySQL`,'composite' AS `source`,`composites`.`id` AS `source_id`,`composites`.`name` AS `component_name` from (`composites` join json_table(`composites`.`eventSQL`, '$.*' columns (`value` json path '$')) `jt`) where ((`composites`.`active` = 1) and (`composites`.`eventSQL` is not null)) union all select json_unquote(json_extract(`jt`.`value`,'$.qryName')) AS `qryName`,json_unquote(json_extract(`jt`.`value`,'$.qrySQL')) AS `qrySQL`,'pageConfig' AS `source`,`pageConfig`.`id` AS `id`,concat('page_',`pageConfig`.`pageID`,'_comp_',`pageConfig`.`pageComponent_id`) AS `concat('page_',  pageID ,'_comp_', pageComponent_id  )` from (`pageConfig` join json_table(`pageConfig`.`eventSQL`, '$.*' columns (`value` json path '$')) `jt`) where ((`pageConfig`.`active` = 1) and (`pageConfig`.`eventSQL` is not null)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_module_audit`
--

/*!50001 DROP VIEW IF EXISTS `vw_module_audit`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_module_audit` AS select `m`.`id` AS `module_id`,`m`.`package` AS `package`,`m`.`fileFolder` AS `fileFolder`,`m`.`fileName` AS `fileName`,`m`.`file_path` AS `file_path`,`m`.`active` AS `is_active`,`m`.`deleted_at` AS `deleted_at`,`m`.`last_detected_at` AS `last_detected_at`,(to_days(now()) - to_days(`m`.`last_detected_at`)) AS `days_since_detected`,`m`.`created_at` AS `module_created`,`m`.`created_by` AS `module_creator`,(select count(0) from `module_xref` where ((`module_xref`.`parent_id` = `m`.`id`) and (`module_xref`.`deleted_at` is null))) AS `depends_on_count`,(select count(0) from `module_xref` where ((`module_xref`.`module_id` = `m`.`id`) and (`module_xref`.`deleted_at` is null))) AS `depended_by_count`,`t`.`id` AS `impact_id`,`t`.`plan_id` AS `plan_id`,`t`.`change_type` AS `change_type`,`t`.`phase` AS `phase`,`t`.`description` AS `impact_description`,`t`.`status` AS `impact_status`,`t`.`created_at` AS `impact_date`,`t`.`created_by` AS `changed_by`,`t`.`affected_apps` AS `affected_apps`,`p`.`name` AS `plan_name`,`p`.`status` AS `plan_status`,`p`.`priority` AS `plan_priority`,(case when ((`m`.`active` = 0) and (`t`.`change_type` = 'DELETE')) then 'Intentionally deleted' when ((`m`.`active` = 0) and (`t`.`change_type` is null)) then 'Missing (no impact logged)' when (`m`.`active` = 0) then 'Deleted (impact logged)' when ((`m`.`active` = 1) and (`t`.`id` is null)) then 'Active (undocumented)' else 'Active (documented)' end) AS `audit_status`,(case when `m`.`package` in (select distinct `modules`.`package` from `modules` where (`modules`.`active` = 1)) then 0 else 1 end) AS `orphan_package` from ((`modules` `m` left join `plan_impacts` `t` on((`m`.`file_path` = `t`.`file_path`))) left join `plans` `p` on((`t`.`plan_id` = `p`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_module_impact_dtl`
--

/*!50001 DROP VIEW IF EXISTS `vw_module_impact_dtl`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_module_impact_dtl` AS select `t`.`plan_id` AS `plan`,`t`.`change_type` AS `change_type`,`m`.`package` AS `package`,`m`.`fileFolder` AS `fileFolder`,`m`.`fileName` AS `fileName`,`m`.`file_path` AS `file_path`,`m`.`active` AS `active`,`m`.`last_detected_at` AS `last_detected_at`,`t`.`description` AS `impact`,`t`.`created_at` AS `impact_date`,`t`.`created_by` AS `impact_by`,`p`.`name` AS `plan_name`,`p`.`status` AS `plan_status`,`t`.`affected_apps` AS `affected_apps`,`t`.`id` AS `impact_id`,(case when (`t`.`id` is null) then 'No impacts logged' else 'Has impacts' end) AS `impact_status` from ((`modules` `m` left join `plan_impacts` `t` on((trim(trailing '/' from `m`.`file_path`) = trim(trailing '/' from `t`.`file_path`)))) left join `plans` `p` on((`t`.`plan_id` = `p`.`id`))) order by `t`.`plan_id` desc,`m`.`package`,`m`.`fileFolder`,`m`.`fileName` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_module_map`
--

/*!50001 DROP VIEW IF EXISTS `vw_module_map`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_module_map` AS select `p`.`package` AS `parent_package`,`c`.`package` AS `child_package`,(case when ((`p`.`active` = 1) and (`c`.`active` = 1)) then 'Valid' else 'Obsolete' end) AS `status`,`p`.`fileName` AS `parent_file`,`c`.`fileName` AS `child_file`,`p`.`file_path` AS `parent_path`,`c`.`file_path` AS `child_path`,(case when (`p`.`package` = `c`.`package`) then 'Internal' else 'External' end) AS `crossed`,`a`.`module_id` AS `child_id`,`a`.`parent_id` AS `parent_id`,`p`.`active` AS `active_parent`,`c`.`active` AS `active_child`,`p`.`last_detected_at` AS `parent_detected_at`,`c`.`last_detected_at` AS `child_detected_at` from ((`module_xref` `a` left join `modules` `p` on((`a`.`parent_id` = `p`.`id`))) left join `modules` `c` on((`a`.`module_id` = `c`.`id`))) order by `p`.`package`,`p`.`file_path`,`c`.`file_path` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_page_analysis`
--

/*!50001 DROP VIEW IF EXISTS `vw_page_analysis`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_page_analysis` AS select `page_registry`.`id` AS `pageID`,`page_registry`.`pageName` AS `pageName`,`page_registry`.`appName` AS `appName`,`page_registry`.`appID` AS `appID`,`page_registry`.`status` AS `status`,json_unquote(json_extract(`page_registry`.`props`,'$.tableName')) AS `tableName`,json_unquote(json_extract(`page_registry`.`props`,'$.template_type')) AS `template_type`,json_extract(`page_registry`.`props`,'$.parentID') AS `parentID`,json_extract(`page_registry`.`props`,'$.tableID') AS `tableID`,json_unquote(json_extract(`page_registry`.`props`,'$.contextKey')) AS `contextKey`,json_unquote(json_extract(`page_registry`.`props`,'$.pageTitle')) AS `pageTitle`,json_unquote(json_extract(`page_registry`.`props`,'$.formHeadCol')) AS `formHeadCol` from `page_registry` where (`page_registry`.`active` = 1) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_plan45`
--

/*!50001 DROP VIEW IF EXISTS `vw_plan45`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_plan45` AS select `plan_communications`.`plan_id` AS `plan_id`,('communication' collate utf8mb4_general_ci) AS `source`,(`plan_communications`.`from_agent` collate utf8mb4_general_ci) AS `agent`,(`plan_communications`.`type` collate utf8mb4_general_ci) AS `change_type`,(`plan_communications`.`subject` collate utf8mb4_general_ci) AS `subject/path`,(`plan_communications`.`message` collate utf8mb4_general_ci) AS `message`,`plan_communications`.`created_at` AS `created_at` from `plan_communications` where (`plan_communications`.`plan_id` = 45) union select `plan_impacts`.`plan_id` AS `plan_id`,('impacts' collate utf8mb4_general_ci) AS `source`,(`plan_impacts`.`created_by` collate utf8mb4_general_ci) AS `agent`,(`plan_impacts`.`change_type` collate utf8mb4_general_ci) AS `change_type COLLATE utf8mb4_general_ci`,(`plan_impacts`.`file_path` collate utf8mb4_general_ci) AS `subject`,(`plan_impacts`.`description` collate utf8mb4_general_ci) AS `message`,`plan_impacts`.`created_at` AS `created_at` from `plan_impacts` where (`plan_impacts`.`plan_id` = 45) order by `created_at` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_plan_composite`
--

/*!50001 DROP VIEW IF EXISTS `vw_plan_composite`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_plan_composite` AS select `plans`.`id` AS `plan_id`,('plan' collate utf8mb4_general_ci) AS `source`,(`plans`.`created_by` collate utf8mb4_general_ci) AS `agent`,('The Plan' collate utf8mb4_general_ci) AS `change_type`,(`plans`.`name` collate utf8mb4_general_ci) AS `subject`,(`plans`.`description` collate utf8mb4_general_ci) AS `message`,`plans`.`created_at` AS `created_at` from `plans` union select `plan_communications`.`plan_id` AS `plan_id`,('communication' collate utf8mb4_general_ci) AS `source`,(`plan_communications`.`from_agent` collate utf8mb4_general_ci) AS `agent`,(`plan_communications`.`type` collate utf8mb4_general_ci) AS `change_type`,(`plan_communications`.`subject` collate utf8mb4_general_ci) AS `subject`,(`plan_communications`.`message` collate utf8mb4_general_ci) AS `message`,`plan_communications`.`created_at` AS `created_at` from `plan_communications` union select `plan_impacts`.`plan_id` AS `plan_id`,('impacts' collate utf8mb4_general_ci) AS `source`,(`plan_impacts`.`created_by` collate utf8mb4_general_ci) AS `agent`,(`plan_impacts`.`change_type` collate utf8mb4_general_ci) AS `change_type COLLATE utf8mb4_general_ci`,(`plan_impacts`.`file_path` collate utf8mb4_general_ci) AS `subject`,(`plan_impacts`.`description` collate utf8mb4_general_ci) AS `message`,`plan_impacts`.`created_at` AS `created_at` from `plan_impacts` order by `plan_id` desc,`created_at` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_routePath`
--

/*!50001 DROP VIEW IF EXISTS `vw_routePath`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_routePath` AS select `b`.`id` AS `pageID`,`b`.`appID` AS `appID`,`a`.`mono_name` AS `appName`,`b`.`pageName` AS `pageName`,`a`.`name` AS `Name`,concat('/',`a`.`mono_name`,'/',`b`.`pageName`) AS `routePath` from (`app` `a` join `page_registry` `b` on((`a`.`id` = `b`.`appID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `wf__products`
--

/*!50001 DROP VIEW IF EXISTS `wf__products`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `wf__products` AS select `b`.`name` AS `prodTypeName`,`a`.`name` AS `prodName`,`a`.`code` AS `prodCode`,ifnull(replace(`a`.`description`,'\n','<br>'),'') AS `description`,`a`.`best_by_days` AS `bestByDays`,ifnull(`a`.`location`,'') AS `location`,`whatsfresh`.`f_measure`(`a`.`measure_id`) AS `prodMeas`,`a`.`account_id` AS `account_id`,`a`.`id` AS `product_id`,`a`.`product_type_id` AS `product_type_id` from ((`whatsfresh`.`products` `a` join `whatsfresh`.`product_types` `b` on((`a`.`product_type_id` = `b`.`id`))) join `whatsfresh`.`accounts` `c` on((`a`.`account_id` = `c`.`id`))) where ((`a`.`active` = 1) and (`c`.`active` = 1)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `wf_btchSumry`
--

/*!50001 DROP VIEW IF EXISTS `wf_btchSumry`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `wf_btchSumry` AS select `a`.`acctName` AS `acctName`,year(`a`.`btchDate`) AS `yr`,sum((case when (`a`.`btchCat` = 'Ingr') then 1 else 0 end)) AS `IngrCount`,sum((case when (`a`.`btchCat` = 'Prod') then 1 else 0 end)) AS `ProdCount` from `wf_btchTrace` `a` group by `a`.`acctName`,year(`a`.`btchDate`) order by year(`a`.`btchDate`) desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `wf_btchTrace`
--

/*!50001 DROP VIEW IF EXISTS `wf_btchTrace`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `wf_btchTrace` AS select `f`.`name` AS `acctName`,`e`.`btchCat` AS `btchCat`,concat(`e`.`btchType`,'.',`e`.`btchName`) AS `btchID`,`e`.`btchNbr` AS `btchNbr`,date_format(`e`.`btchDate`,'%Y-%m-%d') AS `btchDate`,`e`.`account_id` AS `account_id` from ((select 'Ingr' AS `btchCat`,`c`.`account_id` AS `account_id`,`c`.`ingrTypeName` AS `btchType`,`c`.`ingrName` AS `btchName`,`c`.`ingrBtchNbr` AS `btchNbr`,`c`.`purchDate` AS `btchDate` from `wf_ingrBtchDtl` `c` where (year(`c`.`purchDate`) >= 2020) union all select 'Prod' AS `btchCat`,`d`.`account_id` AS `account_id`,`d`.`prodTypeName` AS `btchType`,`d`.`prodName` AS `btchName`,`d`.`prodBtchNbr` AS `btchNbr`,`d`.`prodBtchDate` AS `btchDate` from `wf_prodBtchDtl` `d` where (year(`d`.`prodBtchDate`) >= 2020)) `e` left join `whatsfresh`.`accounts` `f` on((`e`.`account_id` = `f`.`id`))) order by date_format(`e`.`btchDate`,'%Y-%m-%d'),concat(`e`.`btchType`,'.',`e`.`btchName`),`e`.`btchNbr` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `wf_ingrBtchDtl`
--

/*!50001 DROP VIEW IF EXISTS `wf_ingrBtchDtl`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `wf_ingrBtchDtl` AS select `it`.`name` AS `ingrTypeName`,`i`.`name` AS `ingrName`,`i`.`code` AS `ingrCode`,ifnull(`ib`.`batch_number`,'No Batches') AS `ingrBtchNbr`,`i`.`grams_per_ounce` AS `gmsPerOz`,`i`.`description` AS `ingrDesc`,`i`.`default_measure_unit` AS `dfltMeasId`,`i`.`default_vendor` AS `dfltVndrId`,ifnull(`ib`.`lot_number`,'') AS `ingrLotNbr`,(ifnull(date_format(`ib`.`purchase_date`,'%Y-%m-%d'),'') collate utf8mb4_unicode_ci) AS `purchDate`,ifnull(`ib`.`purchase_quantity`,'') AS `purchQty`,`whatsfresh`.`f_measure`(`ib`.`measure_id`) AS `purchMeas`,`ib`.`unit_quantity` AS `unitQty`,`ib`.`unit_price` AS `unitPrice`,cast((ifnull(`ib`.`unit_price`,0) / ifnull(`ib`.`unit_quantity`,1)) as decimal(9,4)) AS `unitRate`,ifnull(concat(`ib`.`purchase_quantity`,' @ ',concat('$',format(ifnull(`ib`.`unit_price`,0),2)),' per ',(trim(round(`ib`.`unit_quantity`,2)) + 0),' ',`whatsfresh`.`f_measure`(`ib`.`measure_id`)),'') AS `purchDtl`,concat('$',format(ifnull((`ib`.`purchase_quantity` * `ib`.`unit_price`),0),2)) AS `purchAmt`,ifnull((`ib`.`purchase_quantity` * `ib`.`unit_price`),0) AS `purchTotalAmt`,`whatsfresh`.`f_vendor`(`ib`.`vendor_id`) AS `vndrName`,`whatsfresh`.`f_brand`(`ib`.`brand_id`) AS `brndName`,ifnull(date_format(`ib`.`best_by_date`,'%Y-%m-%d'),'') AS `bestByDate`,ifnull(`pbi`.`prd_btch_cnt`,0) AS `prdBtchCnt`,`ib`.`comments` AS `comments`,concat(`ib`.`purchase_date`,' : ',`whatsfresh`.`f_vendor`(`ib`.`vendor_id`)) AS `shopEvent`,`i`.`active` AS `ingrActv`,`ib`.`active` AS `ingrBtchActv`,`it`.`active` AS `ingrTypeActv`,`i`.`account_id` AS `account_id`,`ib`.`id` AS `ingredient_batch_id`,`i`.`id` AS `ingredient_id`,`it`.`id` AS `ingredient_type_id`,`ib`.`vendor_id` AS `vendor_id`,`ib`.`brand_id` AS `brand_id`,cast(`ib`.`measure_id` as signed) AS `measure_id`,`ib`.`shop_event_id` AS `shop_event_id` from (((`whatsfresh`.`ingredients` `i` left join (select `a`.`id` AS `id`,`a`.`ingredient_id` AS `ingredient_id`,`a`.`shop_event_id` AS `shop_event_id`,`a`.`vendor_id` AS `vendor_id`,`a`.`brand_id` AS `brand_id`,`a`.`lot_number` AS `lot_number`,`a`.`batch_number` AS `batch_number`,`a`.`purchase_date` AS `purchase_date`,`a`.`purchase_quantity` AS `purchase_quantity`,`a`.`global_measure_unit_id` AS `global_measure_unit_id`,`a`.`measure_id` AS `measure_id`,`a`.`unit_quantity` AS `unit_quantity`,`a`.`unit_price` AS `unit_price`,`a`.`purchase_total_amount` AS `purchase_total_amount`,`a`.`best_by_date` AS `best_by_date`,`a`.`comments` AS `comments`,`a`.`created_at` AS `created_at`,`a`.`created_by` AS `created_by`,`a`.`updated_at` AS `updated_at`,`a`.`updated_by` AS `updated_by`,`a`.`deleted_at` AS `deleted_at`,`a`.`deleted_by` AS `deleted_by`,`a`.`oldUUID` AS `oldUUID`,`a`.`active` AS `active` from `whatsfresh`.`ingredient_batches` `a` where (year(`a`.`purchase_date`) >= year((now() - interval 7 year)))) `ib` on((`i`.`id` = `ib`.`ingredient_id`))) left join `whatsfresh`.`ingredient_types` `it` on((`i`.`ingredient_type_id` = `it`.`id`))) left join (select `whatsfresh`.`product_batch_ingredients`.`ingredient_batch_id` AS `ingredient_batch_id`,count(0) AS `prd_btch_cnt` from `whatsfresh`.`product_batch_ingredients` group by `whatsfresh`.`product_batch_ingredients`.`ingredient_batch_id`) `pbi` on((`ib`.`id` = `pbi`.`ingredient_batch_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `wf_ingrBtchLast`
--

/*!50001 DROP VIEW IF EXISTS `wf_ingrBtchLast`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `wf_ingrBtchLast` AS select `a`.`ingredient_id` AS `ingredient_id`,max(`a`.`purchase_date`) AS `lastPurchDate`,max(`a`.`batch_number`) AS `lastBtchNbr`,count(0) AS `btchCount` from `whatsfresh`.`ingredient_batches` `a` group by `a`.`ingredient_id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `wf_ingrBtchMetrics`
--

/*!50001 DROP VIEW IF EXISTS `wf_ingrBtchMetrics`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `wf_ingrBtchMetrics` AS select `a`.`ingrTypeName` AS `ingrTypeName`,`a`.`ingrName` AS `ingrName`,`a`.`ingrCode` AS `ingrCode`,`a`.`ingrDesc` AS `ingrDesc`,`a`.`gmsPerOz` AS `gmsPerOz`,coalesce(`rcpe`.`rcpeCnt`,0) AS `recipes`,count(`a`.`ingredient_batch_id`) AS `batches`,`a`.`ingredient_type_id` AS `ingredient_type_id`,`a`.`ingredient_id` AS `ingredient_id`,`a`.`account_id` AS `account_id`,`a`.`ingrActv` AS `ingrActv` from (`wf_ingrBtchDtl` `a` left join (select `whatsfresh`.`product_recipes`.`ingredient_id` AS `ingredient_id`,count(0) AS `rcpeCnt` from `whatsfresh`.`product_recipes` where (`whatsfresh`.`product_recipes`.`active` = 'Y') group by `whatsfresh`.`product_recipes`.`ingredient_id`) `rcpe` on((`a`.`ingredient_id` = `rcpe`.`ingredient_id`))) group by `a`.`ingrTypeName`,`a`.`ingrName`,`a`.`ingrCode`,`a`.`ingrDesc`,`a`.`gmsPerOz`,`a`.`ingredient_type_id`,`a`.`ingredient_id`,`a`.`account_id`,`a`.`ingrActv` order by `a`.`account_id`,`a`.`ingrTypeName`,`a`.`ingrName` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `wf_ingrBtchSumry`
--

/*!50001 DROP VIEW IF EXISTS `wf_ingrBtchSumry`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `wf_ingrBtchSumry` AS select `a`.`ingrName` AS `ingrName`,count(`a`.`ingredient_batch_id`) AS `batches`,sum(`a`.`purchQty`) AS `totalQty`,min(`a`.`unitRate`) AS `min_rate`,max(`a`.`unitRate`) AS `max_rate`,cast(avg((ifnull(`a`.`unitPrice`,0) / ifnull(`a`.`unitQty`,1))) as decimal(5,2)) AS `avgRate`,`a`.`purchMeas` AS `units`,cast(sum(`a`.`purchTotalAmt`) as decimal(10,2)) AS `totalCost` from `wf_ingrBtchDtl` `a` where ((`a`.`purchDate` > (now() - interval 365 day)) and (`a`.`purchMeas` <> '-')) group by `a`.`ingrName`,`a`.`purchMeas` order by `a`.`ingrName` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `wf_ingrBtchTrace`
--

/*!50001 DROP VIEW IF EXISTS `wf_ingrBtchTrace`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `wf_ingrBtchTrace` AS select `a`.`ingrTypeName` AS `ingrTypeName`,`a`.`ingrName` AS `ingrName`,`a`.`purchDate` AS `purchDate`,`a`.`vndrName` AS `vndrName`,`a`.`brndName` AS `brndName`,`a`.`ingrBtchNbr` AS `ingrBtchNbr`,ifnull(`b`.`prodBtchNbr`,'') AS `prodBtchNbr`,ifnull(`b`.`prodBtchDate`,'') AS `prodBtchDate`,ifnull(concat(`b`.`prodTypeName`,'-',`b`.`prodName`),'No Product Batches') AS `product`,ifnull(`b`.`location`,'') AS `location`,ifnull(`b`.`qtyMeas`,'') AS `prodQtyMeas`,ifnull(`b`.`btchQty`,0) AS `prodBtchQty`,`a`.`purchAmt` AS `purchAmt`,`a`.`purchDtl` AS `purchDtl`,`a`.`account_id` AS `account_id`,`a`.`ingredient_id` AS `ingredient_id`,`b`.`product_id` AS `product_id`,`a`.`ingredient_batch_id` AS `ingredient_batch_id`,`b`.`product_batch_id` AS `product_batch_id`,`b`.`map_id` AS `map_id` from (`wf_ingrBtchDtl` `a` left join `wf_prodBtchIngrDtl` `b` on((`a`.`ingredient_batch_id` = `b`.`ingredient_batch_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `wf_ingrGrid`
--

/*!50001 DROP VIEW IF EXISTS `wf_ingrGrid`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `wf_ingrGrid` AS select `whatsfresh`.`ingredients`.`id` AS `id`,`whatsfresh`.`ingredients`.`code` AS `code`,`whatsfresh`.`ingredients`.`name` AS `name`,`api_wf`.`f_vendor`(`whatsfresh`.`ingredients`.`default_vendor`) AS `default_vendor`,`api_wf`.`f_measure_unit`(`whatsfresh`.`ingredients`.`default_measure_unit`) AS `default_measure`,`whatsfresh`.`ingredients`.`ingredient_type_id` AS `ingredient_type_id`,`whatsfresh`.`ingredients`.`account_id` AS `account_id` from `whatsfresh`.`ingredients` where (`whatsfresh`.`ingredients`.`active` = 1) order by `whatsfresh`.`ingredients`.`account_id`,`whatsfresh`.`ingredients`.`name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `wf_ingrPricing`
--

/*!50001 DROP VIEW IF EXISTS `wf_ingrPricing`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `wf_ingrPricing` AS select `a`.`ingrTypeName` AS `ingrTypeName`,`a`.`ingrName` AS `ingrName`,`a`.`ingredient_id` AS `ingredient_id`,`a`.`account_id` AS `account_id`,`a`.`unitQty` AS `unitQty`,`a`.`purchMeas` AS `purchMeas`,count(0) AS `purchases`,cast(max(`a`.`unitRate`) as decimal(7,2)) AS `maxPrice`,cast(min(`a`.`unitRate`) as decimal(7,2)) AS `minPrice`,cast(avg(`a`.`unitRate`) as decimal(7,2)) AS `avgPrice` from `wf_ingrBtchDtl` `a` where (`a`.`purchDate` > (cast(now() as date) - interval 30 month)) group by `a`.`ingrTypeName`,`a`.`ingrName`,`a`.`ingredient_id`,`a`.`account_id`,`a`.`unitQty`,`a`.`purchMeas` order by `a`.`account_id`,`a`.`ingrTypeName`,`a`.`ingrName` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `wf_prdBtchIngrMap`
--

/*!50001 DROP VIEW IF EXISTS `wf_prdBtchIngrMap`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `wf_prdBtchIngrMap` AS select `a`.`prodBtchNbr` AS `prodBtchNbr`,`b`.`ingrOrdr` AS `ingrOrdr`,`b`.`ingrName` AS `ingrName`,ifnull(`b`.`ingrQtyMeas`,'') AS `ingrQtyMeas`,`whatsfresh`.`f_json_to_com_delim`(`c`.`ingrMaps`) AS `ingrMaps`,`b`.`prodIngrDesc` AS `prodIngrDesc`,`b`.`ingredient_id` AS `ingredient_id`,`a`.`product_id` AS `product_id`,`a`.`product_type_id` AS `product_type_id`,`b`.`product_recipe_id` AS `product_recipe_id`,`a`.`product_batch_id` AS `product_batch_id`,`a`.`qtyMeas` AS `btchQtyMeas` from ((`wf_prodBtchDtl` `a` join `wf_prodRcpeDtl` `b` on((`a`.`product_id` = `b`.`product_id`))) left join (select `wf_prodBtchIngrDtl`.`product_batch_id` AS `product_batch_id`,`wf_prodBtchIngrDtl`.`product_recipe_id` AS `product_recipe_id`,json_arrayagg(`wf_prodBtchIngrDtl`.`ingrBtchSrce`) AS `ingrMaps` from `wf_prodBtchIngrDtl` group by `wf_prodBtchIngrDtl`.`product_batch_id`,`wf_prodBtchIngrDtl`.`product_recipe_id`) `c` on(((`a`.`product_batch_id` = `c`.`product_batch_id`) and (`b`.`product_recipe_id` = `c`.`product_recipe_id`)))) order by `a`.`prodBtchNbr`,`b`.`ingrOrdr` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `wf_prdBtchIngr_Map`
--

/*!50001 DROP VIEW IF EXISTS `wf_prdBtchIngr_Map`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `wf_prdBtchIngr_Map` AS select `a`.`prodBtchNbr` AS `prodBtchNbr`,`b`.`ingrOrdr` AS `ingrOrdr`,`b`.`ingrName` AS `ingrName`,ifnull(`b`.`ingrQtyMeas`,'') AS `ingrQtyMeas`,`whatsfresh`.`f_json_to_com_delim`(`c`.`ingrMaps`) AS `ingrMaps`,`b`.`prodIngrDesc` AS `prodIngrDesc`,`b`.`ingredient_id` AS `ingredient_id`,`a`.`product_id` AS `product_id`,`a`.`product_type_id` AS `product_type_id`,`b`.`product_recipe_id` AS `product_recipe_id`,`a`.`product_batch_id` AS `product_batch_id`,`a`.`qtyMeas` AS `btchQtyMeas` from ((`wf_prodBtchDtl` `a` join `wf_prodRcpeDtl` `b` on((`a`.`product_id` = `b`.`product_id`))) left join (select `wf_prodBtchIngrDtl`.`product_batch_id` AS `product_batch_id`,`wf_prodBtchIngrDtl`.`product_recipe_id` AS `product_recipe_id`,json_arrayagg(`wf_prodBtchIngrDtl`.`ingrBtchSrce`) AS `ingrMaps` from `wf_prodBtchIngrDtl` group by `wf_prodBtchIngrDtl`.`product_batch_id`,`wf_prodBtchIngrDtl`.`product_recipe_id`) `c` on(((`a`.`product_batch_id` = `c`.`product_batch_id`) and (`b`.`product_recipe_id` = `c`.`product_recipe_id`)))) order by `a`.`prodBtchNbr`,`b`.`ingrOrdr` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `wf_prdBtchIngr_map`
--

/*!50001 DROP VIEW IF EXISTS `wf_prdBtchIngr_map`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `wf_prdBtchIngr_map` AS select `a`.`prodBtchNbr` AS `prodBtchNbr`,`b`.`ingrOrdr` AS `ingrOrdr`,`b`.`ingrName` AS `ingrName`,ifnull(`b`.`ingrQtyMeas`,'') AS `ingrQtyMeas`,`whatsfresh`.`f_json_to_com_delim`(`c`.`ingrMaps`) AS `ingrMaps`,`b`.`prodIngrDesc` AS `prodIngrDesc`,`b`.`ingredient_id` AS `ingredient_id`,`a`.`product_id` AS `product_id`,`a`.`product_type_id` AS `product_type_id`,`b`.`product_recipe_id` AS `product_recipe_id`,`a`.`product_batch_id` AS `product_batch_id`,`a`.`qtyMeas` AS `btchQtyMeas` from ((`wf_prodBtchDtl` `a` join `wf_prodRcpeDtl` `b` on((`a`.`product_id` = `b`.`product_id`))) left join (select `wf_prodBtchIngrDtl`.`product_batch_id` AS `product_batch_id`,`wf_prodBtchIngrDtl`.`product_recipe_id` AS `product_recipe_id`,json_arrayagg(`wf_prodBtchIngrDtl`.`ingrBtchSrce`) AS `ingrMaps` from `wf_prodBtchIngrDtl` group by `wf_prodBtchIngrDtl`.`product_batch_id`,`wf_prodBtchIngrDtl`.`product_recipe_id`) `c` on(((`a`.`product_batch_id` = `c`.`product_batch_id`) and (`b`.`product_recipe_id` = `c`.`product_recipe_id`)))) order by `a`.`prodBtchNbr`,`b`.`ingrOrdr` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `wf_prodBtchDtl`
--

/*!50001 DROP VIEW IF EXISTS `wf_prodBtchDtl`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `wf_prodBtchDtl` AS select `prd`.`name` AS `prodName`,`prd`.`code` AS `prodCode`,`c`.`name` AS `prodTypeName`,`prd`.`recipe_quantity` AS `rcpeQty`,`whatsfresh`.`f_measure`(`prd`.`measure_id`) AS `rcpeMeas`,`pb`.`recipe_multiply_factor` AS `rcpeMultFctr`,ifnull(`d`.`ingr_maps`,0) AS `ingrMaps`,ifnull(`e`.`task_maps`,0) AS `taskMaps`,ifnull((`d`.`ingr_maps` + `e`.`task_maps`),0) AS `totalMaps`,ifnull(`pb`.`location`,'') AS `location`,ifnull(`pb`.`batch_quantity`,0) AS `btchQty`,ifnull(`whatsfresh`.`f_measure`(`pb`.`measure_id`),'') AS `btchMeas`,ifnull(concat(`pb`.`batch_quantity`,' ',`whatsfresh`.`f_measure`(`pb`.`measure_id`),'s'),'') AS `qtyMeas`,ifnull(cast(date_format(`pb`.`batch_start`,'%Y-%m-%d') as date),'') AS `prodBtchDate`,ifnull(`pb`.`comments`,'') AS `comments`,ifnull(`pb`.`batch_number`,'No Batches') AS `prodBtchNbr`,ifnull(date_format(`pb`.`best_by_date`,'%Y-%m-%d'),'') AS `bestByDate`,`prd`.`active` AS `prodActv`,`pb`.`active` AS `prodBtchActv`,`c`.`active` AS `prdTypeActv`,`pb`.`created_at` AS `prodBtchCreatedAt`,`prd`.`product_type_id` AS `product_type_id`,`prd`.`id` AS `product_id`,`pb`.`id` AS `product_batch_id`,`prd`.`account_id` AS `account_id`,`pb`.`measure_id` AS `measure_id` from ((((`whatsfresh`.`products` `prd` left join `whatsfresh`.`product_batches` `pb` on((`prd`.`id` = `pb`.`product_id`))) join `whatsfresh`.`product_types` `c` on((`prd`.`product_type_id` = `c`.`id`))) left join (select `whatsfresh`.`product_batch_ingredients`.`product_batch_id` AS `product_batch_id`,count(0) AS `ingr_maps` from `whatsfresh`.`product_batch_ingredients` group by `whatsfresh`.`product_batch_ingredients`.`product_batch_id`) `d` on((`pb`.`id` = `d`.`product_batch_id`))) left join (select `whatsfresh`.`product_batch_tasks`.`product_batch_id` AS `product_batch_id`,count(0) AS `task_maps` from `whatsfresh`.`product_batch_tasks` group by `whatsfresh`.`product_batch_tasks`.`product_batch_id`) `e` on((`pb`.`id` = `e`.`product_batch_id`))) order by `prd`.`account_id`,`pb`.`batch_start` desc,`pb`.`batch_number` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `wf_prodBtchIngrDtl`
--

/*!50001 DROP VIEW IF EXISTS `wf_prodBtchIngrDtl`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `wf_prodBtchIngrDtl` AS select `r`.`prodTypeName` AS `prodTypeName`,`r`.`prodName` AS `prodName`,`c`.`prodBtchDate` AS `prodBtchDate`,`c`.`btchQty` AS `btchQty`,`c`.`comments` AS `btchComments`,`whatsfresh`.`f_measure`(`c`.`measure_id`) AS `unitMeas`,`c`.`qtyMeas` AS `qtyMeas`,`c`.`prodBtchNbr` AS `prodBtchNbr`,`c`.`location` AS `location`,`a`.`comments` AS `ingrComments`,`r`.`ingrOrdr` AS `ingrOrdr`,`r`.`ingrName` AS `ingrName`,`d`.`ingrBtchNbr` AS `ingrBtchNbr`,concat('<strong>',ifnull(`d`.`ingrBtchNbr`,'no batch'),'</strong>: ',ifnull(`d`.`vndrName`,'no vendor')) AS `ingrBtchSrceHTML`,concat(ifnull(`d`.`ingrBtchNbr`,'no batch'),': ',ifnull(`d`.`vndrName`,'no vendor')) AS `ingrBtchSrce`,`d`.`ingrLotNbr` AS `ingrLotNbr`,`d`.`purchDate` AS `purchDate`,`d`.`purchDtl` AS `purchDtl`,`d`.`purchAmt` AS `purchAmt`,`d`.`vndrName` AS `vndrName`,`d`.`brndName` AS `brndName`,`r`.`prodIngrDesc` AS `prodIngrDesc`,`c`.`prodBtchActv` AS `prodBtchActv`,`r`.`prodActv` AS `prodActv`,`d`.`ingrBtchActv` AS `ingrBtchActv`,`r`.`account_id` AS `account_id`,`r`.`product_id` AS `product_id`,`r`.`product_type_id` AS `product_type_id`,`r`.`ingredient_id` AS `ingredient_id`,`a`.`id` AS `map_id`,`a`.`measure_id` AS `measure_id`,`c`.`product_batch_id` AS `product_batch_id`,`r`.`product_recipe_id` AS `product_recipe_id`,`a`.`ingredient_batch_id` AS `ingredient_batch_id` from (((`wf_prodBtchDtl` `c` left join `wf_prodRcpeDtl` `r` on((`c`.`product_id` = `r`.`product_id`))) left join `whatsfresh`.`product_batch_ingredients` `a` on(((`c`.`product_batch_id` = `a`.`product_batch_id`) and (`r`.`product_recipe_id` = `a`.`product_recipe_id`)))) left join `wf_ingrBtchDtl` `d` on((`a`.`ingredient_batch_id` = `d`.`ingredient_batch_id`))) where (`a`.`created_at` is not null) order by `r`.`account_id`,`c`.`prodBtchDate` desc,`c`.`prodBtchNbr` desc,`r`.`ingrOrdr` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `wf_prodBtchIngrID`
--

/*!50001 DROP VIEW IF EXISTS `wf_prodBtchIngrID`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `wf_prodBtchIngrID` AS select `r`.`prodTypeName` AS `prodTypeName`,`r`.`prodName` AS `prodName`,`c`.`prodBtchDate` AS `prodBtchDate`,`c`.`btchQty` AS `btchQty`,`c`.`comments` AS `btchComments`,`whatsfresh`.`f_measure`(`c`.`measure_id`) AS `unitMeas`,`c`.`qtyMeas` AS `qtyMeas`,`c`.`prodBtchNbr` AS `prodBtchNbr`,`c`.`location` AS `location`,`a`.`comments` AS `ingrComments`,`r`.`ingrOrdr` AS `ingrOrdr`,`r`.`ingrName` AS `ingrName`,`d`.`ingrBtchNbr` AS `ingrBtchNbr`,concat('<strong>',ifnull(`d`.`ingrBtchNbr`,'no batch'),'</strong>: ',ifnull(`d`.`vndrName`,'no vendor')) AS `ingrBtchSrceHTML`,concat(ifnull(`d`.`ingrBtchNbr`,'no batch'),': ',ifnull(`d`.`vndrName`,'no vendor')) AS `ingrBtchSrce`,`d`.`ingrLotNbr` AS `ingrLotNbr`,`d`.`purchDate` AS `purchDate`,`d`.`purchDtl` AS `purchDtl`,`d`.`purchAmt` AS `purchAmt`,`d`.`vndrName` AS `vndrName`,`d`.`brndName` AS `brndName`,`r`.`prodIngrDesc` AS `prodIngrDesc`,`c`.`prodBtchActv` AS `prodBtchActv`,`r`.`prodActv` AS `prodActv`,`d`.`ingrBtchActv` AS `ingrBtchActv`,`r`.`account_id` AS `account_id`,`r`.`product_id` AS `product_id`,`r`.`product_type_id` AS `product_type_id`,`r`.`ingredient_id` AS `ingredient_id`,`a`.`id` AS `product_batch_ingredient_id`,`a`.`measure_id` AS `measure_id`,`c`.`product_batch_id` AS `product_batch_id`,`r`.`product_recipe_id` AS `product_recipe_id`,`a`.`ingredient_batch_id` AS `ingredient_batch_id` from (((`wf_prodBtchDtl` `c` left join `wf_prodRcpeDtl` `r` on((`c`.`product_id` = `r`.`product_id`))) left join `whatsfresh`.`product_batch_ingredients` `a` on(((`c`.`product_batch_id` = `a`.`product_batch_id`) and (`r`.`product_recipe_id` = `a`.`product_recipe_id`)))) left join `wf_ingrBtchDtl` `d` on((`a`.`ingredient_batch_id` = `d`.`ingredient_batch_id`))) where (`a`.`created_at` is not null) order by `r`.`account_id`,`c`.`prodBtchDate` desc,`c`.`prodBtchNbr` desc,`r`.`ingrOrdr` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `wf_prodBtchLast`
--

/*!50001 DROP VIEW IF EXISTS `wf_prodBtchLast`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `wf_prodBtchLast` AS select `a`.`prodTypeName` AS `prodTypeName`,`a`.`prodName` AS `prodName`,`a`.`prodCode` AS `prodCode`,`a`.`prodBtchDate` AS `prodBtchDate`,`a`.`prodBtchNbr` AS `prodBtchNbr`,`a`.`account_id` AS `account_id`,`a`.`product_id` AS `product_id`,`a`.`product_batch_id` AS `product_batch_id` from (`wf_prodBtchDtl` `a` left join `wf_prodBtchDtl` `b` on(((`a`.`product_id` = `b`.`product_id`) and (`a`.`prodBtchDate` < `b`.`prodBtchDate`)))) where ((`b`.`prodBtchDate` is null) and (`a`.`prodBtchDate` is not null)) order by `a`.`account_id`,`a`.`prodTypeName`,`a`.`prodName` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `wf_prodBtchTaskDtl`
--

/*!50001 DROP VIEW IF EXISTS `wf_prodBtchTaskDtl`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `wf_prodBtchTaskDtl` AS select `b`.`ordr` AS `ordr`,`b`.`name` AS `taskName`,ifnull(`pb`.`prodBtchNbr`,'') AS `prodBtchNbr`,ifnull(`a`.`workers`,'') AS `workers`,`whatsfresh`.`f_json_to_com_delim`(`a`.`workers`) AS `taskWrkrs`,ifnull(`a`.`measure_value`,'') AS `measureValue`,ifnull(`a`.`comments`,'') AS `comments`,`b`.`active` AS `taskActv`,ifnull(`a`.`id`,0) AS `product_batch_task_id`,ifnull(`a`.`product_batch_id`,0) AS `product_batch_id`,ifnull(`pb`.`product_id`,0) AS `product_id`,`b`.`id` AS `task_id`,`b`.`account_id` AS `account_id` from ((`whatsfresh`.`tasks` `b` left join `whatsfresh`.`product_batch_tasks` `a` on((`b`.`id` = `a`.`task_id`))) left join `wf_prodBtchDtl` `pb` on((`a`.`product_batch_id` = `pb`.`product_batch_id`))) order by `pb`.`prodBtchNbr`,`b`.`product_type_id`,`b`.`ordr` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `wf_prodRcpeDtl`
--

/*!50001 DROP VIEW IF EXISTS `wf_prodRcpeDtl`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `wf_prodRcpeDtl` AS select `pt`.`name` AS `prodTypeName`,`b`.`name` AS `prodName`,`b`.`recipe_quantity` AS `rcpeQty`,`whatsfresh`.`f_measure`(`b`.`measure_id`) AS `rcpeMeas`,`a`.`ingredient_order` AS `ingrOrdr`,`c`.`code` AS `ingrCode`,`c`.`name` AS `ingrName`,`it`.`name` AS `ingrType`,nullif(concat(`a`.`quantity`,' ',`whatsfresh`.`f_measure`(`a`.`measure_id`)),'0 -') AS `ingrQtyMeas`,`a`.`quantity` AS `ingrQty`,`whatsfresh`.`f_measure`(`a`.`measure_id`) AS `ingrMeas`,`b`.`description` AS `prdDesc`,ifnull(`a`.`comments`,'') AS `prodIngrDesc`,`a`.`active` AS `prodRcpeActv`,`b`.`active` AS `prodActv`,`c`.`active` AS `ingrActv`,`a`.`id` AS `product_recipe_id`,`b`.`account_id` AS `account_id`,`a`.`product_id` AS `product_id`,`pt`.`id` AS `product_type_id`,`a`.`ingredient_id` AS `ingredient_id`,`it`.`id` AS `ingredient_type_id`,`a`.`measure_id` AS `measure_id` from ((((`whatsfresh`.`product_recipes` `a` join `whatsfresh`.`products` `b` on((`a`.`product_id` = `b`.`id`))) join `whatsfresh`.`product_types` `pt` on((`b`.`product_type_id` = `pt`.`id`))) join `whatsfresh`.`ingredients` `c` on((`a`.`ingredient_id` = `c`.`id`))) join `whatsfresh`.`ingredient_types` `it` on((`c`.`ingredient_type_id` = `it`.`id`))) order by `b`.`account_id`,`b`.`product_type_id`,`b`.`name`,`a`.`ingredient_order`,`c`.`name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `wf_prodTypeTasks`
--

/*!50001 DROP VIEW IF EXISTS `wf_prodTypeTasks`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `wf_prodTypeTasks` AS select `a`.`name` AS `prdTypeName`,`c`.`ordr` AS `taskOrdr`,`c`.`name` AS `taskName`,`c`.`description` AS `taskDesc`,`a`.`active` AS `prodTypeActive`,`c`.`active` AS `taskActive`,`a`.`account_id` AS `account_id`,`c`.`id` AS `task_id`,`c`.`product_type_id` AS `prd_type_id` from (`whatsfresh`.`product_types` `a` join `whatsfresh`.`tasks` `c` on((`a`.`id` = `c`.`product_type_id`))) order by `a`.`account_id`,`a`.`name`,`c`.`ordr` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `wf_shopEvent`
--

/*!50001 DROP VIEW IF EXISTS `wf_shopEvent`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `wf_shopEvent` AS select `whatsfresh`.`f_shop_event`(`a`.`id`) AS `shopName`,concat('$',format(ifnull(`b`.`total_amount`,0),2)) AS `totalAmt`,ifnull(`b`.`items`,0) AS `items`,ifnull(`a`.`comments`,'') AS `comments`,`whatsfresh`.`f_vendor`(`a`.`vendor_id`) AS `vndrName`,date_format(`a`.`shop_date`,'%Y-%m-%d') AS `shopDate`,`a`.`account_id` AS `account_id`,`a`.`vendor_id` AS `vendor_id`,`a`.`id` AS `shop_event_id` from (`whatsfresh`.`shop_event` `a` left join (select `whatsfresh`.`ingredient_batches`.`shop_event_id` AS `shop_event_id`,count(`whatsfresh`.`ingredient_batches`.`id`) AS `items`,ifnull(sum((`whatsfresh`.`ingredient_batches`.`purchase_quantity` * `whatsfresh`.`ingredient_batches`.`unit_price`)),0) AS `total_amount` from `whatsfresh`.`ingredient_batches` group by `whatsfresh`.`ingredient_batches`.`shop_event_id`) `b` on((`a`.`id` = `b`.`shop_event_id`))) order by `a`.`shop_date` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `wrkrList`
--

/*!50001 DROP VIEW IF EXISTS `wrkrList`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`wf_admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `wrkrList` AS select `a`.`id` AS `wrkrID`,`a`.`name` AS `wrkrName`,`a`.`account_id` AS `acctID` from `whatsfresh`.`workers` `a` where (`a`.`active` = 1) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-18 10:53:48

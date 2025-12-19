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
      END

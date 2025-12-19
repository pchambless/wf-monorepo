CREATE OR REPLACE VIEW api_wf.vw_userAppList AS
SELECT
    u.email,
    u.ROLE,
    u.first_name ,
    u.last_name,
    u.last_login,
    mono_name AS app_name,
    name AS display_name,
    base_url AS routePath
  FROM api_wf.app
  CROSS JOIN whatsfresh.users u
  WHERE u.active = 1
    AND app.base_url IS NOT NULL
    AND JSON_CONTAINS(CAST(app.roles AS JSON), CAST(u.role AS JSON))
  ORDER BY u.email, app.name;
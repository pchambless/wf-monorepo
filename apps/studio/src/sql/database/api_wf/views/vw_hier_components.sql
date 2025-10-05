-- api_wf.vw_hier_components source

CREATE OR REPLACE
ALGORITHM = UNDEFINED VIEW api_wf.vw_hier_components AS
SELECT
      x.id AS id,
      x.name AS comp_name,
      c.name AS template,
      x.posOrder AS posOrder,
      c.style AS base_styles,
      x.style AS override_styles,
      c.config AS tmplt_def,
      x.parent_id AS parent_id,
      x.eventType_id AS eventType_id
from
    ((api_wf.eventType_xref x
join api_wf.eventType_xref p on
    ((x.parent_id = p.id)))
join api_wf.eventType c on
    ((x.eventType_id = c.id)))
where
    ((x.active = 1)
        and (p.active = 1)
            and (c.active = 1));
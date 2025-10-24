-- Create eventSQL entry for cloning component trees
INSERT INTO api_wf.eventSQL (qryName, qrySQL, description, created_at, created_by)
VALUES (
    'cloneComponent',
    'CALL api_wf.sp_clone_component_tree(:template_xref_id, :new_parent_id, :new_comp_name, :firstName)',
    'Clone a component and its entire child tree to a new parent',
    NOW(),
    'Claude'
);

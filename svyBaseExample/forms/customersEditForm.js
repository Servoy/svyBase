
/**
 * @override 
 * @protected 
 * @properties={typeid:24,uuid:"1B05E893-BC38-4C56-9D5A-9DED58D5A279"}
 */
function setFormPolicies(){
    var poli = getCrudPolicies();
    poli.setBatchScopePolicy(scopes.svyCRUDManager.BATCH_SCOPE_POLICY.CURRENT_RECORD);
    poli.setRecordLockingPolicy(scopes.svyCRUDManager.RECORD_LOCKING_POLICY.AUTO);
    poli.setRecordSelectionPolicy(scopes.svyCRUDManager.RECORD_SELECTION_POLICY.PREVENT_WHEN_EDITING);
    poli.setValidationPolicy(scopes.svyCRUDManager.VALIDATION_POLICY.DEFERRED);
    poli.setFormHidePolicy(scopes.svyCRUDManager.FORM_HIDE_POLICY.ALLOW_WHEN_EDITING);    
}


/**
 * @override 
 * @protected 
 * @return {String} the name of the label element which is used as a "placeholder" where the toolbar should be created
 * @properties={typeid:24,uuid:"33F27906-84AE-4509-AE90-FDE75F3A97B0"}
 */
function getToolbarPlaceholderLabelName(){
    return elements.lblToolbarPlaceholder.getName();
}
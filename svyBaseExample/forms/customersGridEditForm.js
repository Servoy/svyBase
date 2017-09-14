/**
 * @override 
 * @protected 
 * @properties={typeid:24,uuid:"DC9BC398-37B4-4555-9E56-64E939CAE153"}
 */
function setFormPolicies(){
    var poli = getCrudPolicies();
    poli.setBatchScopePolicy(scopes.svyCRUDManager.BATCH_SCOPE_POLICY.FOUNDSET);
    poli.setRecordLockingPolicy(scopes.svyCRUDManager.RECORD_LOCKING_POLICY.AUTO);
    poli.setRecordSelectionPolicy(scopes.svyCRUDManager.RECORD_SELECTION_POLICY.ALLOW_WHEN_EDITING);
    poli.setValidationPolicy(scopes.svyCRUDManager.VALIDATION_POLICY.CONTINUOUS);
    poli.setFormHidePolicy(scopes.svyCRUDManager.FORM_HIDE_POLICY.ALLOW_WHEN_EDITING);    
}

/**
 * @override 
 * @protected 
 * @return {String} the name of the label element which is used as a "placeholder" where the toolbar should be created
 * @properties={typeid:24,uuid:"97F46C46-1700-4806-B334-28725E392607"}
 */
function getToolbarPlaceholderLabelName(){
    return elements.lblToolbarPlaceholder.getName();
}

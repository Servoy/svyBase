/**
 * @override 
 * @protected 
 * @properties={typeid:24,uuid:"716F884C-3F7E-45FD-8411-AB3B55548480"}
 */
function setFormPolicies(){
    var poli = getCrudPolicies();
    poli.setBatchScopePolicy(scopes.svyCRUDManager.BATCH_SCOPE_POLICY.AUTO);
    poli.setRecordLockingPolicy(scopes.svyCRUDManager.RECORD_LOCKING_POLICY.AUTO);
    poli.setRecordSelectionPolicy(scopes.svyCRUDManager.RECORD_SELECTION_POLICY.PREVENT_WHEN_EDITING);
    poli.setValidationPolicy(scopes.svyCRUDManager.VALIDATION_POLICY.DEFERRED);
    poli.setFormHidePolicy(scopes.svyCRUDManager.FORM_HIDE_POLICY.PREVENT_WHEN_EDITING);  
}

/**
 * @override 
 * @protected 
 * @return {String} the name of the label element which is used as a "placeholder" where the toolbar should be created
 * @properties={typeid:24,uuid:"442BAEE1-F756-4075-88AA-F561A481A6D7"}
 */
function getToolbarPlaceholderLabelName(){
    return elements.lblToolbarPlaceholder.getName();
}
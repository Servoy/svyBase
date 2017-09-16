/**
 * @override 
 * @protected 
 * @properties={typeid:24,uuid:"282F180B-1145-4A5E-9D4E-E06ECBA3047F"}
 */
function setFormPolicies(){
    var poli = getCrudPolicies();
    poli.setBatchScopePolicy(scopes.svyCRUDManager.BATCH_SCOPE_POLICY.FOUNDSET);
    poli.setRecordLockingPolicy(scopes.svyCRUDManager.RECORD_LOCKING_POLICY.AUTO);
    poli.setRecordSelectionPolicy(scopes.svyCRUDManager.RECORD_SELECTION_POLICY.ALLOW_WHEN_EDITING);
    poli.setValidationPolicy(scopes.svyCRUDManager.VALIDATION_POLICY.CONTINUOUS);
    poli.setFormHidePolicy(scopes.svyCRUDManager.FORM_HIDE_POLICY.PREVENT_WHEN_EDITING);  
}

/**
 * @override 
 * @protected 
 * @return {String} the name of the label element which is used as a "placeholder" where the toolbar should be created
 * @properties={typeid:24,uuid:"70EB4B65-EB2E-4B2D-861A-57FC5C94F53E"}
 */
function getToolbarPlaceholderLabelName(){
    return null;
}
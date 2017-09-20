/**
 * @properties={typeid:24,uuid:"F588A245-7B25-4F22-B278-C38F9BDF7A51"}
 */
function testPolicyConstructor(){
    var poli = scopes.svyCRUDManager.createCRUDPolicies();
    jsunit.assertNotNull(poli);
    jsunit.assertEquals(scopes.svyCRUDManager.BATCH_SCOPE_POLICY.FOUNDSET,poli.getBatchScopePolicy());
    jsunit.assertEquals(scopes.svyCRUDManager.FORM_HIDE_POLICY.ALLOW_WHEN_EDITING,poli.getFormHidePolicy());
    jsunit.assertEquals(scopes.svyCRUDManager.RECORD_LOCKING_POLICY.NONE,poli.getRecordLockingPolicy());
    jsunit.assertEquals(scopes.svyCRUDManager.RECORD_SELECTION_POLICY.ALLOW_WHEN_EDITING,poli.getRecordSelectionPolicy());
    jsunit.assertEquals(scopes.svyCRUDManager.VALIDATION_POLICY.DEFERRED,poli.getValidationPolicy());
}

/**
 * @properties={typeid:24,uuid:"2F7CD16C-DDA7-46D0-ACCE-B4E6AE79FE84"}
 */
function testPolicySetters(){
    var poli = scopes.svyCRUDManager.createCRUDPolicies();
    
    jsunit.assertEquals(scopes.svyCRUDManager.BATCH_SCOPE_POLICY.FOUNDSET,poli.getBatchScopePolicy());
    jsunit.assertEquals(scopes.svyCRUDManager.FORM_HIDE_POLICY.ALLOW_WHEN_EDITING,poli.getFormHidePolicy());
    jsunit.assertEquals(scopes.svyCRUDManager.RECORD_LOCKING_POLICY.NONE,poli.getRecordLockingPolicy());
    jsunit.assertEquals(scopes.svyCRUDManager.RECORD_SELECTION_POLICY.ALLOW_WHEN_EDITING,poli.getRecordSelectionPolicy());
    jsunit.assertEquals(scopes.svyCRUDManager.VALIDATION_POLICY.DEFERRED,poli.getValidationPolicy());
    
    poli.setBatchScopePolicy(scopes.svyCRUDManager.BATCH_SCOPE_POLICY.ALL);
    poli.setFormHidePolicy(scopes.svyCRUDManager.FORM_HIDE_POLICY.PREVENT_WHEN_EDITING);
    poli.setRecordLockingPolicy(scopes.svyCRUDManager.RECORD_LOCKING_POLICY.AUTO);
    poli.setRecordSelectionPolicy(scopes.svyCRUDManager.RECORD_SELECTION_POLICY.PREVENT_WHEN_EDITING);
    poli.setValidationPolicy(scopes.svyCRUDManager.VALIDATION_POLICY.CONTINUOUS);
    
    jsunit.assertEquals(scopes.svyCRUDManager.BATCH_SCOPE_POLICY.ALL,poli.getBatchScopePolicy());
    jsunit.assertEquals(scopes.svyCRUDManager.FORM_HIDE_POLICY.PREVENT_WHEN_EDITING,poli.getFormHidePolicy());
    jsunit.assertEquals(scopes.svyCRUDManager.RECORD_LOCKING_POLICY.AUTO,poli.getRecordLockingPolicy());
    jsunit.assertEquals(scopes.svyCRUDManager.RECORD_SELECTION_POLICY.PREVENT_WHEN_EDITING,poli.getRecordSelectionPolicy());
    jsunit.assertEquals(scopes.svyCRUDManager.VALIDATION_POLICY.CONTINUOUS,poli.getValidationPolicy());
}
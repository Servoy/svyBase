/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"85D3AD90-C790-4CF5-A968-F0E28C52CEAB"}
 */
var m_BatchScopePolicy = '';
/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"6259D60A-DF26-49FB-84BE-8B05B8621F66"}
 */
var m_RecordSelectionPolicy = '';
/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"FBF850F1-C258-48E2-879D-5CB9FA3BB41C"}
 */
var m_ValidationPolicy = '';
/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"9D542C8E-0C67-42DF-8DF8-8206E7A4EA9A"}
 */
var m_FormHidePolicy = '';

/**
 * Callback method when form is (re)loaded.
 * @override 
 * @protected
 *
 * @properties={typeid:24,uuid:"3A603570-3643-435E-B3F2-2FAE38F6BA7D"}
 */
function initializingForm() {
    var poli = getCrudPolicies();
    m_FormHidePolicy = poli.getFormHidePolicy();
    m_BatchScopePolicy = poli.getBatchScopePolicy();
    m_RecordSelectionPolicy = poli.getRecordSelectionPolicy();
    m_ValidationPolicy = poli.getValidationPolicy();
    
    //hook the inner forms to the same foundset as the "controller" form
    forms.categoriesList.setFoundSet(foundset);
    forms.categoryRecordView.setFoundSet(foundset);
    
    elements.splitPanel.dividerLocation = 0.2;
    elements.splitPanel.setLeftForm(forms.categoriesList);
    elements.splitPanel.setRightForm(forms.categoryRecordView);
}
/**
 * Handle changed data, return false if the value should not be accepted. In NGClient you can return also a (i18n) string, instead of false, which will be shown as a tooltip.
 *
 * @param {String} oldValue old value
 * @param {String} newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean}
 *
 * @private
 *
 * @properties={typeid:24,uuid:"7DF88FEE-3DE0-442C-A093-42512332C364"}
 */
function onDataChangePolicy(oldValue, newValue, event) {
    var poli = getCrudPolicies();
    setPolicies(poli);
    
    //propagate the policy change to the contained forms
    /** @type {RuntimeForm<categoriesBase>} */
    var lFrm = elements.splitPanel.getLeftForm();
    /** @type {RuntimeForm<categoriesBase>} */
    var rFrm = elements.splitPanel.getLeftForm();
    setPolicies(lFrm.getCrudPolicies());
    setPolicies(rFrm.getCrudPolicies());
    return true;
}

/**
 * @private 
 * @param {scopes.svyCRUDManager.CRUDPolicies} policies
 *
 * @properties={typeid:24,uuid:"09EC67E4-50C0-4F1B-84AF-625F5D1E55BF"}
 */
function setPolicies(policies) {
    policies.setFormHidePolicy(m_FormHidePolicy);
    policies.setRecordSelectionPolicy(m_RecordSelectionPolicy);
    policies.setBatchScopePolicy(m_BatchScopePolicy);
    policies.setValidationPolicy(m_ValidationPolicy);
}

/**
 * @protected 
 * @properties={typeid:24,uuid:"A082A2C4-8307-4E3C-8278-C08229B23CBD"}
 */
function updateUI(){
    var markers = getValidationMarkers();
    for(var i in markers){
        switch (markers[i].getLevel()) {
            case scopes.svyValidationManager.VALIDATION_LEVEL.INFO: {
                plugins.webnotificationsToastr.info(markers[i].getMessage(), 'Validation Information');                
                break;
            }
            case scopes.svyValidationManager.VALIDATION_LEVEL.WARN: {
                plugins.webnotificationsToastr.warning(markers[i].getMessage(), 'Validation Warning');                
                break;
            }        
            default: {
                plugins.webnotificationsToastr.error(markers[i].getMessage(), 'Validation Error');                
                break;
            }
        } 
    }    
}
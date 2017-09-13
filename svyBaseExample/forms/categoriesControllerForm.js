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
 * @properties={typeid:35,uuid:"23AF5A45-B689-4132-A443-476161CA2EDF"}
 */
var m_RecordLockingPolicy = '';
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
 * @type {String}
 *
 * @properties={typeid:35,uuid:"52C4034E-8F4F-44AF-8EEC-592AFE98BB62"}
 */
var DESIGNTIME_PROP_ACTION_NAME = 'action-name';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"AA7DFD5B-D369-41C1-B79C-EB57B982BF8F"}
 */
var ACTION_LOAD_DATA = 'load-data';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"AFF375C4-8498-44F3-A77F-A9F00457C489"}
 */
var ACTION_SHOW_OPTIONS = 'show-options';

/**
 * @properties={typeid:35,uuid:"1434E37C-1D75-4BF1-BDC0-AFE9D0ADDB65",variableType:-4}
 */
var m_ButtonActionMap = { };

/**
 * Callback method when form is (re)loaded.
 * @override
 * @protected
 *
 * @properties={typeid:24,uuid:"3A603570-3643-435E-B3F2-2FAE38F6BA7D"}
 */
function initializingForm() {
    addCustomActions();

    buildToolbar();

    var poli = getCrudPolicies();
    m_FormHidePolicy = poli.getFormHidePolicy();
    m_BatchScopePolicy = poli.getBatchScopePolicy();
    m_RecordSelectionPolicy = poli.getRecordSelectionPolicy();
    m_RecordLockingPolicy = poli.getRecordLockingPolicy();
    m_ValidationPolicy = poli.getValidationPolicy();

    //hook the inner forms to the same foundset as the "controller" form
    forms.categoriesList.setFoundSet(foundset);
    forms.categoryRecordView.setFoundSet(foundset);

    elements.splitPanel.dividerLocation = 0.2;
    elements.splitPanel.setLeftForm(forms.categoriesList);
    elements.splitPanel.setRightForm(forms.categoryRecordView);
}

/**
 * @private
 * @properties={typeid:24,uuid:"0C862D37-2AE3-4EA7-BFE5-21CFD92DFDD7"}
 */
function addCustomActions() {
    var action = addAction(ACTION_LOAD_DATA, loadData);
    action.setText('Load');
    action.setTooltipText('Load all available records');
    action.setVisible(true);
    action.setEnabled(true);
    
    action = addAction(ACTION_SHOW_OPTIONS, showOptionsPopup);
    action.setText('Options');
    action.setTooltipText('Show options popup menu');
    action.setVisible(true);
    action.setEnabled(true);
}

/**
 * @private
 * @properties={typeid:24,uuid:"27BDBC4A-BB84-4BCE-8C07-92A91B3A1D53"}
 */
function buildToolbar() {
    //build a "toolbar"
    var actionNames = getActionNames();
    var jsFrm = solutionModel.getForm(controller.getName());
    var btnWidth = 85;
    var btnActionMthd = jsFrm.getMethod('onActionToolbarButton');
    var toolbarPlaceholder = jsFrm.getLabel('lblToolbarPlaceholder');
    var yPos = toolbarPlaceholder.y;
    var xPos = toolbarPlaceholder.x;
    for (var i = 0; i < actionNames.length; i++) {
        var actionName = actionNames[i];
        var action = getAction(actionName);
        var btn = jsFrm.newButton(action.getText(), xPos, yPos, btnWidth, 30, btnActionMthd);
        btn.name = 'toolbarBtn' + (i + 1);
        btn.toolTipText = action.getTooltipText();
        btn.putDesignTimeProperty(DESIGNTIME_PROP_ACTION_NAME, actionName);
        btn.styleClass = 'toolbar-btn';
        xPos += btnWidth;
        if (i < actionNames.length - 1) {
            xPos += 5;
        }
        m_ButtonActionMap[actionName] = btn.name;
    }
    if (jsFrm.width < xPos) {
        jsFrm.width = xPos + 2;
    }
    controller.recreateUI();
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
    var rFrm = elements.splitPanel.getRightForm();
    setPolicies(lFrm.getCrudPolicies());
    setPolicies(rFrm.getCrudPolicies());
    updateUI();
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
    policies.setRecordLockingPolicy(m_RecordLockingPolicy);
    policies.setBatchScopePolicy(m_BatchScopePolicy);
    policies.setValidationPolicy(m_ValidationPolicy);
}

/**
 * @override
 * @protected
 * @properties={typeid:24,uuid:"A082A2C4-8307-4E3C-8278-C08229B23CBD"}
 */
function updatingUI() {
    var markers = getValidationMarkers();
    for (var i in markers) {
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

    //update the state of custom actions
    var action = getAction(ACTION_LOAD_DATA);
    action.setEnabled(!hasEdits());
    action = getAction(ACTION_SHOW_OPTIONS);
    action.setEnabled(true);

    //sync buttons and actions state
    var actionNames = getActionNames();
    for (var n in actionNames) {
        var actionName = actionNames[n];
        action = getAction(actionName);
        /** @type {RuntimeButton} */
        var btn = elements[m_ButtonActionMap[actionName]];
        btn.enabled = action.isEnabled();
        btn.visible = action.isVisible();
    }
}
/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"FF88AA02-A953-483F-95B3-C62FC9782753"}
 */
function onActionToolbarButton(event) {
    /** @type {RuntimeButton} */
    var btn = event.getSource();
    var actionName = btn.getDesignTimeProperty(DESIGNTIME_PROP_ACTION_NAME);
    var action = getAction(actionName);
    action.invoke(event);
}

/**
 * @protected
 * @properties={typeid:24,uuid:"3138BADC-5837-464F-9289-9D853DB45D78"}
 */
function loadData() {
    foundset.loadAllRecords();
}

/**
 * 
 * @param {scopes.svyActionManager.ActionEvent} event
 *
 * @properties={typeid:24,uuid:"91AF009F-395A-44F2-8EC7-38B0569A3235"}
 */
function showOptionsPopup(event) {
    var popup = plugins.window.createPopupMenu();
    popup.addMenuItem('Option 1');
    popup.addMenuItem('Option 2');
    popup.addMenuItem('Option 3');
    popup.addSeparator();
    popup.addMenuItem('Option 4');
    popup.addMenuItem('Option 5');
    
    //extract the "wrapped" JSEvent to show the popup at the appropriate source UI component which visualizes the action
    popup.show(event.getSourceEvent().getSource());
}
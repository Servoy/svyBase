/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"48F66F7F-61A9-4E8C-A97A-0462B7BDC0DC"}
 */
var DESIGNTIME_PROP_ACTION_NAME = 'action-name';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"6A386A38-41C4-4F26-BF31-F6E34FB765C2"}
 */
var ACTION_LOAD_DATA = 'load-data';

/**
 * @properties={typeid:35,uuid:"2F32C22C-9D79-4E58-9963-4F6A09408A8F",variableType:-4}
 */
var m_ButtonActionMap = { };

/**
 * Used for handling the action event of all action toolbar buttons.
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"A9AF7751-AA82-460C-9A3F-25D62C9CB3FF"}
 */
function onActionToolbarButton(event) {
    /** @type {RuntimeButton} */
    var btn = event.getSource();
    //this relies on a design-time property to link the button with the form action
    var actionName = btn.getDesignTimeProperty(DESIGNTIME_PROP_ACTION_NAME);
    var action = getAction(actionName);
    action.invoke(event);
}

/**
 * Custom form action to load all available records
 * @protected
 * @properties={typeid:24,uuid:"18589D43-E5A1-4CE9-9F7C-903D80773832"}
 */
function loadData() {
    foundset.loadAllRecords();
}

/**
 * Adds the custom form action
 * @protected
 * @properties={typeid:24,uuid:"E969AC89-2B84-4F4D-AA6E-743757653F4A"}
 */
function addCustomActions() {
    var action = addAction(ACTION_LOAD_DATA, loadData);
    action.setText('Load');
    action.setTooltipText('Load all available records');
    action.setVisible(true);
    action.setEnabled(true);
}

/**
 * @protected 
 * @properties={typeid:24,uuid:"0E6BA8D1-2242-4696-94CC-59FF0A24DBB2"}
 */
function setFormPolicies(){
    throw new Error('Abstract method setFormPolicies is not overridden in form ' + controller.getName());
}

/**
 * @protected 
 * @return {String} the name of the label element which is used as a "placeholder" where the toolbar should be created
 * @properties={typeid:24,uuid:"4A092249-076D-4C6D-B25E-8E214258FCC8"}
 */
function getToolbarPlaceholderLabelName(){
    throw new Error('Abstract method getToolbarPlaceholderLabelName is not overridden in form ' + controller.getName());
}

/**
 * @private
 * @properties={typeid:24,uuid:"60A76C0E-9AE8-4390-9727-D2051865CEB9"}
 */
function buildToolbar() {
    //build a "toolbar"
    var actionNames = getActionNames();
    var jsFrm = solutionModel.getForm(controller.getName());
    var btnWidth = 85;
    var btnActionMthd = jsFrm.getMethod('onActionToolbarButton');
    var toolbarPlaceholder = jsFrm.getLabel(getToolbarPlaceholderLabelName());
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
 * @protected
 * @properties={typeid:24,uuid:"636E913E-6944-4988-A438-C3BB8FF5EFA1"}
 */
function updateToolbarState(){
    //sync buttons and actions state
    var actionNames = getActionNames();
    for (var n in actionNames) {
        var actionName = actionNames[n];
        var action = getAction(actionName);
        /** @type {RuntimeButton} */
        var btn = elements[m_ButtonActionMap[actionName]];
        btn.enabled = action.isEnabled();
        btn.visible = action.isVisible();
    }
}

/**
 * Callback method when form is (re)loaded.
 * @override
 * @protected
 *
 * @properties={typeid:24,uuid:"B2D40390-2ED4-4544-8061-6B2F5AA1E707"}
 */
function initializingForm() {
    setFormPolicies();
    addCustomActions();
    buildToolbar();
}

/**
 * @override
 * @protected
 * @properties={typeid:24,uuid:"32A775D6-BD16-4A98-9E79-DBDA6FAA665C"}
 */
function updatingUI() {
    var markers = getValidationMarkers();
    for (var i in markers) {
        switch (markers[i].getLevel()) {
            case scopes.svyValidationManager.VALIDATION_LEVEL.ERROR: {
                plugins.webnotificationsToastr.error(markers[i].getMessage(), 'Validation Error');
                break;
            }
            case scopes.svyValidationManager.VALIDATION_LEVEL.WARN: {
                plugins.webnotificationsToastr.warning(markers[i].getMessage(), 'Validation Warning');
                break;
            }
            default: {
                plugins.webnotificationsToastr.info(markers[i].getMessage(), 'Validation Information');
                break;
            }
        }
    }   
    clearValidationMarkers();

    //update the state of custom actions
    var action = getAction(ACTION_LOAD_DATA);
    action.setEnabled(!hasEdits());
    
    //update the state of the toolbar buttons
    updateToolbarState();
}

/**
 * @override 
 * @protected
 * @param {scopes.svyDataUtils.SaveDataFailedException} error
 * @properties={typeid:24,uuid:"10202653-4F60-406C-ADB2-EE9DDBBAE82F"}
 */
function onSaveError(error) { 
    plugins.webnotificationsToastr.error(error.message, 'Save Error');
}
/**
 * We use this when building dynamic toolbars to link a button element to a form action
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"48F66F7F-61A9-4E8C-A97A-0462B7BDC0DC"}
 */
var DESIGNTIME_PROP_ACTION_NAME = 'action-name';

/**
 * Action name for a custom form action
 * @protected 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"6A386A38-41C4-4F26-BF31-F6E34FB765C2"}
 */
var ACTION_LOAD_DATA = 'load-data';

/**
 * This will store a "map" linking buttons and actions
 * @private 
 * @properties={typeid:35,uuid:"2F32C22C-9D79-4E58-9963-4F6A09408A8F",variableType:-4}
 */
var m_ButtonActionMap = { };

/**
 * This form variable can be used to display on the example forms information about the policy configuration
 * @protected 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"E6F7093B-FD89-4B40-802D-08DEE767A88A"}
 */
var m_PolicyInfo = 'not available';

/**
 * Adds the custom form action
 * @protected
 * @properties={typeid:24,uuid:"E969AC89-2B84-4F4D-AA6E-743757653F4A"}
 */
function addCustomActions() {
    //This is an example of how a custom action can be added
    //see also updateCustomActionsState
//    var action = addAction(ACTION_LOAD_DATA, loadData);
//    action.setText('Load');
//    action.setTooltipText('Load all available records');
//    action.setVisible(true);
//    action.setEnabled(true);
}

/**
 * @protected 
 * @properties={typeid:24,uuid:"8E9C37AC-3118-4C39-A064-6B08F531F0A6"}
 */
function updateCustomActionsState(){
    //Example of updating the enabled/visible state of the custom actions
    //see also addCustomActions
//    var action = getAction(ACTION_LOAD_DATA);
//    action.setEnabled(!hasEdits());
}

/**
 * Extending forms must override this method to set the CRUD policies for the form
 * @protected 
 * @properties={typeid:24,uuid:"0E6BA8D1-2242-4696-94CC-59FF0A24DBB2"}
 */
function setFormPolicies(){
    throw new Error('Abstract method setFormPolicies is not overridden in form ' + controller.getName());
}

/**
 * Extending forms must override this method to provide the name of the label which indicates where the toolbar should be placed
 * @protected 
 * @return {String} the name of the label element which is used as a "placeholder" where the toolbar should be created
 * @properties={typeid:24,uuid:"4A092249-076D-4C6D-B25E-8E214258FCC8"}
 */
function getToolbarPlaceholderLabelName(){
    throw new Error('Abstract method getToolbarPlaceholderLabelName is not overridden in form ' + controller.getName());
}

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
 * Builds a dynamic buttons toolbar on the form
 * Note: this method calls controller.recreateUI()
 * @private
 * @properties={typeid:24,uuid:"60A76C0E-9AE8-4390-9727-D2051865CEB9"}
 */
function buildToolbar() {
    var toolbarPlaceholderLabelName = getToolbarPlaceholderLabelName();
    if (!toolbarPlaceholderLabelName) {
        //this form does not want to have a "standard" toolbar
        return;
    }
    
    //build a "toolbar"
    var actionNames = getActionNames();
    var jsFrm = solutionModel.getForm(controller.getName());
    var btnWidth = 85;
    var btnActionMthd = jsFrm.getMethod('onActionToolbarButton');
    var toolbarPlaceholder = jsFrm.getLabel(toolbarPlaceholderLabelName);
    toolbarPlaceholder.visible = false;
    var btnHeight = Math.max(toolbarPlaceholder.height, 30);
    var yPos = toolbarPlaceholder.y;
    var xPos = toolbarPlaceholder.x;
    for (var i = 0; i < actionNames.length; i++) {
        var actionName = actionNames[i];
        var action = getAction(actionName);
        action.addPropertyChangeListener(handleActionPropChange);
        var btn = jsFrm.newButton(action.getText(), xPos, yPos, btnWidth, btnHeight, btnActionMthd);
        btn.name = 'toolbarBtn' + (i + 1);
        btn.toolTipText = action.getTooltipText();
        btn.putDesignTimeProperty(DESIGNTIME_PROP_ACTION_NAME, actionName);
        btn.styleClass = 'toolbar-btn';
        btn.enabled = action.isEnabled();
        btn.visible = action.isVisible();
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
 * Listener for property changes of the form actions.
 * @properties={typeid:24,uuid:"5114538E-3230-4096-A3A5-7F4B007353C2"}
 * @private 
 * @param {{propertyName: String, oldValue, newValue, source: scopes.svyActionManager.FormAction}} arg
 */
function handleActionPropChange(arg) {
    if (arg && arg.source) {
        /** @type {RuntimeButton} */
        var btn = elements[m_ButtonActionMap[arg.source.getActionName()]];
        btn.enabled = arg.source.isEnabled();
        btn.visible = arg.source.isVisible();
        btn.text = arg.source.getText();
        btn.toolTipText = arg.source.getTooltipText();
    }
}

/**
 * This method removes the registered action property change listeners when the form is unloaded
 * @protected
 * @properties={typeid:24,uuid:"636E913E-6944-4988-A438-C3BB8FF5EFA1"}
 */
function removeActionPropChangeListeners(){
    //sync buttons and actions state
    var actionNames = getActionNames();
    for (var n in actionNames) {
        var actionName = actionNames[n];
        var action = getAction(actionName);
        action.removePropertyChangeListener(handleActionPropChange);        
    }
}

/**
 * Method override to handle custom code when form is (re)loaded.
 * @override
 * @protected
 *
 * @properties={typeid:24,uuid:"B2D40390-2ED4-4544-8061-6B2F5AA1E707"}
 */
function initializingForm() {
    setFormPolicies();
    addCustomActions();
    buildToolbar();
    m_PolicyInfo = getPolicyInfo();
}

/**
 * Method override to handle custom code when form is unloaded.
 * @override
 * @protected
 *
 * @properties={typeid:24,uuid:"8FC668F5-2CD2-4221-AF64-4DDCB20F0FA1"}
 */
function uninitializingForm() {
    removeActionPropChangeListeners();
}

/**
 * Method override to handle custom code when the form UI is being updated.
 * @override
 * @protected
 * @properties={typeid:24,uuid:"32A775D6-BD16-4A98-9E79-DBDA6FAA665C"}
 */
function updatingUI() {
    var markers = getValidationMarkers();
    for (var i = markers.length - 1; i >= 0; i--) {
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
    updateCustomActionsState();
}

/**
 * Method override to handle custom code when there are errors during "Save" action
 * @override 
 * @protected
 * @param {scopes.svyDataUtils.SaveDataFailedException} error
 * @properties={typeid:24,uuid:"10202653-4F60-406C-ADB2-EE9DDBBAE82F"}
 */
function onSaveError(error) { 
    //not sure why error.message shows up warning in code
    var errMsg = error['message'];
    var rec = error.getRecord();
    if (rec && rec.exception){
        errMsg = rec.exception.getMessage();
    }    
    plugins.webnotificationsToastr.error(utils.stringFormat('Failed to save record from %1$s due to the following:<br>%2$s',[error.getDataSourceName(), errMsg]) , 'Save Error');
}

/**
 * Method override to handle custom code when there are errors during "Delete" action
 * @override 
 * @protected
 * @param {scopes.svyDataUtils.DeleteRecordFailedException} error
 * @properties={typeid:24,uuid:"AE38CE24-58F7-43B5-A5EA-8A3A5CE70C27"}
 */
function onDeleteError(error) { 
  //not sure why error.message shows up warning in code
    var errMsg = error['message'];
    var rec = error.getRecord();
    if (rec && rec.exception){
        errMsg = rec.exception.getMessage();
    }    
    plugins.webnotificationsToastr.error(utils.stringFormat('Failed to delete record from %1$s due to the following:<br>%2$s',[error.getDataSourceName(), errMsg]) , 'Delete Error');
}

/**
 * Custom method to get example form policy configuration information.
 * @public  
 * @return {String}
 * @properties={typeid:24,uuid:"B823D0A5-9610-4C22-AE32-8DA781D8EE0A"}
 */
function getPolicyInfo(){
    var poli = getCrudPolicies();
    var res = utils.stringFormat('<h4>CRUD Policy Info</h4>Batch Scope: <b>%1$s</b><br>Record Selection: <b>%2$s</b><br>Form Hide: <b>%3$s</b><br>Validation: <b>%4$s</b><br>Locking: <b>%5$s</b><br>',[poli.getBatchScopePolicy(), poli.getRecordSelectionPolicy(), poli.getFormHidePolicy(), poli.getValidationPolicy(), poli.getRecordLockingPolicy()]);
    return res;
}

/**
 * Custom method which combines updating of both standard and custom form actions
 * @protected 
 * @properties={typeid:24,uuid:"3E405BFA-CD00-4AAB-9C68-BDAA4C8161A0"}
 */
function updateActionsState(){
    updateStandardFormActionsState();
    updateCustomActionsState();
}
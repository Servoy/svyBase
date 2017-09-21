/**
 * @type {Function}
 * @properties={typeid:35,uuid:"B3824436-4317-423C-8751-3A4F666E6ACC",variableType:-4}
 */
var m_CallLogCallback = null;

/**
 * @properties={typeid:35,uuid:"7D0F3668-E533-4AC6-AF01-E67A66A2BA35",variableType:-4}
 */
var m_HidingFormResult = true;

/**
 * @properties={typeid:35,uuid:"B52515DA-0AE9-4139-B3C1-FAB7DACC84C9",variableType:-4}
 */
var m_FieldValueChangeResult = true;

/**
 * @properties={typeid:35,uuid:"9598602D-55B7-45B9-958B-8DBAF9444B5D",variableType:-4}
 */
var m_UseMockupBubbleResult = false;

/**
 * @properties={typeid:35,uuid:"D2F91FF8-DD22-4CC0-8998-EAAF5C6F2EF4",variableType:-4}
 */
var m_MockupBubbleResult = true;

/**
 * @public
 * @param {Function} callback
 *
 * @properties={typeid:24,uuid:"335AF9D1-4400-4F6E-96B9-E486E43465AD"}
 */
function registerCallLogCallback(callback){
    m_CallLogCallback = callback;
    resetMockupResults();
}

/**
 * 
 * @param {String} name
 * @param {Array} args
 * @properties={typeid:24,uuid:"77F1EE2F-ECD7-4F49-BD77-0C257BBED753"}
 */
function logCall(name, args){
    if (m_CallLogCallback) {
        m_CallLogCallback(name, args);
    }
}

/**
 * @return {JSEvent}
 * @properties={typeid:24,uuid:"9631CA4E-B5EB-4F62-98C4-33CAA0E2E016"}
 */
function getFakeEvent(){
    /** @type {JSEvent} */
    var res = {
        getFormName: function() {return controller.getName()},
        getSource: function() {return elements.fldTest}
    }
    return res;
}

/**
 * @properties={typeid:24,uuid:"3BDAA9C2-26AA-4922-AA86-3DA1A7683727"}
 */
function resetMockupResults(){
    m_HidingFormResult = true;
    m_FieldValueChangeResult = true;
    m_UseMockupBubbleResult = false;
    m_MockupBubbleResult = true;
}

/*========================================================================*/
/* The following overrides simulate what usually users will be overriding */
/*========================================================================*/

/**
 * @override 
 * @protected
 * 
 * @properties={typeid:24,uuid:"FCC39DDA-7F2D-42B8-A076-CB2B615996E1"}
 */
function dataContextChanged() {
    logCall('dataContextChanged', arguments);
}

/**
 * @override 
 * @protected
 * @properties={typeid:24,uuid:"9F00067F-E106-4166-BEFD-2D551393A6B1"}
 */
function initializingForm() {
    logCall('initializingForm', arguments);
}

/**
 * @override 
 * @protected
 * @properties={typeid:24,uuid:"704071CE-698B-4152-8E7A-8536FC02012D"}
 */
function uninitializingForm() {
    logCall('uninitializingForm', arguments);
}

/**
 * @override 
 * @protected
 * @param {Boolean} firstShow True if the form is displayed for the first time after (re)load.
 * 
 * @properties={typeid:24,uuid:"810A68CB-29D8-4BA0-9792-9089CBB2A561"}
 */
function displayingForm(firstShow) {
    logCall('displayingForm', arguments);
}

/**
 * @override 
 * @protected
 * @return {Boolean} Return true if the form can be hidden, otherwise false.
 * 
 * @properties={typeid:24,uuid:"5AB5AE43-2F1A-4FF1-9CC9-4296D320B851"}
 */
function hidingForm() {
    logCall('hidingForm', arguments);
    return m_HidingFormResult;
}

/**
 * @override 
 * @protected
 * 
 * @properties={typeid:24,uuid:"EB556258-8B80-43B5-909E-629CAF904EDA"}
 */
function updatingUI() {
    logCall('updatingUI', arguments);
}

/**
 * @override 
 * @protected
 * @param {String} dataProviderName The name of the dataprovide whose value is changed.
 * @param oldValue old value The old(previous) value.
 * @param newValue new value The new(current) value.
 * @param {JSEvent} event The event that triggered the action.
 *
 * @return {Boolean|String} Return false if the value should not be accepted. In NGClient you can return also a (i18n) string, instead of false, which will be shown as a tooltip.
 *
 * @properties={typeid:24,uuid:"A5266DF5-4DC9-4892-BA0C-B4F29369A674"}
 */
function fieldValueChanged(dataProviderName, oldValue, newValue, event) {    
    logCall('fieldValueChanged', arguments);
    return m_FieldValueChangeResult;
}

/**
 * @override 
 * @private 
 * @param {JSEvent} event The event which triggered the source action.
 * @param {String} bubbleEventType One of the BUBBLE_EVENT_TYPES enum values.
 * @return {Boolean} False if the parent blocked the event by returning false from its {@link onEventBubble} method.
 * 
 * @properties={typeid:24,uuid:"E95D8EB0-3ABF-4F89-8B22-C9E6B6C5C471"}
 */
function bubble(event, bubbleEventType) {
    logCall('bubble', arguments);
    var name = 'bubble'; //just suppressing the "....is private" warning
    var res = _super[name](event, bubbleEventType);
    if (m_UseMockupBubbleResult) {
        return m_MockupBubbleResult;
    }
    return res;
}

/*===================================================================*/
/* The following overrides simply expose protected methods as public */
/*===================================================================*/

/**
 * @override 
 * @public
 * @param oldValue old value
 * @param newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean|String} Return false if the value should not be accepted.
 *
 * @properties={typeid:24,uuid:"56858E6A-E855-4AE8-9A5C-B580952BE47B"}
 */
function onElementDataChange(oldValue, newValue, event) {    
    return _super.onElementDataChange(oldValue,newValue,event);
}

/**
 * @override 
 * @public
 * @param {JSEvent} event The event that triggered the action.
 *
 * @properties={typeid:24,uuid:"86B49395-6C7F-496C-833B-F8829881B55E"}
 */
function onRecordSelection(event) {
    _super.onRecordSelection(event);
}

/**
 * @override 
 * @public
 * @param {Boolean} firstShow True if the form is shown for the first time after load.
 * @param {JSEvent} event The event that triggered the action.
 *
 * @properties={typeid:24,uuid:"4DDE90C6-5346-4D69-919A-7D0B11091EEC"}
 */
function onShow(firstShow, event) {
    _super.onShow(firstShow,event);
}

/**
 * @override 
 * @public
 * @param {JSEvent} event The event that triggered the action.
 * @return {Boolean} Return false when the focus gained event of the element itself shouldn't be triggered.
 *
 * @properties={typeid:24,uuid:"0C0D3766-5342-403E-BA55-449136028B1E"}
 */
function onElementFocusGained(event) {
    return _super.onElementFocusGained(event);
}

/**
 * @override 
 * @public
 * @param {JSEvent} event The event that triggered the action.
 * @return {Boolean} Return false when the focus lost event of the element itself shouldn't be triggered.
 *
 *
 * @properties={typeid:24,uuid:"3A839016-D73D-444D-9CF2-56552FE70129"}
 */
function onElementFocusLost(event) {
    return _super.onElementFocusLost(event);
}

/**
 * @override 
 * @public
 * @param {JSEvent} event The event that triggered the action.
 * @return {Boolean} True if the form can be hidden, false to block the action so the form will remain visible.
 *
 * @properties={typeid:24,uuid:"DCA2E6D4-023D-4641-BD57-A4C662ABECB8"}
 */
function onHide(event) {
    return _super.onHide(event);
}

/**
 * @override 
 * @public
 * @param {JSEvent} event the event that triggered the action.
 *
 * @properties={typeid:24,uuid:"29F14FF2-0C60-4AFD-8DB0-1ED8577E526C"}
 */
function onLoad(event) {
    _super.onLoad(event);
}

/**
 * @override 
 * @public
 * @param {JSEvent} event The event that triggered the action.
 * @return {Boolean} Return false if the user should not be able to edit the record.
 *
 *
 * @properties={typeid:24,uuid:"25B75A16-BBDB-460C-BE01-F4E29FB6A50A"}
 */
function onRecordEditStart(event) {
    return _super.onRecordEditStart(event);
}

/**
 * @override 
 * @public
 * @param {JSRecord} record The record being edited.
 * @param {JSEvent} event The event that triggered the action.
 * @return {Boolean} Return false if the record fails to validate then the user cannot leave the record.
 *
 * @properties={typeid:24,uuid:"6634F35C-5769-48DD-B854-75BCECE4843F"}
 */
function onRecordEditStop(record, event) {
    return _super.onRecordEditStop(record,event);
}

/**
 * @override 
 * @public
 * @param {JSEvent} event The event that triggered the action.
 *
 * @properties={typeid:24,uuid:"F0BD1709-2B41-42AC-9D9E-EAB3171AC6D6"}
 */
function onResize(event) {
    _super.onResize(event);
}

/**
 * @override 
 * @public
 * @param {JSEvent} event The event that triggered the action.
 *
 * @properties={typeid:24,uuid:"C915B89F-E543-46B1-AA01-8C391D4AC1D8"}
 */
function onUnload(event) {
    _super.onUnload(event);
}

/**
 * @override
 * @public
 * @param {String} name The name of the form action. Must be unique within this form context.
 * @param {String|Function} handler The actual function (or function name) which will be executed when the action is invoked. This must be a Servoy function (anonymous callbacks are not supported). The FormAction will provide as input argument to the handler function an instance of the ActionEvent. The signature of the handler function should be: function(ActionEvent).
 * @param {Boolean} [isToggle] Optional Optional argument indicating if the action supports toggling true/false of its "selected" property with each action invocation.
 * @return {scopes.svyActionManager.FormAction} The FormAction which was added.
 * @properties={typeid:24,uuid:"B89546EC-FD92-4F26-8B09-9E192B08585E"}
 */
function addAction(name, handler, isToggle) {
    return _super.addAction(name, handler, isToggle);
}
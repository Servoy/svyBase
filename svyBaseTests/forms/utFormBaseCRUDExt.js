/**
 * @type {Function}
 * @properties={typeid:35,uuid:"BC6E1BD3-5A0D-4F76-89AB-A162C7E91980",variableType:-4}
 */
var m_CallLogCallback = null;

/**
 * @properties={typeid:35,uuid:"A185EDE4-7150-40E2-BC31-BFB7423DA873",variableType:-4}
 */
var m_HidingFormResult = true;

/**
 * @properties={typeid:35,uuid:"434913A5-E478-454A-B811-BF37A7AFB97F",variableType:-4}
 */
var m_FieldValueChangeResult = true;

/**
 * @properties={typeid:35,uuid:"B349F552-5BDA-4E95-95A4-7F6E5DB8D6F3",variableType:-4}
 */
var m_UseMockupBubbleResult = false;

/**
 * @properties={typeid:35,uuid:"497E2417-F67C-4FC3-B69F-0B8DAE3AA07C",variableType:-4}
 */
var m_MockupBubbleResult = true;

/**
 * @properties={typeid:35,uuid:"188912AC-FBE6-4317-B015-2720018D4E29",variableType:-4}
 */
var m_UserLeaveResult = scopes.svyCRUDManager.USER_LEAVE.BLOCK;

/**
 * @properties={typeid:35,uuid:"4982B97D-C56D-4A5A-B933-D4B5311DB184",variableType:-4}
 */
var m_BeforeNewRecordResult = true;

/**
 * @properties={typeid:35,uuid:"758B35F0-3552-4A17-8A6E-59D622F1929D",variableType:-4}
 */
var m_FailCreateNewRecord = false;

/**
 * @properties={typeid:35,uuid:"8D6AC20A-4A6C-4099-9A36-88FC602C1251",variableType:-4}
 */
var m_BeforeCancelResult = true;

/**
 * @public
 * @param {Function} callback
 *
 * @properties={typeid:24,uuid:"7D34DD07-326A-4587-B1AF-EC180DB89C8B"}
 */
function registerCallLogCallback(callback){
    m_CallLogCallback = callback;
    resetMockupResults();
    var poli = scopes.svyCRUDManager.createCRUDPolicies();
    getCrudPolicies().
        setBatchScopePolicy(poli.getBatchScopePolicy()).
        setFormHidePolicy(poli.getFormHidePolicy()).
        setRecordLockingPolicy(poli.getRecordLockingPolicy()).
        setRecordSelectionPolicy(poli.getRecordSelectionPolicy()).
        setValidationPolicy(poli.getValidationPolicy());
}

/**
 * 
 * @param {String} name
 * @param {Array} args
 * @properties={typeid:24,uuid:"7239A71C-273F-4B40-A854-7BD28520C832"}
 */
function logCall(name, args){
    if (m_CallLogCallback) {
        m_CallLogCallback(name, args);
    }
}

/**
 * @return {JSEvent}
 * @properties={typeid:24,uuid:"5DD31A5F-5CCE-4D9D-A1E1-EF9FC1B2E825"}
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
 * @properties={typeid:24,uuid:"B60DE376-CDE2-4057-8618-E1399385FD15"}
 */
function resetMockupResults(){
    m_HidingFormResult = true;
    m_FieldValueChangeResult = true;
    m_UseMockupBubbleResult = false;
    m_MockupBubbleResult = true;
    m_UserLeaveResult = scopes.svyCRUDManager.USER_LEAVE.BLOCK;
    m_BeforeNewRecordResult = true;
    m_FailCreateNewRecord = false;
    m_BeforeCancelResult = true;
}

/*========================================================================*/
/* The following overrides simulate what usually users will be overriding */
/*========================================================================*/

/**
 * @override 
 * @protected
 * 
 * @properties={typeid:24,uuid:"3B7983A3-5ED8-41BC-B4A1-4F6AD44E7D46"}
 */
function dataContextChanged() {
    logCall('dataContextChanged', arguments);
}

/**
 * @override 
 * @protected
 * @properties={typeid:24,uuid:"C2878E7F-6A25-4CA4-ACF4-226CB13531C6"}
 */
function initializingForm() {
    logCall('initializingForm', arguments);
}

/**
 * @override 
 * @protected
 * @properties={typeid:24,uuid:"3CF98361-4116-40F8-81A6-6696EA6AA39C"}
 */
function uninitializingForm() {
    logCall('uninitializingForm', arguments);
}

/**
 * @override 
 * @protected
 * @param {Boolean} firstShow True if the form is displayed for the first time after (re)load.
 * 
 * @properties={typeid:24,uuid:"840BEAC0-04B1-4126-B7DC-09FA2935BE29"}
 */
function displayingForm(firstShow) {
    logCall('displayingForm', arguments);
}

/**
 * @override 
 * @protected
 * @return {Boolean} Return true if the form can be hidden, otherwise false.
 * 
 * @properties={typeid:24,uuid:"A260610E-41D0-4824-8854-1B548121AA7D"}
 */
function hidingForm() {
    logCall('hidingForm', arguments);
    return m_HidingFormResult;
}

/**
 * @override 
 * @protected
 * 
 * @properties={typeid:24,uuid:"A83A3C43-5490-427E-8F15-749FF25D70C6"}
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
 * @properties={typeid:24,uuid:"19733133-5D11-43B8-9D90-79A13ED85B91"}
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
 * @properties={typeid:24,uuid:"89780F2E-6509-407B-A0EE-B9BA2B472931"}
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

/**
 * @override 
 * @protected
 * @return {String} One of the {@link svyCRUDManager#USER_LEAVE) enumeration options indicating how to proceed. The default is to block the operation (scopes.svyCRUDManager.USER_LEAVE.BLOCK)
 * 
 * @properties={typeid:24,uuid:"728170B3-7E62-4B9E-ACE8-FAC95A936DD1"}
 */
function onUserLeave() {
    logCall('onUserLeave', arguments);
    return m_UserLeaveResult;
}

/**
 * @override 
 * @protected
 * @return {Boolean} True (default) if the new record operation can proceed, false to cancel the new record operation.
 * 
 * @properties={typeid:24,uuid:"B167FEAF-72B4-478B-8177-CFF18E230291"}
 */
function beforeNewRecord() {
    logCall('beforeNewRecord', arguments);
    return m_BeforeNewRecordResult;
}

/**
 * @override 
 * @protected 
 * @return {JSRecord}
 * @properties={typeid:24,uuid:"3FBD789F-9FBD-485C-9134-4F9111284DB1"}
 */
function createNewRecord(){
    logCall('createNewRecord', arguments);
    if (m_FailCreateNewRecord) {
        throw new Error('TestFailCreateNewRecord');
    }
    return _super.createNewRecord();
}

/**
 * @override 
 * @protected
 * @param {JSRecord} record The new record which was created.
 * 
 * @properties={typeid:24,uuid:"89C44B91-4673-44D4-8CF3-733A81C4AA55"}
 */
function afterNewRecord(record) {
    logCall('afterNewRecord', arguments);
}

/**
 * @override 
 * @protected
 * @param {scopes.svyDataUtils.NewRecordFailedException} error Custom exception object containing information about the particular error.
 * 
 * @properties={typeid:24,uuid:"1F43BC6F-996E-4256-9663-DBFF570DE407"}
 */
function onNewRecordError(error) {
    logCall('onNewRecordError', arguments);
}

/**
 * @override 
 * @protected
 * @param {JSRecord|Array<JSRecord>|JSFoundSet} records The records to add and track in the batch scope of this form.
 * 
 * @properties={typeid:24,uuid:"C09584BF-A69B-45E7-9D70-F7F5E7BE07EC"}
 */
function track(records) {
    logCall('track', arguments);
    _super.track(records);
}

/**
 * @override 
 * @protected
 * @param {Array<JSRecord>} records The records to lock.
 * @return {Boolean} False if could not lock one of the specified records (will add a validation error marker for it).
 * 
 * @properties={typeid:24,uuid:"C9D63A66-F662-47F1-B50C-0C6512EB6130"}
 */
function lockRecords(records) {
    logCall('lockRecords', arguments);
    return _super.lockRecords(records);
}

/**
 * @override 
 * @protected
 * 
 * @properties={typeid:24,uuid:"EFB9B501-D89F-4D01-853F-CD2969C80573"}
 */
function releaseAllLocks() {
    logCall('releaseAllLocks', arguments);
    _super.releaseAllLocks();    
}

/**
 * @override 
 * @protected
 * @param {Array<JSRecord>} records The records to be reverted back to their original state.
 * @return {Boolean} True (default) if the cancel operation can proceed, false to block the cancel operation.
 * 
 * @properties={typeid:24,uuid:"DE443343-97F9-42E2-80AB-94FBB3341F24"}
 */
function beforeCancel(records) {
    logCall('beforeCancel', arguments);
    return m_BeforeCancelResult;
}

/**
 * @override   
 * @protected
 *
 * @properties={typeid:24,uuid:"34F0FF56-D8AB-4D8E-8502-CC8E67495117"}
 */
function clearValidationMarkers() {
    logCall('clearValidationMarkers', arguments);
    _super.clearValidationMarkers();
}

/**
 * @override 
 * @private
 * 
 * @properties={typeid:24,uuid:"E4E9C032-C8E5-4029-B6CD-0D5D4BEF97D8"}
 */
function clearTracking() {
    logCall('clearTracking', arguments);
    _super.clearTracking();
}

/**
 * @override 
 * @protected
 * 
 * @properties={typeid:24,uuid:"491F3582-4FBC-4507-B362-427CC095DFD7"}
 */
function afterCancel() {
    logCall('afterCancel', arguments);    
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
 * @properties={typeid:24,uuid:"F3B85352-0DF5-4C07-BE90-F3B41727A9E6"}
 */
function onElementDataChange(oldValue, newValue, event) {    
    return _super.onElementDataChange(oldValue,newValue,event);
}

/**
 * @override 
 * @public
 * @param {JSEvent} event The event that triggered the action.
 *
 * @properties={typeid:24,uuid:"9638FFEB-C06A-43B4-B163-ADE9195287D6"}
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
 * @properties={typeid:24,uuid:"31D71FEA-9252-4EFF-BC01-5ECD4A8D2BB8"}
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
 * @properties={typeid:24,uuid:"E86D574B-EAB9-4189-870E-1C1C3887DC2A"}
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
 * @properties={typeid:24,uuid:"5B6C9652-96F6-4882-A687-CB20142B3872"}
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
 * @properties={typeid:24,uuid:"27F808DB-578E-43D6-B0FC-F8D3AC13B819"}
 */
function onHide(event) {
    return _super.onHide(event);
}

/**
 * @override 
 * @public
 * @param {JSEvent} event the event that triggered the action.
 *
 * @properties={typeid:24,uuid:"C1885167-2811-46DD-B5C6-61D64E1BED90"}
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
 * @properties={typeid:24,uuid:"E7D05B72-2751-48FD-AD53-30CCACDE8391"}
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
 * @properties={typeid:24,uuid:"36FBB06B-34C5-46B3-B4A9-F0F1A09EA21B"}
 */
function onRecordEditStop(record, event) {
    return _super.onRecordEditStop(record,event);
}

/**
 * @override 
 * @public
 * @param {JSEvent} event The event that triggered the action.
 *
 * @properties={typeid:24,uuid:"17A1439E-CB55-4455-8EA6-FA66431A9D5D"}
 */
function onResize(event) {
    _super.onResize(event);
}

/**
 * @override 
 * @public
 * @param {JSEvent} event The event that triggered the action.
 *
 * @properties={typeid:24,uuid:"7144B94F-CA20-465D-9BB0-F19AFF08B07C"}
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
 * @properties={typeid:24,uuid:"92EB469E-1213-4D69-BEB4-E347F7392632"}
 */
function addAction(name, handler, isToggle) {
    return _super.addAction(name, handler, isToggle);
}

/**
 * @override 
 * @public 
 * @return {scopes.svyCRUDManager.CRUDPolicies} The current form policies.
 * @properties={typeid:24,uuid:"88B796C4-6826-4D1F-9BA3-3B4AFF7B7E53"}
 */
function getCrudPolicies() {
    return _super.getCrudPolicies();
}

/**
 * @override 
 * @public 
 * @return {Boolean} True if a new record was created, otherwise false.
 * 
 * @properties={typeid:24,uuid:"EEAEC172-3426-4872-838B-74AEDEB9D5E3"}
 */
function newRecord() {
    return _super.newRecord();
}

/**
 * @override 
 * @public 
 * @return {Boolean} True if the unsaved changes were canceled/reverted successfully.
 *  
 * @properties={typeid:24,uuid:"0E1E2EC4-8E83-43D7-BBC3-052E84FDA2FF"}
 */
function cancel() {
    return _super.cancel();
}
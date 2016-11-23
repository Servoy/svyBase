/**
 * @public 
 * @enum 
 * @properties={typeid:35,uuid:"B8C7F8C1-7818-444E-9B2C-AA6857B480C5",variableType:-4}
 */
var EVENTS = {
	ELEMENT_DATA_CHANGE:'elementDataChange',	
	ELEMENT_FOCUS_GAINED:'elementFocusGained',
	ELEMENT_FOCUS_LOST:'elementFocusLost',
	FORM_HIDE:'formHide',
	FORM_LOAD:'formLoad',
	RECORD_EDIT_START:'recordEditStart',
	RECORD_EDIT_STOP:'recordEditStop',
	RECORD_SELECTION:'recordSelection',
	FORM_RESIZE:'formResize',
	FORM_SHOW:'formShow',
	FORM_UNLOAD:'formUnload'
}

/**
 * @private 
 * @properties={typeid:35,uuid:"A0D41791-4D42-40EC-BF4D-70DE912CAE26",variableType:-4}
 */
var eventSupport = new scopes.svyEventManager.EventSupport(this);

/**
 * @private 
 * @properties={typeid:35,uuid:"7E7796BF-C9B8-4B05-95D0-C321840C6781",variableType:-4}
 */
var propertyChangeSupport = new scopes.svyEventManager.PropertyChangeSupport(this);

/**
 * @protected 
 * @properties={typeid:35,uuid:"40C7FF71-D172-462F-8C39-0F373D0E9979",variableType:-4}
 */
var actionMap = {};

/**
 * @public  
 * @param {String} command
 * @return {scopes.svyActionManager.FormAction}
 * @properties={typeid:24,uuid:"55E79BC0-87D3-4B2E-B164-1D76F247F78B"}
 */
function getAction(command){
	/** @type {scopes.svyActionManager.FormAction} */
	var action = actionMap[command];
	return action;
}

/**
 * @public 
 * @return {Array<String>}
 * @properties={typeid:24,uuid:"3F380791-1B21-41E9-AFCB-39B72EFB01CF"}
 */
function getActionCommands(){
	var commands = [];
	for(var c in actionMap){
		commands.push(c);
	}
	return commands.sort();
}

/**
 * @protected 
 * @param {String} command
 * @param {String|Function} handler
 * @param {Boolean} [isToggle]
 * @return {scopes.svyActionManager.FormAction}
 * @properties={typeid:24,uuid:"3AB60926-3D2E-424C-8AC9-E7B14D71B0C3"}
 */
function addAction(command, handler, isToggle){
	var action = new scopes.svyActionManager.FormAction(command,this,handler,isToggle);
	actionMap[action.getActionCommand()] = action;
	return action
}

/**
 * @public  
 * @param listener
 * @param eventType
 *
 * @properties={typeid:24,uuid:"0C037F64-2AA5-4A90-86B1-3DF9B10489E3"}
 */
function addEventListener(listener,eventType){
	eventSupport.addListener(listener,eventType)
}

/**
 * @public  
 * @param listener
 * @param eventType
 *
 * @properties={typeid:24,uuid:"621A3142-18C3-4633-A234-B06DDBFD8E00"}
 */
function removeEventListener(listener, eventType){
	eventSupport.removeListener(listener,eventType);
}

/**
 * @protected 
 * @param eventType
 * @param {*} [args]
 * @param {Boolean} [vetoable]
 * @return {scopes.svyEventManager.Event}
 * @properties={typeid:24,uuid:"13CFECD6-9E37-4C0A-8D60-D2A7BF0AD9A9"}
 */
function fireEvent(eventType,args, vetoable){
	return eventSupport.fireEvent(eventType,args,vetoable);
}

/**
 * @public 
 * @param {Function} listener
 * @param {String} [propertyName]
 *
 * @properties={typeid:24,uuid:"F70D6E86-19C3-41D5-B3F4-24E7DA359F08"}
 */
function addPropertyChangeListener(listener, propertyName){
	propertyChangeSupport.addListener(listener,propertyName);
}

/**
 * @public 
 * @param {Function} listener
 * @param {String} [propertyName]
 *
 * @properties={typeid:24,uuid:"093A33B4-8017-43CE-A72E-52B8E894BB4F"}
 */
function removePropertyChangeListener(listener, propertyName){
	propertyChangeSupport.removeListener(listener,propertyName);
}

/**
 * @protected 
 * @param {String} propertyName
 * @param {Object} oldValue
 * @param {Object} newValue
 *
 * @properties={typeid:24,uuid:"8E97B61F-04D3-40E5-B6A3-8C6529247650"}
 */
function firePropertyChangeEvent(propertyName,oldValue,newValue){
	propertyChangeSupport.fireEvent(propertyName,oldValue,newValue);
}





/**
 * @protected 
 * @properties={typeid:24,uuid:"F0266C36-3862-4956-BCB5-A81B97CD84CA"}
 */
function updateUI(){
	// placeholder for implementation forms
}

/**
 * Handle changed data, return false if the value should not be accepted. 
 * In NGClient you can return also a (i18n) string, instead of false, which will be shown as a tooltip.
 *
 * @param oldValue old value
 * @param newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean}
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"F0158F6D-AE28-45F9-BFF1-D50AB2504F28"}
 */
function onElementDataChange(oldValue, newValue, event) {
	updateUI();
	return fireEvent(EVENTS.ELEMENT_DATA_CHANGE,{oldValue:oldValue,newValue:newValue},true).isVetoed();
}

/**
 * Handle record selected.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"12647EBC-63BE-4361-A77F-C480D61D474F"}
 */
function onRecordSelection(event) {
	updateUI();
	fireEvent(EVENTS.RECORD_SELECTION);
}

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"3F55B248-8B06-4D1B-B662-CAEF7EF09DE5"}
 */
function onShow(firstShow, event) {
	updateUI();
	fireEvent(EVENTS.FORM_SHOW);
}

/**
 * Handle focus gained event of an element on the form. Return false when the focus gained event of the element itself shouldn't be triggered.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean}
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"435BD246-195F-468F-A231-91548DF1C0EC"}
 */
function onElementFocusGained(event) {
	return fireEvent(EVENTS.ELEMENT_FOCUS_GAINED, null, true).isVetoed();
}

/**
 * Handle focus lost event of an element on the form. Return false when the focus lost event of the element itself shouldn't be triggered.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean}
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"1025D295-9A86-4D6E-8F14-2A5BE7317CEB"}
 */
function onElementFocusLost(event) {
	return fireEvent(EVENTS.ELEMENT_FOCUS_LOST,  null, true).isVetoed();
}

/**
 * Handle hide window.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean}
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"F2F39B1A-2DDC-4F8D-ACD4-20E8627AD397"}
 */
function onHide(event) {
	return fireEvent(EVENTS.FORM_HIDE,null,true).isVetoed();
}

/**
 * Callback method when form is (re)loaded.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"91BEB20C-902E-491D-820C-246EB85E8A51"}
 */
function onLoad(event) {
	
}

/**
 * Callback method form when editing is started.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean}
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"EBA00357-09D0-49EF-A92A-D54FD9E9A545"}
 */
function onRecordEditStart(event) {
	updateUI();
	return fireEvent(EVENTS.RECORD_EDIT_START, null, true).isVetoed();
}

/**
 * Callback method form when editing is stopped, return false if the record fails to validate then the user cannot leave the record.
 *
 * @param {JSRecord} record record being saved
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean}
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"0B5A2FCA-ACF2-4E96-B378-A6CE926E02B7"}
 */
function onRecordEditStop(record, event) {
	updateUI();
	return fireEvent(EVENTS.RECORD_EDIT_STOP, null, true).isVetoed();
}

/**
 * Callback method when form is resized.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"B8D10B13-AF0D-4068-80E4-D5E984C8986B"}
 */
function onResize(event) {
	updateUI();
	fireEvent(EVENTS.FORM_RESIZE);
}

/**
 * Callback method when form is destroyed.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"272A5E65-70D8-4779-BFE8-DBEB5CE0302B"}
 */
function onUnload(event) {
	fireEvent(EVENTS.FORM_UNLOAD);
}

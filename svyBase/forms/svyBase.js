/*
 * TODO Possible to generate a foundset change event by trapping the selection event and comparing foundsets
 * TODO Consider a top-level broadcast instead of listeners
 * i.e. a form event is broadcast regardless of added listenefrs
 * another form might be interested in any visible form's element data changef or example
 *
 * TODO Consider a way to watch all svyBase contained forms for events
 */

/**
 * @private
 * @properties={typeid:35,uuid:"40C7FF71-D172-462F-8C39-0F373D0E9979",variableType:-4}
 */
var m_ActionMap = { };

/**
 * @public
 * @param {String} name
 * @return {scopes.svyActionManager.FormAction}
 * @properties={typeid:24,uuid:"55E79BC0-87D3-4B2E-B164-1D76F247F78B"}
 */
function getAction(name) {
    /** @type {scopes.svyActionManager.FormAction} */
    var action = m_ActionMap[name];
    return action;
}

/**
 * @public
 * @return {Array<String>}
 * @properties={typeid:24,uuid:"3F380791-1B21-41E9-AFCB-39B72EFB01CF"}
 */
function getActionNames() {
    var names = [];
    for (var name in m_ActionMap) {
        names.push(name);
    }
    return names;
}

/**
 * @protected
 * @param {String} name
 * @param {String|Function} handler
 * @param {Boolean} [isToggle]
 * @return {scopes.svyActionManager.FormAction}
 * @properties={typeid:24,uuid:"3AB60926-3D2E-424C-8AC9-E7B14D71B0C3"}
 */
function addAction(name, handler, isToggle) {
    var action = new scopes.svyActionManager.FormAction(name, this, handler, isToggle);
    m_ActionMap[action.getActionName()] = action;
    return action;
}

/**
 * @protected
 * @properties={typeid:24,uuid:"F0266C36-3862-4956-BCB5-A81B97CD84CA"}
 */
function updateUI() {
    updatingUI();
}

/**
 * Handle changed data, return false if the value should not be accepted.
 * In NGClient you can return also a (i18n) string, instead of false, which will be shown as a tooltip.
 *
 * @param oldValue old value
 * @param newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean|String}
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"F0158F6D-AE28-45F9-BFF1-D50AB2504F28"}
 */
function onElementDataChange(oldValue, newValue, event) {
    if (event) {
        /** @type {RuntimeTextField} */
        var field = event.getSource();
        if (field) {
            var res = fieldValueChanged(field.getDataProviderID(), oldValue, newValue, event);
            if ( (res === false) || ( (typeof res == 'string') && utils.stringTrim(res + '').length > 0)) {
                return res;
            }
        }
    }
    updateUI();
    return bubble(event);
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
    dataContextChanged();
    updateUI();
    bubble(event);
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
    displayingForm(firstShow);
    updateUI();
    bubble(event);
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
    return bubble(event);
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
    return bubble(event);
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
    if (hidingForm()) {
        return bubble(event);
    }
    return false;
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
    initializingForm();
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
    return bubble(event);
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
    return bubble(event);
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
    bubble(event);
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
    uninitializingForm();
    bubble(event);
}

/**
 * TODO Propagation is currently blocked by a non-svyBase form in between. This could be routed
 *
 * @private
 * @param {JSEvent} event
 * @return {Boolean}
 * @properties={typeid:24,uuid:"83976541-2B87-4AA1-8040-76D0D53EEAF4"}
 */
function bubble(event) {

    // skip event bubble handler if THIS form is same as source
    if (event.getFormName() != controller.getName()) {

        // bubble handler / check if blocked
        if (onEventBubble(event) === false) {
            return false;
        }
    }

    // bubble to parent form
    var parent = forms[scopes.svyUI.getParentFormName(this)];
    if (parent && scopes.svyUI.isJSFormInstanceOf(parent, forms.svyBase)) {
        /** @type {{bubble: function(JSEvent)}} */
        var p = parent; //using this to suppress the "...is private" warning even though we are accessing a protected method
        return p.bubble(event);
    }

    // outer-most form has been reached
    return true;
}

/**
 * @protected
 * @param {JSEvent} event
 * @return {Boolean}
 *
 * @properties={typeid:24,uuid:"D8FB0D9B-0DCD-4701-9A1C-79D424D62E8A"}
 */
function onEventBubble(event) {
    return true;
}

/**
 * Called when the form's foundset is replaced with a different one by a call to setFoundSet
 * or when the current record is changed with a different one (through selection, loading, etc.)
 * Intended for usage by extending forms which need to react in some way to the data context change.
 * @protected
 * @properties={typeid:24,uuid:"4152ECA4-2A42-43DF-B3EF-6202E65A164D"}
 */
function dataContextChanged() {
    //intentionally left blank - extending form should override if they need to respond to data context changes (for example when the form's foundset is replaced from outside and this change needs to be propagated to any other forms hosted by this form)
}

/**
 * Called as part of the custom onLoad event handling
 * @protected
 * @properties={typeid:24,uuid:"D72EC127-A1AC-46CF-ACEF-895277876B68"}
 */
function initializingForm() {
    //intentionally left blank - extending form should override if needed
}

/**
 * Called as part of the custom onUnload event handling
 * @protected
 * @properties={typeid:24,uuid:"E11F51C3-98DE-4E1E-857E-D0698A422F1C"}
 */
function uninitializingForm() {
    //intentionally left blank - extending form should override if needed
}

/**
 * Called as part of the custom onShow event handling
 * @protected
 * @param {Boolean} firstShow
 * @properties={typeid:24,uuid:"6A5C9CDE-2D6D-482E-90E6-5FE74D3B977F"}
 */
function displayingForm(firstShow) {
    //intentionally left blank - extending form should override if needed
}

/**
 * Called as part of the custom onHide event handling
 * @protected
 * @return {Boolean} true if can hide the form, otherwise false
 * @properties={typeid:24,uuid:"3187DC11-97F2-4A21-95EC-4695B35FE306"}
 */
function hidingForm() {
    //extending form should override if needed
    return true;
}

/**
 * Called when the UI is being updated as part of the custom updateUI method.
 * @protected
 * @properties={typeid:24,uuid:"6B87BF9E-941A-4A5E-9D90-BADB651E8816"}
 */
function updatingUI() {
    //intentionally left blank - extending form should override if needed
}

/**
 * Handle changed data, return false if the value should not be accepted.
 * In NGClient you can return also a (i18n) string, instead of false, which will be shown as a tooltip.
 *
 * @protected
 * @param {String} dataProviderName
 * @param oldValue old value
 * @param newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean|String}
 *
 * @properties={typeid:24,uuid:"59067D6F-BFFD-4135-9BD0-0D088B1324E4"}
 */
function fieldValueChanged(dataProviderName, oldValue, newValue, event) {
    return true;
}

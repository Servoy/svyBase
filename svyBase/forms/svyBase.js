/*
 * TODO Possible to generate a foundset change event by trapping the selection event and comparing foundsets
 * TODO Consider a top-level broadcast instead of listeners
 * i.e. a form event is broadcast regardless of added listenefrs
 * another form might be interested in any visible form's element data changef or example
 *
 * TODO Consider a way to watch all svyBase contained forms for events
 */

/**
 * Enumeration used in the onEventBubble arguments to indicate the type of the event being bubbled.
 * @public
 * @enum
 * @properties={typeid:35,uuid:"83F0808B-93F2-4697-AD3B-847D44D1705C",variableType:-4}
 */
var BUBBLE_EVENT_TYPES = {
    /**
     * Used for bubbling up the onShow form events.
     */
    FORM_SHOW: 'form-show',
    /**
     * Used for bubbling up the onHide form events.
     */
    FORM_HIDE: 'form-hide',
    /**
     * Used for bubbling up the onLoad form events.
     */
    FORM_LOAD: 'form-load',
    /**
     * Used for bubbling up the onUnload form events.
     */
    FORM_UNLOAD: 'form-unload',
    /**
     * Used for bubbling up the onResize form events.
     */
    FORM_RESIZE: 'form-resize',
    /**
     * Used for bubbling up the onRecordSelection form events.
     */
    RECORD_SELECT: 'record-select',
    /**
     * Used for bubbling up the onRecordEditStart form events.
     */
    RECORD_EDIT_START: 'record-edit-start',
    /**
     * Used for bubbling up the onRecordEditStop form events.
     */
    RECORD_EDIT_STOP: 'record-edit-stop',
    /**
     * Used for bubbling up the onElementFocusGained form events.
     */
    ELEMENT_FOCUS_GAINED: 'element-focus-gained',
    /**
     * Used for bubbling up the onElementFocusLost form events.
     */
    ELEMENT_FOCUS_LOST: 'element-focus-lost',
    /**
     * Used for bubbling up the onElementDataChange form events.
     */
    ELEMENT_DATA_CHANGE: 'element-data-change'
}

/**
 * @private
 * @properties={typeid:35,uuid:"40C7FF71-D172-462F-8C39-0F373D0E9979",variableType:-4}
 */
var m_ActionMap = { };

/**
 * Gets the indicated FormAction by name.
 * @public
 * @param {String} name The name of the FormAction to get.
 * @return {scopes.svyActionManager.FormAction} The specified FormAction or null if a FormAction with the specified name is not found.
 * @properties={typeid:24,uuid:"55E79BC0-87D3-4B2E-B164-1D76F247F78B"}
 */
function getAction(name) {
    /** @type {scopes.svyActionManager.FormAction} */
    var action = m_ActionMap[name];
    return action || null;
}

/**
 * Gets a list of the names of the available FormActions exposed by this form.
 * @public
 * @return {Array<String>} The list of names of the available FormAction or an empty array if no actions are available.
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
 * Adds a new FormAction to this form.
 * @protected
 * @param {String} name The name of the form action. Must be unique within this form context.
 * @param {String|Function} handler The actual function (or function name) which will be executed when the action is invoked. This must be a Servoy function (anonymous callbacks are not supported). The FormAction will provide as input argument to the handler function an instance of the ActionEvent. The signature of the handler function should be: function(ActionEvent).
 * @param {Boolean} [isToggle] Optional Optional argument indicating if the action supports toggling true/false of its "selected" property with each action invocation.
 * @return {scopes.svyActionManager.FormAction} The FormAction which was added.
 * @properties={typeid:24,uuid:"3AB60926-3D2E-424C-8AC9-E7B14D71B0C3"}
 */
function addAction(name, handler, isToggle) {
    var action = new scopes.svyActionManager.FormAction(name, this, handler, isToggle);
    m_ActionMap[action.getActionName()] = action;
    return action;
}

/**
 * This method initiates the update of the user interface of this form.
 * It is recommended that extending forms do not override this method. Instead they should override the dedicated {@link updateUI} method to add custom code for updating of the UI.
 * 
 * @private 
 * @param {JSEvent} event the event that triggered the action
 * @param {String} eventType the event type as one of the BUBBLE_EVENT_TYPES
 * 
 * @properties={typeid:24,uuid:"F0266C36-3862-4956-BCB5-A81B97CD84CA"}
 */
function updateUIHandler(event, eventType) {
    updateUI(event, eventType);
}

/**
 * Provides internal handling of the event fired after users change data in form fields.
 * If a parent form is available and it extends the svyBase then this event will "bubble up" to the parent through the {@link onEventBubble} method.
 * In NGClient you can return also a (i18n) string, instead of false, which will be shown as a tooltip on the respective UI field.
 * It is recommended that extending forms do not override this method. Instead, they should override the dedicated {@link onElementDataChange} method.
 * 
 * @private
 * 
 * @param oldValue old value
 * @param newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean|String} Return false if the value should not be accepted.
 *
 * @properties={typeid:24,uuid:"F0158F6D-AE28-45F9-BFF1-D50AB2504F28"}
 */
function onElementDataChangeHandler(oldValue, newValue, event) {
	try {
		if (event) {
			/** @type {RuntimeComponent} */
			var component = event.getSource();
			if (component) {
				var dataProvider = null;
				if ('getDataProviderID' in component) {
					dataProvider = component['getDataProviderID']();
				}

				if (!dataProvider) {
					if ('dataprovider' in component) {
						dataProvider = component['dataprovider'];
					} else if ('dataProvider' in component) {
						dataProvider = component['dataProvider'];
					} else if ('dataProviderID' in component) {
						dataProvider = component['dataProviderID'];
					} else if ('dataProviderId' in component) {
						dataProvider = component['dataProviderId'];
					} else if ('dataproviderId' in component) {
						dataProvider = component['dataproviderId'];
					} else if ('dataproviderID' in component) {
						dataProvider = component['dataproviderID'];
					}
				}
				var res = onElementDataChange(oldValue, newValue, event, dataProvider);
				if ( (res === false) || ( (typeof res === 'string') && utils.stringTrim(res + '').length > 0)) {
					return res;
				}
			}
		}
	} finally {
		updateUIHandler(event, BUBBLE_EVENT_TYPES.ELEMENT_DATA_CHANGE);
	}
	return bubble(event, BUBBLE_EVENT_TYPES.ELEMENT_DATA_CHANGE);
}


/**
 * Provides internal handling to the record selection event.
 * If a parent form is available and it extends the svyBase then this event will "bubble up" to the parent through the {@link onEventBubble} method.
 * It is recommended that extending forms do not override this method. Instead, they should override the dedicated {@link onRecordSelection} method.
 * 
 * @private
 * @param {JSEvent} event The event that triggered the action.
 *
 * @properties={typeid:24,uuid:"12647EBC-63BE-4361-A77F-C480D61D474F"}
 */
function onRecordSelectionHandler(event) {
    try {
        onRecordSelection(event);
    } finally {
        updateUIHandler(event, BUBBLE_EVENT_TYPES.RECORD_SELECT);
    }
    bubble(event, BUBBLE_EVENT_TYPES.RECORD_SELECT);
}

/**
 * Provides internal handling to the event fired when the form is shown.
 * If a parent form is available and it extends the svyBase then this event will "bubble up" to the parent through the {@link onEventBubble} method.
 * It is recommended that extending forms do not override this method. Instead, they should override the dedicated {@link onShow} method.
 *
 * @private 
 * @param {Boolean} firstShow True if the form is shown for the first time after load.
 * @param {JSEvent} event The event that triggered the action.
 *
 * @properties={typeid:24,uuid:"3F55B248-8B06-4D1B-B662-CAEF7EF09DE5"}
 */
function onShowHandler(firstShow, event) {
	onShow(firstShow, event);
    updateUIHandler(event, BUBBLE_EVENT_TYPES.FORM_SHOW);
    bubble(event, BUBBLE_EVENT_TYPES.FORM_SHOW);
}

/**
 * Provides internal handling to the event fired when an element on the form has gained focus.
 * If a parent form is available and it extends the svyBase then this event will "bubble up" to the parent through the {@link onEventBubble} method.
 * 
 * @private 
 * @param {JSEvent} event The event that triggered the action.
 *
 * @return {Boolean} Return false when the focus gained event of the element itself shouldn't be triggered.
 *
 * @properties={typeid:24,uuid:"435BD246-195F-468F-A231-91548DF1C0EC"}
 */
function onElementFocusGainedHandler(event) {
    return bubble(event, BUBBLE_EVENT_TYPES.ELEMENT_FOCUS_GAINED);
}

/**
 * Provides internal handling to the event fired when an element on the form has lost focus.
 * If a parent form is available and it extends the svyBase then this event will "bubble up" to the parent through the {@link onEventBubble} method.
 * 
 * @private
 * @param {JSEvent} event The event that triggered the action.
 *
 * @return {Boolean} Return false when the focus lost event of the element itself shouldn't be triggered.
 *
 *
 * @properties={typeid:24,uuid:"1025D295-9A86-4D6E-8F14-2A5BE7317CEB"}
 */
function onElementFocusLostHandler(event) {
    return bubble(event, BUBBLE_EVENT_TYPES.ELEMENT_FOCUS_LOST);
}

/**
 * Provides internal handling to the event fired when the form window is hiding.
 * If a parent form is available and it extends the svyBase then this event will "bubble up" to the parent through the {@link onEventBubble} method.
 * It is recommended that extending forms do not override this method. Instead, they should override the dedicated {@link onHide} method.
 * 
 * @private 
 * @param {JSEvent} event The event that triggered the action.
 *
 * @return {Boolean} True if the form can be hidden, false to block the action so the form will remain visible.
 *
 * @properties={typeid:24,uuid:"F2F39B1A-2DDC-4F8D-ACD4-20E8627AD397"}
 */
function onHideHandler(event) {
    if (onHide(event)) {
        return bubble(event, BUBBLE_EVENT_TYPES.FORM_HIDE);
    }
    return false;
}

/**
 * Provides internal handling to the event fired when the form is (re)loaded.
 * If a parent form is available and it extends the svyBase then this event will "bubble up" to the parent through the {@link onEventBubble} method.
 * It is recommended that extending forms do not override this method. Instead, they should override the dedicated {@link onLoad} method.
 * 
 * @private 
 * @param {JSEvent} event the event that triggered the action.
 *
 * @properties={typeid:24,uuid:"91BEB20C-902E-491D-820C-246EB85E8A51"}
 */
function onLoadHandler(event) {
    onLoad(event);
    bubble(event, BUBBLE_EVENT_TYPES.FORM_LOAD);
}

/**
 * Provides internal handling to the event fired when the user starts to edit a record on the form.
 * If a parent form is available and it extends the svyBase then this event will "bubble up" to the parent through the {@link onEventBubble} method.
 * 
 * @private 
 * @param {JSEvent} event The event that triggered the action.
 *
 * @return {Boolean} Return false if the user should not be able to edit the record.
 *
 *
 * @properties={typeid:24,uuid:"EBA00357-09D0-49EF-A92A-D54FD9E9A545"}
 */
function onRecordEditStartHandler(event) {
    updateUIHandler(event, BUBBLE_EVENT_TYPES.RECORD_EDIT_START);
    return bubble(event, BUBBLE_EVENT_TYPES.RECORD_EDIT_START);
}

/**
 * Provides internal handling to the event fired when the user stops editing a record on the form.
 * If a parent form is available and it extends the svyBase then this event will "bubble up" to the parent through the {@link onEventBubble} method.
 * 
 * @private 
 * @param {JSRecord} record The record being edited.
 * @param {JSEvent} event The event that triggered the action.
 *
 * @return {Boolean} Return false if the record fails to validate then the user cannot leave the record.
 *
 * @properties={typeid:24,uuid:"0B5A2FCA-ACF2-4E96-B378-A6CE926E02B7"}
 */
function onRecordEditStopHandler(record, event) {
    updateUIHandler(event, BUBBLE_EVENT_TYPES.RECORD_EDIT_STOP);
    return bubble(event, BUBBLE_EVENT_TYPES.RECORD_EDIT_STOP);
}

/**
 * Provides internal handling to the event fired when the form is resized.
 * If a parent form is available and it extends the svyBase then this event will "bubble up" to the parent through the {@link onEventBubble} method.
 * 
 * @private 
 * @param {JSEvent} event The event that triggered the action.
 *
 * @properties={typeid:24,uuid:"B8D10B13-AF0D-4068-80E4-D5E984C8986B"}
 */
function onResizeHandler(event) {
    updateUIHandler(event, BUBBLE_EVENT_TYPES.FORM_RESIZE);
    bubble(event, BUBBLE_EVENT_TYPES.FORM_RESIZE);
}

/**
 * Provides internal handling to the event fired when the form is about to be unloaded.
 * If a parent form is available and it extends the svyBase then this event will "bubble up" to the parent through the {@link onEventBubble} method.
 * It is recommended that extending forms do not override this method. Instead, they should override the dedicated {@link onUnload} method.
 * 
 * @private 
 * @param {JSEvent} event The event that triggered the action.
 *
 * @properties={typeid:24,uuid:"272A5E65-70D8-4779-BFE8-DBEB5CE0302B"}
 */
function onUnloadHandler(event) {
    onUnload(event);
    bubble(event, BUBBLE_EVENT_TYPES.FORM_UNLOAD);
}

/**
 * Propagates form events up to the form parent if a parent form is available and extends svyBase.
 * TODO Propagation is currently blocked by a non-svyBase form in between. This could be routed.
 * 
 * @private
 * @param {JSEvent} event The event which triggered the source action.
 * @param {String} bubbleEventType One of the BUBBLE_EVENT_TYPES enum values.
 * @return {Boolean} False if the parent blocked the event by returning false from its {@link onEventBubble} method.
 * 
 * @properties={typeid:24,uuid:"83976541-2B87-4AA1-8040-76D0D53EEAF4"}
 */
function bubble(event, bubbleEventType) {
    // skip event bubble handler if THIS form is same as source
    if (event.getFormName() != controller.getName()) {

        // bubble handler / check if blocked
        if (onEventBubble(event, bubbleEventType) === false) {
            return false;
        }
    }

    // bubble to parent form
    var parentName = scopes.svyUI.getParentFormName(this);
    if (parentName) {
        var parent = forms[parentName];
        if (parent && scopes.svyUI.isJSFormInstanceOf(parent, 'svyBase')) {
            /** @type {{bubble: function(JSEvent, String)}} */
            var p = parent; //using this to suppress the "...is private" warning even though we are accessing a protected method
            return p.bubble(event, bubbleEventType);
        }
    }

    // outer-most form has been reached
    return true;
}

/**
 * The method will be called when child forms (extending svyBase) hosted by this form bubble their form events to this parent form.
 * Extending forms can override this method to provide any necessary custom handling.
 * By default, this method just returns true.
 * 
 * @protected
 * @param {JSEvent} event The original source event which has triggered the action in the child form.
 * @param {String} bubbleEventType oOe of the {@link BUBBLE_EVENT_TYPES) enumeration values describing the type of the original source form event.
 * @return {Boolean} Return true if the form event can proceed or false if the form event should be blocked.
 *
 * @properties={typeid:24,uuid:"D8FB0D9B-0DCD-4701-9A1C-79D424D62E8A"}
 */
function onEventBubble(event, bubbleEventType) {
    return true;
}

/**
 * Called when the current record is changed with a different one (through selection, loading, etc.)
 * Intended for usage by extending forms which need to react in some way to the data context change.
 * 
 * @protected
 * @param {JSEvent} event the event that triggered the action.
 * 
 * @properties={typeid:24,uuid:"4152ECA4-2A42-43DF-B3EF-6202E65A164D"}
 */
function onRecordSelection(event) {
    //intentionally left blank - extending form should override if they need to respond to data context changes (for example when the form's foundset is replaced from outside and this change needs to be propagated to any other forms hosted by this form)
}

/**
 * Called as part of the custom {@link onLoad) event handling.
 * Intended for usage by extending forms which can override it as needed to perform any form initialization tasks when the form is (re)loaded.
 * 
 * @protected
 * @param {JSEvent} event the event that triggered the action.
 * 
 * @properties={typeid:24,uuid:"D72EC127-A1AC-46CF-ACEF-895277876B68"}
 */
function onLoad(event) {
    //intentionally left blank - extending form should override if needed
}

/**
 * Called as part of the custom {@link onUnload) event handling.
 * Intended for usage by extending forms which can override it as needed to perform any form uninitialization tasks when the form is unloaded.
 * 
 * @protected
 * 
 * @param {JSEvent} event The event that triggered the action.
 * 
 * @properties={typeid:24,uuid:"E11F51C3-98DE-4E1E-857E-D0698A422F1C"}
 */
function onUnload(event) {
    //intentionally left blank - extending form should override if needed
}

/**
 * Called as part of the custom {@link onShow) event handling.
 * Intended for usage by extending forms which can override it as needed to perform any tasks when the form is dispayed.
 * 
 * @protected
 * @param {Boolean} firstShow True if the form is shown for the first time after load.
 * @param {JSEvent} event The event that triggered the action.
 * 
 * @properties={typeid:24,uuid:"6A5C9CDE-2D6D-482E-90E6-5FE74D3B977F"}
 */
function onShow(firstShow, event) {
    //intentionally left blank - extending form should override if needed
}

/**
 * Called as part of the custom {@link onHide} event handling.
 * Intended for usage by extending forms which can override it as needed to perform any tasks when the form hiding.
 * 
 * @protected
 * 
 * @param {JSEvent} [event] the event that triggered the action
 * 
 * @return {Boolean} Return true if the form can be hidden, otherwise false.
 * 
 * @properties={typeid:24,uuid:"3187DC11-97F2-4A21-95EC-4695B35FE306"}
 */
function onHide(event) {
    //extending form should override if needed
    return true;
}

/**
 * Called when the UI is being updated as part of the custom updateUI method.
 * Intended for usage by extending forms which can override it as needed to perform any tasks when the form user interface is being updated.
 * 
 * @protected
 * 
 * @param {JSEvent} [event] the event that triggered the action
 * @param {String} [eventType] the event type as one of the BUBBLE_EVENT_TYPES
 * 
 * @properties={typeid:24,uuid:"6B87BF9E-941A-4A5E-9D90-BADB651E8816"}
 */
function updateUI(event, eventType) {
    //intentionally left blank - extending form should override if needed
}

/**
 * Called as part of the custom {@link onElementDataChange} event handling.
 * Intended for usage by extending forms which can override it as needed to perform any tasks when the data in a field on the form is changed.
 *
 * @protected
 * @param oldValue old value The old(previous) value.
 * @param newValue new value The new(current) value.
 * @param {JSEvent} event The event that triggered the action.
 * @param {String} dataProviderName The name of the dataprovide whose value is changed (when found).
 *
 * @return {Boolean|String} Return false if the value should not be accepted. In NGClient you can return also a (i18n) string, instead of false, which will be shown as a tooltip.
 *
 * @properties={typeid:24,uuid:"59067D6F-BFFD-4135-9BD0-0D088B1324E4"}
 */
function onElementDataChange(dataProviderName, oldValue, newValue, event) {
    return true;
}

/**
 * Get the used datasource.
 * 
 * @public 
 * 
 * @return {String} the datasource
 * 
 * @properties={typeid:24,uuid:"3C2A7262-CDEA-443E-8412-F499D9FE63CC"}
 */
function getDataSource() {
	return controller.getDataSource();
}

/**
 * Get the name of this form.
 * 
 * @public 
 * 
 * @return {String} the form name
 * 
 * @properties={typeid:24,uuid:"5550E741-E295-4FC6-88CD-3EDE9C5BF3D8"}
 */
function getName() {
	return controller.getName();
}

/**
 * Loads a foundset, record, PK Dataset, Number, UUID or UUID String primary key. 
 * Tries to preserve selection based on primary key, otherwise first record is selected.
 * 
 * To set a reference to a specific foundset in this form, use {@link setFoundSet}. 
 * Passing a foundset in this method, will only result in the same records being present, 
 * but not in a shared foundset. When a related foundset is passed into this method for
 * example, the relation will be lost, only the records will be "copied" over.
 * 
 * @param {JSFoundSet|JSRecord|JSDataSet|QBSelect|Number|UUID|String} foundsetOrRecordToLoad
 * 
 * @public 
 * 
 * @return {Boolean} true if successful
 *
 * @properties={typeid:24,uuid:"13E19DF7-0285-43C4-AB65-E66902743482"}
 */
function loadRecords(foundsetOrRecordToLoad) {
	if (foundsetOrRecordToLoad instanceof String || foundsetOrRecordToLoad instanceof UUID) {
		/** @type {UUID} */
		var uuid = foundsetOrRecordToLoad;
		if (foundsetOrRecordToLoad instanceof String) {
			/** @type {String} */
			var uuidString = foundsetOrRecordToLoad;
			uuid = application.getUUID(uuidString);
		}
		if (uuid) {
			return controller.loadRecords(uuid);
		} else {
			return false;
		}
	} else if (foundsetOrRecordToLoad instanceof JSRecord) {
		/** @type {JSRecord} */
		var jsRecord = foundsetOrRecordToLoad;
		var ds = databaseManager.createEmptyDataSet(0, databaseManager.getTable(jsRecord).getColumnNames());
		ds.addRow(jsRecord.getPKs());
		return controller.loadRecords(ds);
	} else if (foundsetOrRecordToLoad instanceof JSFoundSet) {
		/** @type {JSFoundSet} */
		var jsFoundset = foundsetOrRecordToLoad;
		return foundset.loadRecords(jsFoundset);
	} else if (foundsetOrRecordToLoad instanceof Number) {
		/** @type {Number} */
		var numberPk = foundsetOrRecordToLoad;
		return controller.loadRecords(numberPk);
	} else if (foundsetOrRecordToLoad instanceof QBSelect) {
		/** @type {QBSelect} */
		var qbSelect = foundsetOrRecordToLoad;
		return foundset.loadRecords(qbSelect);
	} else if (foundsetOrRecordToLoad == null) {
		return controller.loadRecords(null);
	} else {
		return false;
	}
}

/**
 * Sets this form's foundset to the one provided, having this form share the 
 * passed foundest. Use {@link loadRecords} if this form should only show
 * the same records, but not share the foundset
 * 
 * @param {JSFoundSet} foundsetToSet
 * 
 * @public 
 * 
 * @return {Boolean} true if successful
 *
 * @properties={typeid:24,uuid:"1FD26A39-DDE5-41B7-9C09-9B20A9626282"}
 */
function setFoundSet(foundsetToSet) {
	return controller.loadRecords(foundsetToSet);
}

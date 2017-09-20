/**
 * Creates new FormAction instance.
 *
 * @classdesc This class encapsulates form actions which can be invoked directly by the user or programmatically. The abstraction allows different UI presentations to be implemented for the form actions (e.g. buttons, links, menu items, etc.) 
 * 
 * @public
 * @param {String} name The name of the form action. Must be unique within the form context.
 * @param {RuntimeForm} targetForm The form where the action will be invoked.
 * @param {String|Function} handler The actual function (or function name) which will be executed when the action is invoked. This must be a Servoy function (anonymous callbacks are not supported). The FormAction will provide as input argument to the handler function an instance of the {@link ActionEvent}. The signature of the handler function should be: function(ActionEvent). 
 * @param {Boolean} [isToggle] Optional argument indicating if the action supports toggling true/false of its [selected]{@link FormAction#isSelected} property with each action invocation.
 * @constructor
 *
 * @properties={typeid:24,uuid:"6D033A0C-9772-4E19-8376-EE5C93CBFFEE"}
 */
function FormAction(name, targetForm, handler, isToggle) {

    /**
     * Enumeration for the available action property names.
     * @public
     * @enum
     */
    this.PROPERTIES = {
        TEXT: 'text',
        TOOLTIP_TEXT: 'tooltipText',
        ENABLED: 'enabled',
        VISIBLE: 'visible',
        SELECTED: 'selected'
    };

    /**
     * Internal storage for the action property values.
     * @protected
     * @ignore
     */
    this.properties = { };

    /**
     * Used internally for the property change notifications.
     * @protected
     * @ignore
     * @type {scopes.svyPropertyChange.PropertyChangeSupport}
     */
    this.propertyChangeSupport = new scopes.svyPropertyChange.PropertyChangeSupport(this);

    /**
     * Internal flag indicating if the action supports toggling of its [selected]{@link FormAction#isSelected} property.
     * @protected
     * @ignore
     * @type {Boolean}
     */
    this.isToggle = (isToggle === true);

    /**
     * Gets the name of the action.
     * @public
     * @return {String} The name of the action supplied to its constructor.
     */
    this.getActionName = function() {
        return name;
    }

    /**
     * Gets the action target form.
     * @public
     * @return {RuntimeForm} The form where the action will be invoked.
     */
    this.getTarget = function() {
        return targetForm;
    }

    /**
     * Indicates if the [selected]{@link FormAction#isSelected} property of the action can be toggled true/false on each action invocation.
     * @public
     * @return {Boolean} True if the action supports toggling of its [selected]{@link FormAction#isSelected} property. 
     */
    this.isToggleAction = function() {
        return this.isToggle;
    }

    /**
     * Gets the Servoy qualified method name for the function which handles the call when the action is invoked.
     * @public
     * @return {String} The Servoy qualified method name which handles the form action - for example: "forms.someForm.someMethod". 
     */
    this.getHandler = function() {
        if (handler instanceof Function) {
            /**
             * @type {Function} 
             * @ignore  
             */
            var method = handler;
            return scopes.svySystem.convertServoyMethodToQualifiedName(method);
        }        
        var methodName = ['forms', targetForm.controller.getName(), handler].join('.');
        return methodName
    }

    /**
     * Sets the form action text. The text is usually used when visualizing the form action on the UI.
     * Changing the action text will trigger a property change notification.
     * @public
     * @param {String} text The text to use for the form action. Can be an i18n string.
     * @return {FormAction} This FormAction for call-chaining support.
     */
    this.setText = function(text) {
        this.putProperty(this.PROPERTIES.TEXT, text);
        return this;
    }

    /**
     * Gets the form action text. The text is usually used when visualizing the form action on the UI.
     * @public
     * @return {String} The form action text.
     */
    this.getText = function() {
        /**
         * @type {String} 
         * @ignore  
         */
        var value = this.getProperty(this.PROPERTIES.TEXT);
        return value;
    }

    /**
     * Sets the form action tooltip text. The tooltip text is usually used when visualizing the form action on the UI.
     * Changing the action tooltip text will trigger a property change notification.
     * @public
     * @param {String} tooltipText The tooltip text to use for the form action. Can be an i18n string.
     * @return {FormAction} This FormAction for call-chaining support.
     */
    this.setTooltipText = function(tooltipText) {
        this.putProperty(this.PROPERTIES.TOOLTIP_TEXT, tooltipText);
        return this;
    }

    /**
     * Gets the form action tooltip text. The tooltip text is usually used when visualizing the form action on the UI.
     * @public
     * @return {String} The form action tooltip text.
     */
    this.getTooltipText = function() {
        /**
         * @type {String}
         * @ignore 
         */
        var value = this.getProperty(this.PROPERTIES.TOOLTIP_TEXT);
        return value;
    }

    /**
     * Set the enabled property of the from action. If the enabled property is false then when the action is invoked it will not call the handler function. 
     * Changing the action enabled property value will trigger a property change notification.
     * @public
     * @param {Boolean} enabled The enabled value to use.
     * @return {FormAction} This FormAction for call-chaining support.
     */
    this.setEnabled = function(enabled) {
        this.putProperty(this.PROPERTIES.ENABLED, enabled);
        return this;
    }

    /**
     * Gets the enabled property of the form action.
     * @public
     * @return {Boolean} True if the action is enabled and can be executed, otherwise false.
     */
    this.isEnabled = function() {
        /** 
         * @type {Boolean}
         * @ignore 
         */
        var value = (this.getProperty(this.PROPERTIES.ENABLED) === true);
        return value;
    }

    /**
     * Set the visibility of the from action. Note that actions which are not visible can be executed - to control if the action can be executed or not use the {@link FormAction#setEnabled} method. 
     * Changing the action visible property value will trigger a property change notification.
     * @public
     * @param {Boolean} visible
     * @return {FormAction} This FormAction for call-chaining support.
     */
    this.setVisible = function(visible) {
        this.putProperty(this.PROPERTIES.VISIBLE, visible);
        return this;
    }

    /**
     * Gets the visible property of the form action.
     * @public
     * @return {Boolean} True if the action is set as visible, otherwise false.
     */
    this.isVisible = function() {
        /**
         * @type {Boolean}
         * @ignore 
         */
        var value = (this.getProperty(this.PROPERTIES.VISIBLE) === true);
        return value;
    }

    /**
     * Set the selected property of the from action. Note that if the form action is configured as a [toggle action]{@link FormAction#isToggleAction} then the selected property will be toggled true/false with each action [invocation]{@link FormAction#invoke}.
     * Changing the action selected property value will trigger a property change notification.
     * @public
     * @param {Boolean} selected
     * @return {FormAction}
     */
    this.setSelected = function(selected) {
        this.putProperty(this.PROPERTIES.SELECTED, selected);
        return this;
    }

    /**
     * Gets the selected property of the form action.
     * @public
     * @return {Boolean} True or false based on the current form action selected property.
     */
    this.isSelected = function() {
        /**
         * @type {Boolean}
         * @ignore 
         */
        var value = (this.getProperty(this.PROPERTIES.SELECTED) === true);
        return value;
    }

    /**
     * Executes the form action by calling the [handler]{@link FormAction#getHandler} function if the 
     * action is currently [enabled]{@link FormAction#isEnabled}. 
     * Optionally will pass the provided sourceEvent to the handler function. 
     * @public
     * @param {JSEvent} [sourceEvent] Optional JSEvent which will be passed to the handler function "wrapped" in an {@link ActionEvent}.
     * @return {Boolean} True if the action is enabled and the handler function was called, otherwise false.
     * @throws {Error} Any errors thrown by the handler function will be propagated to the caller of the invoke method.
     */
    this.invoke = function(sourceEvent) {
        if (!this.isEnabled()) {
            return false;
        }

        /**
         * @type {Function}
         * @ignore 
         */
        var event = new ActionEvent(name, targetForm, sourceEvent);
        try {
            scopes.svySystem.callMethod(this.getHandler(), event);
            if (this.isToggle) {
                this.setSelected(!this.isSelected());
            }
            return true;
        } catch (e) {
            // TODO log
            throw e;
        }
    }
    
    /**
     * Method for setting generic properties to the FormAction. 
     * Will fire property change notifications if the property value is different from the current one.
     * Can use this method to set the standard properties text, tooltipText, selected, enabled and visible [properties]{@link FormAction#PROPERTIES}. 
     * @public
     * @param {String} propertyName The property name.
     * @param {Object} value The property value to use. 
     * @return {Boolean} True if the old property value was different from the specified new property value.
     */
    this.putProperty = function(propertyName, value) {
        var oldValue = this.getProperty(propertyName);
        this.properties[propertyName] = value;
        if (oldValue != value) {
            this.propertyChangeSupport.fireEvent(propertyName, oldValue, value);
            return true;
        }
        return false;
    }

    /**
     * Method for getting the values of the generic properties of the FormAction set by the {@link FormAction#putProperty} method.
     * @public
     * @param {String} propertyName The name of the property to get.
     * @return {Object} The property value or undefined if a property with the specified name is not set by the {@link FormAction#putProperty} method.
     */
    this.getProperty = function(propertyName) {
        return this.properties[propertyName];
    }

    /**
     * Method to register a property change listener function which will be called when a FormAction property value is changed.
     * Note that any registered property change listeners must be unregistered/removed using the {@link FormAction#removePropertyChangeListener} method.
     * @public
     * @param {Function} listener The function which should be called when a property value is changed. The callback function will receive an input argument object with the following properties: {propertyName: String, oldValue, newValue, source}
     * @param {String} [propertyName] Optional property name if the listener function should be called only when the specified property is changed. If not specified then the listener function will be called for any property change.
     */
    this.addPropertyChangeListener = function(listener, propertyName) {
        this.propertyChangeSupport.addListener(listener, propertyName)
    }

    /**
     * Method to unregister/remove a property change listener function from the property change notifications.
     * Usually called when the [target form]{@link FormAction#getTarget} is being unloaded.
     * Property change listeners are registered using the {@link FormAction#addPropertyChangeListener} method.
     * @public
     * @param {Function} listener The property change listener function which was registered by {@link FormAction#addPropertyChangeListener}.
     * @param {String} [propertyName] Optional property name used when the listener function was registered by {@link FormAction#addPropertyChangeListener}.
     */
    this.removePropertyChangeListener = function(listener, propertyName) {
        this.propertyChangeSupport.removeListener(listener, propertyName);
    }
    
    this.putProperty(this.PROPERTIES.ENABLED, false);
    this.putProperty(this.PROPERTIES.SELECTED, false);
    this.putProperty(this.PROPERTIES.VISIBLE, false);
    this.putProperty(this.PROPERTIES.TEXT, name);
    this.putProperty(this.PROPERTIES.TOOLTIP_TEXT, null);
}

/**
 * Creates a new instance of the ActionEvent class.
 * 
 * @classdesc This class is used as the input argument for the {@link FormAction} [handler]{@link FormAction#getHandler} functions. 
 * 
 * @public
 * @constructor
 * @param {String} actionName The name of the FormAction which has raised the event.
 * @param {RuntimeForm} source The source target form of the FormAction.
 * @param {JSEvent} [sourceEvent] Optional JSEvent which was provided by the context that in has invoked the FormAction.
 * @extends {scopes.svyEventManager.Event}
 * @properties={typeid:24,uuid:"B101E684-D0BD-4B72-9773-424AF63DF939"}
 */
function ActionEvent(actionName, source, sourceEvent) {

    //	call super
    scopes.svyEventManager.Event.call(this, 'action-event', source, { command: actionName });

    /**
     * Gets the FormAction name for this Action Event.
     * @public
     * @return {String} The name of the {@link FormAction}.
     */
    this.getActionName = function() {
        return actionName;
    }

    /**
     * Gets the source JSEvent, if provided to the constructor of this ActionEvent.
     * @public
     * @return {JSEvent} The source JSEvent, if available.
     */
    this.getSourceEvent = function() {
        return sourceEvent;
    }
}

/**
 * Self-invoking initialization function which is automatically executed when the scope is loaded.
 * Using it here to setup the class inheritance for the ActionEvent class.
 *  
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"BCEBE1B1-97D2-40E3-BA62-F24784CC6D6A",variableType:-4}
 */
var init = function() {
    ActionEvent.prototype = Object.create(scopes.svyEventManager.Event.prototype);
    ActionEvent.prototype.constructor = scopes.svyEventManager.Event;
}();
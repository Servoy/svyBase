/**
 * TODO add support for top-level scopes
 *
 *
 * @public
 * @param {String} name
 * @param {RuntimeForm} targetForm
 * @param {String|Function} handler
 * @param {Boolean} [isToggle]
 * @constructor
 *
 * @properties={typeid:24,uuid:"6D033A0C-9772-4E19-8376-EE5C93CBFFEE"}
 */
function FormAction(name, targetForm, handler, isToggle) {

    /**
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
     * @protected
     */
    this.properties = { };

    /**
     * TODO prop change support should be on action itself
     * @protected
     * @type {scopes.svyPropertyChange.PropertyChangeSupport}
     */
    this.propertyChangeSupport = new scopes.svyPropertyChange.PropertyChangeSupport(this);

    /**
     * @protected
     * @type {Boolean}
     */
    this.isToggle = isToggle === true;

    /**
     * @public
     * @return {String}
     */
    this.getActionName = function() {
        return name;
    }

    /**
     * @public
     * @return {RuntimeForm}
     */
    this.getTarget = function() {
        return targetForm;
    }

    /**
     * @public
     * @return {Boolean}
     */
    this.isToggleAction = function() {
        return this.isToggle;
    }

    /**
     * @public
     * @return {String}
     */
    this.getHandler = function() {
        if (handler instanceof Function) {
            /** @type {Function} */
            var method = handler;
            return scopes.svySystem.convertServoyMethodToQualifiedName(method);
        }
        /** @type {String} */
        var methodName = ['forms', targetForm.controller.getName(), handler].join('.');
        return methodName
    }

    /**
     * @public
     * @param {String} text
     * @return {FormAction}
     */
    this.setText = function(text) {
        this.putProperty(this.PROPERTIES.TEXT, text);
        return this;
    }

    /**
     * @public
     * @return {String}
     */
    this.getText = function() {
        /** @type {String} */
        var value = this.getProperty(this.PROPERTIES.TEXT);
        return value;
    }

    /**
     * @public
     * @param {String} tooltipText
     * @return {FormAction}
     */
    this.setTooltipText = function(tooltipText) {
        this.putProperty(this.PROPERTIES.TOOLTIP_TEXT, tooltipText);
        return this;
    }

    /**
     * @public
     * @return {String}
     */
    this.getTooltipText = function() {
        /** @type {String} */
        var value = this.getProperty(this.PROPERTIES.TOOLTIP_TEXT);
        return value;
    }

    /**
     * @public
     * @param {Boolean} enabled
     * @return {FormAction}
     */
    this.setEnabled = function(enabled) {
        this.putProperty(this.PROPERTIES.ENABLED, enabled);
        return this;
    }

    /**
     * @public
     * @return {Boolean}
     */
    this.isEnabled = function() {
        /** @type {Boolean} */
        var value = this.getProperty(this.PROPERTIES.ENABLED);
        return value;
    }

    /**
     * @public
     * @param {Boolean} visible
     * @return {FormAction}
     */
    this.setVisible = function(visible) {
        this.putProperty(this.PROPERTIES.VISIBLE, visible);
        return this;
    }

    /**
     * @public
     * @return {Boolean}
     */
    this.isVisible = function() {
        /** @type {Boolean} */
        var value = this.getProperty(this.PROPERTIES.VISIBLE);
        return value;
    }

    /**
     * @public
     * @param {Boolean} selected
     * @return {FormAction}
     */
    this.setSelected = function(selected) {
        this.putProperty(this.PROPERTIES.SELECTED, selected);
        return this;
    }

    /**
     * @public
     * @return {Boolean}
     */
    this.isSelected = function() {
        /** @type {Boolean} */
        var value = this.getProperty(this.PROPERTIES.SELECTED);
        return value;
    }

    /**
     * @public
     * @param {JSEvent} [sourceEvent]
     * @return {Boolean}
     */
    this.invoke = function(sourceEvent) {
        if (!this.isEnabled()) {
            return false;
        }

        /** @type {Function} */
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
     * @public
     * @param {String} propertyName
     * @param {Object} value
     * @return {Boolean}
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
     * @public
     * @param {String} propertyName
     * @return {Object}
     */
    this.getProperty = function(propertyName) {
        return this.properties[propertyName];
    }

    /**
     * @public
     * @param {Function} listener
     * @param {String} [propertyName]
     */
    this.addPropertyChangeListener = function(listener, propertyName) {
        this.propertyChangeSupport.addListener(listener, propertyName)
    }

    /**
     * @public
     * @param {Function} listener
     * @param {String} [propertyName]
     */
    this.removePropertyChangeListener = function(listener, propertyName) {
        this.propertyChangeSupport.removeListener(listener, propertyName);
    }
}

/**
 * @public
 * @constructor
 * @param command
 * @param source
 * @param {JSEvent} [sourceEvent]
 * @extends {scopes.svyEventManager.Event}
 * @properties={typeid:24,uuid:"B101E684-D0BD-4B72-9773-424AF63DF939"}
 */
function ActionEvent(command, source, sourceEvent) {

    //	call super
    scopes.svyEventManager.Event.call(this, 'action-event', source, { command: command });

    /**
     * @public
     * @return {String}
     */
    this.getCommand = function() {
        return command;
    }

    /**
     * @public
     * @return {JSEvent}
     */
    this.getSourceEvent = function() {
        return sourceEvent;
    }
}

/**
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"BCEBE1B1-97D2-40E3-BA62-F24784CC6D6A",variableType:-4}
 */
var init = function() {
    ActionEvent.prototype = Object.create(scopes.svyEventManager.Event.prototype);
    ActionEvent.prototype.constructor = scopes.svyEventManager.Event;
}();
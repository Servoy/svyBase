/**
 * TODO add support for top-level scopes
 * 
 * 
 * @public 
 * @param {String} command
 * @param {RuntimeForm<svyBase>} target
 * @param {String|Function} handler
 * @param {Boolean} [isToggle]
 * @constructor 
 * 
 * @properties={typeid:24,uuid:"6D033A0C-9772-4E19-8376-EE5C93CBFFEE"}
 */
function FormAction(command, target, handler, isToggle){

	/**
	 * @public 
	 * @enum 
	 */
	this.PROPERTIES = {
		TEXT:'text',
		TOOLTIP_TEXT:'tooltipText',
		ENABLED:'enabled',
		SELECTED:'selected'
	};
	
	/**
	 * @protected 
	 */
	this.properties = new scopes.svyCollections.Properties();
	
	/**
	 * TODO prop change support should be on action itself
	 * @protected 
	 * @type {scopes.svyEventManager.PropertyChangeSupport}
	 */
	this.propertyChangeSupport = new scopes.svyEventManager.PropertyChangeSupport(this);
	
	/**
	 * @protected 
	 * @type {Boolean}
	 */
	this.isToggle = isToggle === true;
	
	
	/**
	 * @public 
	 * @return {String}
	 */
	this.getActionCommand = function(){
		return command;
	}
	
	/**
	 * @public 
	 * @return {RuntimeForm}
	 */
	this.getTarget = function(){
		return target;
	}
	
	/**
	 * @public 
	 * @return {Boolean}
	 */
	this.isToggleAction = function(){
		return this.isToggle;
	}
	
	/**
	 * @public 
	 * @return {String}
	 */
	this.getHandler = function(){
		if(handler instanceof Function){
			/** @type {Function} */
			var method = handler;
			return scopes.svySystem.convertServoyMethodToQualifiedName(method).split('.').pop()
		}
		/** @type {String} */
		var methodName = ['forms',target.controller.getName(),handler].join('.');
		return methodName
	}
	
	/**
	 * @public 
	 * @param {String} text
	 * @return {FormAction}
	 */
	this.setText = function(text){
		var oldValue = this.putProperty(this.PROPERTIES.TEXT,text);
		this.propertyChangeSupport.fireEvent(this.PROPERTIES.TEXT,oldValue,text);
		return this;
	}
	
	/**
	 * @public 
	 * @return {String}
	 */
	this.getText = function(){
		/** @type {String} */
		var value = this.getProperty(this.PROPERTIES.TEXT);
		return value;
	}
	
	/**
	 * @public 
	 * @param {String} tooltipText
	 * @return {FormAction}
	 */
	this.setTooltipText = function(tooltipText){
		var oldValue = this.putProperty(this.PROPERTIES.TOOLTIP_TEXT,tooltipText);
		this.propertyChangeSupport.fireEvent(this.PROPERTIES.TOOLTIP_TEXT,oldValue,tooltipText);
		return this;
	}
	
	/**
	 * @public 
	 * @return {String}
	 */
	this.getTooltipText = function(){
		/** @type {String} */
		var value = this.getProperty(this.PROPERTIES.TOOLTIP_TEXT);
		return value;
	}
	
	/**
	 * @public 
	 * @param {Boolean} enabled
	 * @return {FormAction}
	 */
	this.setEnabled = function(enabled){
		var oldValue = this.putProperty(this.PROPERTIES.ENABLED,enabled);
		this.propertyChangeSupport.fireEvent(this.PROPERTIES.ENABLED,oldValue,enabled);
		return this;
	}
	
	/**
	 * @public 
	 * @return {Boolean}
	 */
	this.isEnabled = function(){
		/** @type {Boolean} */
		var value = this.getProperty(this.PROPERTIES.ENABLED);
		return value;
	}
	
	/**
	 * @public 
	 * @param {Boolean} selected
	 * @return {FormAction}
	 */
	this.setSelected = function(selected){
		var oldValue = this.putProperty(this.PROPERTIES.SELECTED,selected);
		this.propertyChangeSupport.fireEvent(this.PROPERTIES.SELECTED,oldValue,selected);
		return this;
	}
	
	/**
	 * @public 
	 * @return {Boolean}
	 */
	this.isSelected = function(){
		/** @type {Boolean} */
		var value = this.getProperty(this.PROPERTIES.SELECTED);
		return value;
	}
	
	
	/**
	 * @public 
	 * @return {Boolean}
	 */
	this.invoke = function(){
		if(!this.isEnabled()){
			return false;
		}
		
		/** @type {Function} */
		var event = new ActionEvent(command,target);
		try{
			scopes.svySystem.callMethod(this.getHandler(),event);
			if(this.isToggle){
				this.setSelected(!this.isSelected());
			}
			return true
		}catch(e){
			// TODO log
		}

		return false;
	}
	/**
	 * @public 
	 * @param {String} propertyName
	 * @param {Object} value
	 * @return {Boolean}
	 */
	this.putProperty = function(propertyName, value){
		var oldValue = this.properties.put(propertyName,value);
		this.propertyChangeSupport.fireEvent(propertyName,oldValue,value);
		return oldValue != value;
	}
	
	/**
	 * @public 
	 * @param {String} propertyName
	 * @return {Object}
	 */
	this.getProperty = function(propertyName){
		return this.properties.get(propertyName);
	}
	
	/**
	 * @public 
	 * @return {scopes.svyCollections.Properties}
	 */
	this.getProperties = function(){
		return this.properties.clone();
	}
	
	/**
	 * @public 
	 * @param {scopes.svyEventManager.PropertyChangeListener} listener
	 * @param {String} [propertyName]
	 */
	this.addPropertyChangeListener = function(listener,propertyName){
		this.propertyChangeSupport.addListener(listener,propertyName)
	}
	
	/**
	 * @public 
	 * @param {scopes.svyEventManager.PropertyChangeListener} listener
	 * @param {String} [propertyName]
	 */
	this.removePropertyChangeListener = function(listener,propertyName){
		this.propertyChangeSupport.removeListener(listener,propertyName);
	}
}

/**
 * @public 
 * @param command
 * @param source
 * @constructor 
 * @extends {scopes.svyEventManager.Event}
 * @properties={typeid:24,uuid:"B101E684-D0BD-4B72-9773-424AF63DF939"}
 */
function ActionEvent(command, source){
	
	//	call super
	scopes.svyEventManager.Event.call(this,'action-event',source, {command:command});
	
	/**
	 * @public 
	 * @return {String}
	 */
	this.getCommand = function(){
		return command;
	}
}

/**
 * @private 
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"BCEBE1B1-97D2-40E3-BA62-F24784CC6D6A",variableType:-4}
 */
var init = function(){
	ActionEvent.prototype = Object.create(scopes.svyEventManager.Event.prototype);
	ActionEvent.constructor = scopes.svyEventManager.Event;
}();
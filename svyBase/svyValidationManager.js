/**
 * @public 
 * @enum 
 * @properties={typeid:35,uuid:"599E5630-3C48-4DE2-B300-F03653754BEB",variableType:-4}
 */
var VALIDATION_LEVEL = {
	INFO:'info',
	WARN:'warn',
	ERROR:'error'
}

/**
 * @public 
 * @param {String|JSRecord|JSFoundSet|RuntimeForm} dataSource
 * @return {Array<RuntimeForm<AbstractValidationProvider>>}
 * @properties={typeid:24,uuid:"C38387AE-6E94-4077-830C-5175D7ECE737"}
 */
function getValidationProviders(dataSource){
	
	var providersForDataSource = [];
	var providers = scopes.svyUI.getRuntimeFormInstances(forms.AbstractValidationProvider);
	for(var i in providers){
		/** @type {RuntimeForm<AbstractValidationProvider>} */
		var provider = providers[i];
		if(provider.isDataSourceSupported(scopes.svyDataUtils.getDataSource(dataSource))){
			providersForDataSource.push(provider);
		}
	}
	return providersForDataSource;
}

/**
 * @public 
 * @param {JSRecord} record
 * @return {Array<ValidationMarker>}
 * @properties={typeid:24,uuid:"7364F9BF-D861-4F01-B553-6E3DAFD26555"}
 */
function validate(record){
	var markers = [];
	var providers = getValidationProviders(record);
	for(var i in providers){
		var provider = providers[i];
		markers = markers.concat(provider.validate(record));
	}
	return markers;
}

/**
 * @public 
 * @param {JSRecord} record
 * @param {String} message
 * @param {String} [level]
 * @param {String} [dataProvider]
 * @constructor 
 * @properties={typeid:24,uuid:"24E0FAA7-5ADF-40BB-9F60-213373546243"}
 */
function ValidationMarker(record, message, level, dataProvider){
	
	/**
	 * @public 
	 * @return {JSRecord}
	 */
	this.getRecord = function(){
		return record;
	}
	
	/**
	 * @public 
	 * @return {String}
	 */
	this.getMessage = function(){
		return message;
	}
	
	/**
	 * @public 
	 * @return {String}
	 */
	this.getDataSource = function(){
		return !record ? null : record.getDataSource();
	}
	
	/**
	 * @public 
	 * @return {String}
	 */
	this.getLevel = function(){
		return !level ? VALIDATION_LEVEL.ERROR : level;
	}
	
	/**
	 * @public 
	 * @return {String}
	 */
	this.getDataProvider = function(){
		return dataProvider;
	}
}

/**
 * EXPERIMENTAL
 * @public 
 * @constructor 
 * @properties={typeid:24,uuid:"C09A3F34-FFD4-4C2B-BBA8-D00D82A69FF3"}
 */
function ValidationEvent(){
	
}
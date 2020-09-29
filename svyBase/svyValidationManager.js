/**
 * Enumeration for the available [levels]{@link ValidationMarker#getLevel} of the {@link ValidationMarker}.
 * @public
 * @enum
 * @properties={typeid:35,uuid:"599E5630-3C48-4DE2-B300-F03653754BEB",variableType:-4}
 */
var VALIDATION_LEVEL = {
	/**
	 * Information validation level.
	 */
	INFO: 'info',
	/**
	 * Warning validation level.
	 */
	WARN: 'warn',
	/**
	 * Error validation level.
	 */
	ERROR: 'error'
}

/**
 * @private 
 * @properties={typeid:35,uuid:"0B3CE228-8832-4869-A6EE-FAD504892C17",variableType:-4}
 */
var validationProvidersMap = {};

/**
 * Gets a list with the available validation providers for the specified dataSource.
 * The validation providers must extend the base svyAbstractValidationProvider class.
 * @public
 * @param {String|JSRecord|JSFoundSet|RuntimeForm} dataSource The dataSource to check.
 * @return {Array<RuntimeForm<svyAbstractValidationProvider>>} The list of available validation providers or an empty array if no validation providers are available for the specified dataSource.
 * @properties={typeid:24,uuid:"C38387AE-6E94-4077-830C-5175D7ECE737"}
 */
function getValidationProviders(dataSource) {
	
	var providersForDataSource = [];
	var source = getDataSource(dataSource)

	// check if validation providers are already cached
	if (validationProvidersMap[source]) {
		for (var j = 0; j < validationProvidersMap[source].length; j++) {
			var provider = forms[validationProvidersMap[source][j]];
			providersForDataSource.push(provider);
		}
		return providersForDataSource;
	} else {
		// init the cache
		validationProvidersMap[source] = [];
	}
	
	var providers = scopes.svyUI.getJSFormInstances(forms.svyAbstractValidationProvider);
	for (var i in providers) {
		/** @type {RuntimeForm<svyAbstractValidationProvider>} */
		//TODO use scopes.svyDataUtils.getDataSource when it is available
		//if(provider.isDataSourceSupported(scopes.svyDataUtils.getDataSource(dataSource))){
		
		// DO NOT USE IS DATASOURCE SUPPORTED ANYMORE. WILL LOAD TOO MANY FORMS IN MEMORY AND FORCE UNLOADS
//		var provider = forms[providers[i].name];
//		if (provider.isDataSourceSupported(getDataSource(dataSource))) {
//			providersForDataSource.push(provider);
//		}
		
		var jsform = providers[i];
		if (jsform.dataSource && jsform.dataSource === source) {
			var provider = forms[jsform.name];
			providersForDataSource.push(provider);
			// store form name in cache
			validationProvidersMap[source].push(jsform.name)
		}
	}
	return providersForDataSource;
}

/**
 * TODO use scopes.svyDataUtils.getDataSource when it is available
 * @private
 * @param {String|JSRecord|JSFoundSet|RuntimeForm} dataSource
 * @return {String}
 * @properties={typeid:24,uuid:"9797B720-FA33-4BE4-B94D-5E0E8AAE39D9"}
 */
function getDataSource(dataSource) {
	if ( (dataSource instanceof JSRecord) || (dataSource instanceof JSFoundSet)) {
		return dataSource.getDataSource();
	} else if (dataSource instanceof RuntimeForm) {
		return dataSource.controller.getDataSource();
	}
	/** @type {String} */
	var s = dataSource;
	return s;
}

/**
 * This method validates if the specified record can be saved in the database by combining validation information from all available validation providers for the record's dataSource.
 * Note that the result list may contain not only validation errors but validation markers with information and/or warning levels as well. Use the {@link ValidationMarker#getLevel} to determine the level of the individual validation markers in the result.
 * @public
 * @param {JSRecord} record The record to validate.
 * @return {Array<ValidationMarker>} A list of resulting [validation markers]{@link ValidationMarker} or an empty array if no validation results are available.
 * @properties={typeid:24,uuid:"7364F9BF-D861-4F01-B553-6E3DAFD26555"}
 */
function validate(record) {
	var markers = [];
	var providers = getValidationProviders(record);
	for (var i in providers) {
		var provider = providers[i];
		markers = markers.concat(provider.validate(record));
	}
	return markers;
}

/**
 * This method validates if the specified record can be deleted from the database by combining validation information from all available validation providers for the record's dataSource.
 * Note that the result list may contain not only validation errors but validation markers with information and/or warning levels as well. Use the {@link ValidationMarker#getLevel} to determine the level of the individual validation markers in the result.
 * @public
 * @param {JSRecord} record The record to validate.
 * @return {Array<ValidationMarker>} A list of resulting [validation markers]{@link ValidationMarker} or an empty array if no validation results are available.
 * @properties={typeid:24,uuid:"E8BFC384-ADDA-4AA1-837A-35596662F2E4"}
 */
function canDelete(record) {
	var markers = [];
	var providers = getValidationProviders(record);
	for (var i in providers) {
		var provider = providers[i];
		markers = markers.concat(provider.canDelete(record));
	}
	return markers;
}

/**
 * Creates a new instance of the ValidationMarker class.
 * @classdesc This class encapsulates individual validation results.
 * @public
 * @constructor
 * @param {JSRecord} record The record for which the validation result applies.
 * @param {String} message The validation result message text.
 * @param {String} [level] Optional validation result level. If not specified will use {@link VALIDATION_LEVEL}.ERROR.
 * @param {String} [dataProvider] Optional dataProvider name for which the validation result applies. If provided this usually is a column name.
 * @properties={typeid:24,uuid:"24E0FAA7-5ADF-40BB-9F60-213373546243"}
 */
function ValidationMarker(record, message, level, dataProvider) {
	if (!message) {
		throw new Error('Message is not specified');
	}

	/**
	 * Gets the record for which the validation result applies.
	 * @public
	 * @return {JSRecord} The record associated with this ValidationMarker.
	 */
	this.getRecord = function() {
		return record;
	}

	/**
	 * Gets the validation result message text.
	 * @public
	 * @return {String} The validation result message.
	 */
	this.getMessage = function() {
		return message;
	}

	/**
	 * Gets the datasource of the validation result [record]{@link ValidationMarker#getRecord}.
	 * @public
	 * @return {String} The datasource of the record or null if a record is not available.
	 */
	this.getDataSource = function() {
		return !record ? null : record.getDataSource();
	}

	/**
	 * Gets the validation result level. This is one of the {@link VALIDATION_LEVEL} enumeration options.
	 * @public
	 * @return {String} The validation result level.
	 */
	this.getLevel = function() {
		return !level ? VALIDATION_LEVEL.ERROR : level;
	}

	/**
	 * Gets the dataProvider name associated with the validation result.
	 * @public
	 * @return {String} The dataProvider name, if available.
	 */
	this.getDataProvider = function() {
		return dataProvider ? dataProvider : null;
	}
}

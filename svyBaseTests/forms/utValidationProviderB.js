/**
 * @private 
 * @type {Array<scopes.svyValidationManager.ValidationMarker>}
 * @properties={typeid:35,uuid:"3DEF4222-5ABF-44EA-B973-B4C16F076DE7",variableType:-4}
 */
var m_ValidationResult = [];

/**
 * @public 
 * @param {Array<scopes.svyValidationManager.ValidationMarker>} validationResult
 *
 * @properties={typeid:24,uuid:"5177C1BC-3A53-4BBB-A9DB-88572D8627FA"}
 */
function setValidationResult(validationResult){
    m_ValidationResult = validationResult;
}

/**
 * Method to validate the record data before saving it in the database.
 * @override 
 * @public 
 * @param {JSRecord} record The record to validate.
 * @return {Array<scopes.svyValidationManager.ValidationMarker>} An empty array if the specified record can be saved, otherwise an array with validation markers which contain information why the record cannot be saved.
 * @properties={typeid:24,uuid:"ED27F8C2-A749-43FD-8951-14E67411D3B7"}
 */
function validate(record){
    return m_ValidationResult;
}

/**
 * Method to validate if the record can be deleted from the database.
 * @override 
 * @public 
 * @param {JSRecord} record The record to validate.
 * @return {Array<scopes.svyValidationManager.ValidationMarker>} An empty array if the specified record can be deleted, otherwise an array with validation markers which contain information why the record cannot be deleted.
 * @properties={typeid:24,uuid:"8CE38D23-DA5B-4EC1-B4A4-FD67F599753A"}
 */
function canDelete(record){
    return m_ValidationResult;
}

/**
 * Method which is used by the system to discover all validation providers for the specified datasource.
 * @override 
 * @public 
 * @param {String} dataSource The datasource to check.
 * @return {Boolean} True if the validation provider supports the specified datasource
 * @properties={typeid:24,uuid:"6B21A01F-F755-4546-9DD8-B3ED3F11DCFA"}
 */
function isDataSourceSupported(dataSource){
    return (dataSource == controller.getDataSource());
}

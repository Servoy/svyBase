/**
 * @private 
 * @type {Array<scopes.svyValidationManager.ValidationMarker>}
 * @properties={typeid:35,uuid:"F9C84143-5ECA-4346-80C1-82B70CA2115E",variableType:-4}
 */
var m_ValidationResult = [];

/**
 * @public 
 * @param {Array<scopes.svyValidationManager.ValidationMarker>} validationResult
 *
 * @properties={typeid:24,uuid:"BBD33111-F093-4DC8-95D7-C48787ADE2B0"}
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
 * @properties={typeid:24,uuid:"C699F9A4-35D8-4533-BA74-C1A459D2A6E7"}
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
 * @properties={typeid:24,uuid:"1568684C-471E-4196-8E53-4E9D00A8DFAB"}
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
 * @properties={typeid:24,uuid:"1B7F7B0E-DAA1-4F10-9F83-ACB36EF4E73E"}
 */
function isDataSourceSupported(dataSource){
    return (dataSource == controller.getDataSource());
}

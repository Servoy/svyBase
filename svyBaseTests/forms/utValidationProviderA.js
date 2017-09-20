/**
 * @private 
 * @type {Array<scopes.svyValidationManager.ValidationMarker>}
 * @properties={typeid:35,uuid:"E47CE184-AC53-4151-B56C-AD2DCD9F31B2",variableType:-4}
 */
var m_ValidationResult = [];

/**
 * @public 
 * @param {Array<scopes.svyValidationManager.ValidationMarker>} validationResult
 *
 * @properties={typeid:24,uuid:"2CAE7E3D-9216-495B-987D-2461097470A5"}
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
 * @properties={typeid:24,uuid:"9314F900-E9F1-462C-AD7F-599F7EA6CA42"}
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
 * @properties={typeid:24,uuid:"11E47D6A-5F64-428A-BBA7-76E797591C17"}
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
 * @properties={typeid:24,uuid:"D368E461-E5F2-4C66-AD5D-66471C68BFF3"}
 */
function isDataSourceSupported(dataSource){
    return (dataSource == controller.getDataSource());
}
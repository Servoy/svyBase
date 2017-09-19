/**
 * Method to validate the record data before saving it in the database.
 * @public 
 * @param {JSRecord} record The record to validate.
 * @return {Array<scopes.svyValidationManager.ValidationMarker>} An empty array if the specified record can be saved, otherwise an array with validation markers which contain information why the record cannot be saved.
 * @properties={typeid:24,uuid:"948011ED-76DF-463B-96B5-940E9F40D918"}
 */
function validate(record){
	throw new scopes.svyExceptions.AbstractMethodInvocationException('Method not implemented');
}

/**
 * Method to validate if the record can be deleted from the database.
 * @public 
 * @param {JSRecord} record The record to validate.
 * @return {Array<scopes.svyValidationManager.ValidationMarker>} An empty array if the specified record can be deleted, otherwise an array with validation markers which contain information why the record cannot be deleted.
 * @properties={typeid:24,uuid:"D4BB5E14-15B1-4133-9BC9-75B74ECDD005"}
 */
function canDelete(record){
    throw new scopes.svyExceptions.AbstractMethodInvocationException('Method not implemented');
}

/**
 * Method which is used by the system to discover all validation providers for the specified datasource.
 * @public 
 * @param {String} dataSource The datasource to check.
 * @return {Boolean} True if the validation provider supports the specified datasource
 * @properties={typeid:24,uuid:"3BAA3242-678B-4220-88F9-893208EF7731"}
 */
function isDataSourceSupported(dataSource){
	throw new scopes.svyExceptions.AbstractMethodInvocationException('Method not implemented');
}
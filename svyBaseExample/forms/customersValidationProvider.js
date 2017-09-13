/**
 * @override 
 * @public 
 * @param {JSRecord<db:/example_data/customers>} record
 * @return {Array<scopes.svyValidationManager.ValidationMarker>}
 * @properties={typeid:24,uuid:"35F3067A-B8CD-4D55-99E4-3C0D800A4B22"}
 */
function validate(record){
    var result = [];
    
    if (scopes.svyBaseExampleUtils.stringIsNullOrEmpty(record.customerid)){
        result.push(new scopes.svyValidationManager.ValidationMarker(record, 'Customer ID is required.', scopes.svyValidationManager.VALIDATION_LEVEL.ERROR, 'customerid'));
    }
    
    if (scopes.svyBaseExampleUtils.stringIsNullOrEmpty(record.companyname)){
        result.push(new scopes.svyValidationManager.ValidationMarker(record, 'Company Name is required.', scopes.svyValidationManager.VALIDATION_LEVEL.ERROR, 'companyname'));
    }
    
    if (scopes.svyBaseExampleUtils.stringIsNullOrEmpty(record.phone) && scopes.svyBaseExampleUtils.stringIsNullOrEmpty(record.fax) && scopes.svyBaseExampleUtils.stringIsNullOrEmpty(record.address)){
        result.push(new scopes.svyValidationManager.ValidationMarker(record, 'It is recommended to provide at least phone, fax or address.', scopes.svyValidationManager.VALIDATION_LEVEL.INFO, 'address'));
    }
    
    return result;
}

/**
 * Method to validate if the record can be deleted from the database.
 * @override 
 * @public 
 * @param {JSRecord<db:/example_data/customers>} record The record to validate.
 * @return {Array<scopes.svyValidationManager.ValidationMarker>} An empty array if the specified record can be deleted, otherwise an array with validation markers which contain information why the record cannot be deleted.
 * @properties={typeid:24,uuid:"11A76241-E53A-4DE6-BB92-D4A82C2AD0DA"}
 */
function canDelete(record){
    var result = [];
    if (databaseManager.hasRecords(record.customers_to_orders)) {
        result.push(new scopes.svyValidationManager.ValidationMarker(record, 'Cannot delete customer record because there are Orders associated with it.', scopes.svyValidationManager.VALIDATION_LEVEL.ERROR));
    }
    return result;
}

/**
 * @override 
 * @public 
 * @param {String} dataSource
 * @return {Boolean}
 * @properties={typeid:24,uuid:"8B8FA992-6C5E-4238-B1C7-1698F3E92827"}
 */
function isDataSourceSupported(dataSource){
    return (dataSource == controller.getDataSource());
}

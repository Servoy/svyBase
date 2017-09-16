/**
 * @override 
 * @public 
 * @param {JSRecord<db:/example_data/orders>} record
 * @return {Array<scopes.svyValidationManager.ValidationMarker>}
 * @properties={typeid:24,uuid:"9F5CE0A0-DA95-4306-932A-3B83BFF82103"}
 */
function validate(record){
    var result = [];
    
    if (record.customerid == null){
        result.push(new scopes.svyValidationManager.ValidationMarker(record, 'Customer ID is required', scopes.svyValidationManager.VALIDATION_LEVEL.ERROR, 'customerid'));
    }
    if (record.orderdate == null){
        result.push(new scopes.svyValidationManager.ValidationMarker(record, 'Order Date is required', scopes.svyValidationManager.VALIDATION_LEVEL.ERROR, 'orderdate'));
    }
    
    return result;
}

/**
 * Method to validate if the record can be deleted from the database.
 * @override 
 * @public 
 * @param {JSRecord<db:/example_data/orders>} record The record to validate.
 * @return {Array<scopes.svyValidationManager.ValidationMarker>} An empty array if the specified record can be deleted, otherwise an array with validation markers which contain information why the record cannot be deleted.
 * @properties={typeid:24,uuid:"9E32B09D-C7F1-491E-A458-216F5BDBB5AB"}
 */
function canDelete(record){
    return [];
}

/**
 * @override 
 * @public 
 * @param {String} dataSource
 * @return {Boolean}
 * @properties={typeid:24,uuid:"DDDC4363-C5F4-48A9-88D5-0F6717E4A8E0"}
 */
function isDataSourceSupported(dataSource){
    return (dataSource == controller.getDataSource());
}

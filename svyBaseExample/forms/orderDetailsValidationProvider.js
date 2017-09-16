/**
 * @override 
 * @public 
 * @param {JSRecord<db:/example_data/order_details>} record
 * @return {Array<scopes.svyValidationManager.ValidationMarker>}
 * @properties={typeid:24,uuid:"BE3B2D18-93AF-42E6-A767-559807B8BC8C"}
 */
function validate(record){
    var result = [];
    
    if (record.productid == null){
        result.push(new scopes.svyValidationManager.ValidationMarker(record, 'Product ID is required.', scopes.svyValidationManager.VALIDATION_LEVEL.ERROR, 'productid'));
    }
    else if ((record.orderid != null) && (record.getChangedData().getColumnAsArray(1).indexOf('productid') != -1)) {
        var fs = datasources.db.example_data.order_details.getFoundSet();
        var qry = datasources.db.example_data.order_details.createSelect();
        qry.where.add(qry.columns.orderid.eq(record.orderid));
        qry.where.add(qry.columns.productid.eq(record.productid));
        fs.loadRecords(qry);
        if (fs.getSize() > 0) {
            result.push(new scopes.svyValidationManager.ValidationMarker(record, 'Another order detail with the same Product ID already exists.', scopes.svyValidationManager.VALIDATION_LEVEL.ERROR, 'productid'));            
        }
    }
    
    return result;
}

/**
 * Method to validate if the record can be deleted from the database.
 * @override 
 * @public 
 * @param {JSRecord<db:/example_data/order_details>} record The record to validate.
 * @return {Array<scopes.svyValidationManager.ValidationMarker>} An empty array if the specified record can be deleted, otherwise an array with validation markers which contain information why the record cannot be deleted.
 * @properties={typeid:24,uuid:"DA0B8EAE-CDA0-4F3F-B10A-D492DA0BD4AC"}
 */
function canDelete(record){
    return [];
}

/**
 * @override 
 * @public 
 * @param {String} dataSource
 * @return {Boolean}
 * @properties={typeid:24,uuid:"DE2218D8-B883-4D80-A3EF-A23C2D395107"}
 */
function isDataSourceSupported(dataSource){
    return (dataSource == controller.getDataSource());
}

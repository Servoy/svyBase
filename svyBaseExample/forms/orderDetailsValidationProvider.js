/**
 * @override
 * @public
 * @param {JSRecord<db:/example_data/order_details>} record
 * @return {Array<scopes.svyValidationManager.ValidationMarker>}
 * @properties={typeid:24,uuid:"BE3B2D18-93AF-42E6-A767-559807B8BC8C"}
 */
function validate(record) {
    var result = [];

    if (record.productid == null) {
        result.push(new scopes.svyValidationManager.ValidationMarker(record, 'Product ID is required.', scopes.svyValidationManager.VALIDATION_LEVEL.ERROR, 'productid'));
    } else if ( (record.orderid != null) && (record.getChangedData().getColumnAsArray(1).indexOf('productid') != -1)) {
        //we need to check if another order detail uses the same product because the productid is part of the composite PK for the order_details table and duplicate PKs are not allowed
        var fs = record.foundset;
        var recIndx = fs.getRecordIndex(record);
        //the duplicate product check is performed in the record's foundset
        //this will cover the case where the user may have selected a detail record with the same productid for deletion
        //(such records are "omitted" from the foundset and should not be considered as duplicates because they will be deleted before this record is saved)
        for (var index = 1; index <= fs.getSize(); index++) {
            var checkRec = fs.getRecord(index);
            if ( (checkRec.productid == record.productid) && (index != recIndx)) {
                result.push(new scopes.svyValidationManager.ValidationMarker(record, utils.stringFormat('Another order detail with the same Product [%1$s] already exists.', [record.order_details_to_products.productname]), scopes.svyValidationManager.VALIDATION_LEVEL.ERROR, 'productid'));
                break;
            }
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
function canDelete(record) {
    return [];
}

/**
 * @override
 * @public
 * @param {String} dataSource
 * @return {Boolean}
 * @properties={typeid:24,uuid:"DE2218D8-B883-4D80-A3EF-A23C2D395107"}
 */
function isDataSourceSupported(dataSource) {
    return (dataSource == controller.getDataSource());
}

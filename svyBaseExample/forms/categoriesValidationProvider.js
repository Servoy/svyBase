/**
 * @override 
 * @public 
 * @param {JSRecord<db:/example_data/categories>} record
 * @return {Array<scopes.svyValidationManager.ValidationMarker>}
 * @properties={typeid:24,uuid:"9EFBE3D6-6DEA-4413-8ECD-000818306601"}
 */
function validate(record){
    var result = [];
    
    if (!record.categoryname || utils.stringTrim(record.categoryname).length == 0){
        result.push(new scopes.svyValidationManager.ValidationMarker(record, 'Category Name is required', scopes.svyValidationManager.VALIDATION_LEVEL.ERROR, 'categoryname'));
    }
    
    if (!record.description || utils.stringTrim(record.description).length == 0){
        result.push(new scopes.svyValidationManager.ValidationMarker(record, 'It is recommended to provide category description', scopes.svyValidationManager.VALIDATION_LEVEL.ERROR, 'description'));
    }
    
    return result;
}

/**
 * @override 
 * @public 
 * @param {String} dataSource
 * @return {Boolean}
 * @properties={typeid:24,uuid:"385F5DA5-5210-445F-A58F-6835F7508AE6"}
 */
function isDataSourceSupported(dataSource){
    return (dataSource == controller.getDataSource());
}
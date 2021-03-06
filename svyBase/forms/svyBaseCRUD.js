/**
 * Enumeration used for the standard form action names.
 * @public
 * @enum
 * @properties={typeid:35,uuid:"2CE299C5-BC55-4FF8-A15C-4F463748E34F",variableType:-4}
 */
var FORM_ACTION_NAMES = {
    NEW: 'svy-form-action-new',
    SAVE: 'svy-form-action-save',
    CANCEL: 'svy-form-action-cancel',
    DELETE: 'svy-form-action-delete',
    FIRST: 'svy-form-action-first',
    PREVIOUS: 'svy-form-action-previous',
    NEXT: 'svy-form-action-next',
    LAST: 'svy-form-action-last'
};

/**
 * Stores the form CRUD policies.
 * @private
 * @properties={typeid:35,uuid:"C86C5862-377B-417B-BD56-4843BE201DC0",variableType:-4}
 */
var crudPolicies = scopes.svyCRUDManager.createCRUDPolicies();

/**
 * Gets the form policies.
 * @protected
 * @return {scopes.svyCRUDManager.CRUDPolicies} The current form policies.
 * @properties={typeid:24,uuid:"89F329BC-F975-4C32-98D7-7A333A47EA2F"}
 */
function getCrudPolicies() {
    return crudPolicies;
}

/**
 * Stores the form validation markers.
 * @private
 * @type {Array<scopes.svyValidationManager.ValidationMarker>}
 * @properties={typeid:35,uuid:"E675958D-88A2-4F16-AE2B-4B0E0364C9A5",variableType:-4}
 */
var validationMarkers = [];

/**
 * Used to track batch of work records when the batch scope is set to AUTO.
 * @private
 * @type {Array<JSRecord>}
 * @properties={typeid:35,uuid:"89983EDF-C8A5-4B52-A2B6-2201FFD1D4D0",variableType:-4}
 */
var trackedRecords = [];

/**
 * @private
 * @type {JSRecord}
 * @properties={typeid:35,uuid:"F2378E77-3583-490A-AD73-602D91186937",variableType:-4}
 */
var lastSelectedRecord = null;

/**
 * @private
 * @type {Array<String>}
 * @properties={typeid:35,uuid:"3865FDE2-6E9E-4D77-B18E-CF624D567811",variableType:-4}
 */
var recordLocks = [];

/**
 * @private
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"D1EBFFC4-9B7D-46D8-86FB-3F30D697DF8C",variableType:4}
 */
var recordLockRetries = 3;

/**
 * @private
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"D964F6E8-1808-4A13-8D42-9F0E6DBB0F24",variableType:4}
 */
var recordLockRetryPeriodMilliseconds = 100;

/**
 * Indicates if there are any changed or new records in the batch of work controlled by this form.
 * @public
 * @return {Boolean} True if there are any changed or new records.
 * @properties={typeid:24,uuid:"6B9C30B7-28CF-404C-B37D-4624A163C070"}
 */
function hasEdits() {
    var records = getEditedRecords();
    for (var i = 0; i < records.length; i++) {
    	if (records[i] instanceof JSRecord) {
	        if (records[i].hasChangedData() || records[i].isNew()) {
	            return true;
	        }
    	}
    }
    return false;
}

/**
 * Indicates if there are any validation markers with ERROR level.
 * 
 * @public
 * @param {Array<scopes.svyValidationManager.ValidationMarker>} [markersToCheck] If not specified will use the internal validation markers, otherwise will inspect the provided markers.
 * @return {Boolean} True if there are any validation markers with ERROR level.
 * 
 * @properties={typeid:24,uuid:"55BD75F0-EE8A-445C-89E7-6148A70D9DFC"}
 */
function hasErrors(markersToCheck) {
    if (!markersToCheck){
        markersToCheck = getValidationMarkers();
    }
    for (var i in markersToCheck) {
        if (markersToCheck[i].getLevel() == scopes.svyValidationManager.VALIDATION_LEVEL.ERROR) {
            return true;
        }
    }
    return false;
}

/**
 * This method is called before navigating away from the current record if there are any unsaved changes and the record selection [policy]{@link getCrudPolicies} is set to PREVENT_WHEN_EDITING.
 * The responsibility of this method is to indicate how to proceed - save changes and continue, cancel changes and continue or block the action and stay on the current record.
 * This method is intended for usage by extending forms - they can override it to provide custom handling as needed.
 * By default this method returns USER_LEAVE.BLOCK blocking the user action and staying on the current selected record.
 * 
 * @protected
 * @return {String} One of the {@link svyCRUDManager#USER_LEAVE) enumeration options indicating how to proceed. The default is to block the operation (scopes.svyCRUDManager.USER_LEAVE.BLOCK)
 * 
 * @properties={typeid:24,uuid:"B05DFAF8-FBDB-4B68-BBC5-E62155E7CAA6"}
 */
function onUserLeave() {
    //the default behavior should not cause loss of use data changes, so the safest option is to block
    return scopes.svyCRUDManager.USER_LEAVE.BLOCK;
}

/**
 * Standard form action to create a new record. 
 * As part of the new record action flow the following methods will be executed in the specified order allowing extending forms to perform additional custom tasks: 
 * - {@link beforeNewRecord}
 * - {@link createNewRecord}
 * - {@link afterNewRecord}
 * 
 * Creating a new record can be blocked by returning false in {@link beforeNewRecord}.
 * If an error is encountered while creating the new record then the method {@link onNewRecordError} will be called allowing extending forms to handle the error condition as needed.
 * 
 * @protected
 * @return {Boolean} True if a new record was created, otherwise false.
 * 
 * @properties={typeid:24,uuid:"53C0E0C1-925B-4A06-AA0A-0670456433D9"}
 */
function newRecord() {

    if (!beforeMoveRecord()) {
        return false;
    }

    // check pre handler(s)
    if (!beforeNewRecord()) {
        return false;
    }

    /** 
     * @type {JSRecord}
     * @ignore 
     */
    var newRec = null;
    try {
        // create record;        
        newRec = createNewRecord();
        
    } catch (e) {
        // notify on-error
        /** @type {scopes.svyDataUtils.NewRecordFailedException} */
        var ex = e;
        if (! (e instanceof scopes.svyDataUtils.NewRecordFailedException)) {
            ex = new scopes.svyDataUtils.NewRecordFailedException('New Record Failed: ' + e.message, foundset);
        }
        onNewRecordError(ex);
        updateStandardFormActionsState();
        updateUIHandler(createDummyJSEvent(), FORM_ACTION_NAMES.NEW);
        return false;
    }

    try {
        // track record if tracking on
        track(newRec);

        afterNewRecord(newRec);

        return true;
    } finally {
        updateStandardFormActionsState();
        updateUIHandler(createDummyJSEvent(), FORM_ACTION_NAMES.NEW);
    }
}

/**
 * Standard form action to delete the selected record. If the form has multi-selection enabled and multiple records are currently selected then all selected records will be deleted. 
 * As part of the delete action flow the following methods will be executed in the specified order allowing extending forms to perform additional custom tasks: 
 * - {@link confirmDelete}
 * - {@link beforeDelete}
 * - {@link canDelete}
 * - {@link deleteValidatedRecords}
 * - {@link afterDelete}
 * 
 * Deleting the selected record(s) can be blocked by returning false in {@link confirmDelete}, {@link canDelete} or {@link beforeDelete}.
 * If an error is encountered while deleting any record then the whole operation will be reverted (rolling back any database transaction currently in progress) and the method {@link onDeleteError} will be called allowing extending forms to handle the error condition as needed.
 * Depending on the record locking [policy]{@link getCrudPolicies} configuration the selected record(s) may be locked before validating the record deletion and during the actual database delete operation.
 * 
 * @protected
 * @return {Boolean} True if the record was deleted.
 * 
 * @properties={typeid:24,uuid:"38217020-D34E-413A-AE8E-9D53FD1F1C56"}
 */
function deleteSelectedRecords() {

    // records to delete
    var records = foundset.getSelectedRecords();
    if (!records.length) {
        return false;
    }

    try {
        // check pre-delete handler(s)
        if (!beforeDelete(records)) {
            updateUIHandler(createDummyJSEvent(), FORM_ACTION_NAMES.DELETE);
            return false;
        }

        // validate
        if (getCrudPolicies().getValidationPolicy() != scopes.svyCRUDManager.VALIDATION_POLICY.NONE) {
            var markers = canDelete(records);
            if (hasErrors(markers)) {
                onValidationError(markers, FORM_ACTION_NAMES.DELETE);
                updateUIHandler(createDummyJSEvent(), FORM_ACTION_NAMES.DELETE);
                return false;
            }
        }
        
        if (!confirmDelete(records)) {
            return false;
        }

        //lock
        if (getCrudPolicies().getRecordLockingPolicy() == scopes.svyCRUDManager.RECORD_LOCKING_POLICY.AUTO) {
            if (!lockRecords(records)) {
                return false;
            }
        }

        var usingLocalTransaction = !databaseManager.hasTransaction();

        if (usingLocalTransaction) {
            // open transaction
            databaseManager.startTransaction();
        }
        try {

            deleteValidatedRecords(records);

            if (usingLocalTransaction) {
                // commit transaction
                if (!databaseManager.commitTransaction(false)) {

                    // TODO consider adding transaction failed exception to svyDataUtils
                    throw new scopes.svyDataUtils.SvyDataException('Transaction Failed');
                }
            }
        } catch (e) {

            // rollback transaction
            databaseManager.rollbackTransaction(false, false);
            //releasing locks as soon as possible instead of waiting for the finally block
            releaseAllLocks();

            // notify on-error
            /** @type {scopes.svyDataUtils.DeleteRecordFailedException} */
            var ex = e;
            if (! (e instanceof scopes.svyDataUtils.DeleteRecordFailedException)) {
                ex = new scopes.svyDataUtils.DeleteRecordFailedException('Delete failed: ' + e.message, foundset);
            }
            onDeleteError(ex);
            updateStandardFormActionsState();
            updateUIHandler(createDummyJSEvent(), FORM_ACTION_NAMES.DELETE);
            return false;
        }
    } finally {
        releaseAllLocks();
    }

    clearValidationMarkers();
    updateValidationMarkersHandler(getValidationMarkers(), null);
    
    try {
        // remove from tracking
        untrack(records);

        // post-delete handler
        afterDelete();

        return true;
    } finally {
        updateStandardFormActionsState();
        updateUIHandler(createDummyJSEvent(), FORM_ACTION_NAMES.DELETE);
    }
}

/**
 * This method is called as part of the [delete]{@link deleteSelectedRecords} operation flow and is executed in the context of the Delete database transaction.
 * The provided records have already been validated and are OK to be deleted and it is responsibility of this method to actually delete them from the database.
 * This method should throw an exception if any record could not be deleted for some reason in order to ensure that the encompassing database transaction is rolled back correctly.
 * Extending forms may override this method if as part of the same database transaction they need to save/delete any additional records which are not part of work batch scope.
 * 
 * @protected 
 * @param {Array<JSRecord>} records The validated records which must be deleted.
 * @throws {Error} If any record could not be deleted and the database transaction needs to be rolled back.
 *
 * @properties={typeid:24,uuid:"8836F65A-7257-4F24-9612-59C13E709E0B"}
 */
function deleteValidatedRecords(records){
    // Delete selected records individually for better error handling
    for (var i in records) {
        var record = records[i];

        // delete record
        try {
            if (!record.foundset.deleteRecord(record)) {
                throw new scopes.svyDataUtils.DeleteRecordFailedException('Delete Record Failed: ' + record.exception, record);
            }

            // handle expected errors, i.e. DELETE_NOT_GRANTED
        } catch (e) {
            throw new scopes.svyDataUtils.DeleteRecordFailedException(e.message, record);
        }
    }
}

/**
 * This method is called as part of the [delete]{@link deleteSelectedRecords} operation flow.
 * It is called after the delete prompt but before validation and the actual deletion of the selected records.
 * It can be overridden by extending forms to perform any needed custom tasks.
 * If this method returns false then the delete operation will be canceled and the selected record(s) will not be deleted.
 *
 * @protected
 * @param {Array<JSRecord>} records The records to be deleted.
 * @return {Boolean} True (default) if the delete operation can proceed, false to cancel the delete operation.
 *
 * @properties={typeid:24,uuid:"4A359896-25AF-4326-A118-9A232249485A"}
 */
function beforeDelete(records) {
    return true;
}

/**
 * This method is called as part of the [delete]{@link deleteSelectedRecords} operation flow.
 * It is called after the selected records are successfully deleted from the database.
 * It can be overridden by extending forms to perform any needed custom tasks.
 * 
 * @protected
 * 
 * @properties={typeid:24,uuid:"23E38465-DFD5-41AD-AD15-D31ED60353E3"}
 */
function afterDelete() { }

/**
 * This method is called as part of the [delete]{@link deleteSelectedRecords} operation flow if an error is encountered while deleting any of the selected records from the database.
 * It can be overridden by extending forms to perform any needed custom error handling.
 * 
 * @protected
 * @param {scopes.svyDataUtils.DeleteRecordFailedException} error Custom exception object containing information about the particular error.
 * 
 * @properties={typeid:24,uuid:"0600B27F-F792-4191-BD57-9BA1AEE78601"}
 */
function onDeleteError(error) { }

/**
 * This method is called as part of the [new record]{@link newRecord} operation flow.
 * It is called before the actual creation of the new record. 
 * It can be overridden by extending forms to perform any needed custom tasks.
 * If this method returns false then the new record operation will be canceled and a new record will not be created.
 * 
 * @protected
 * @return {Boolean} True (default) if the new record operation can proceed, false to cancel the new record operation.
 * 
 * @properties={typeid:24,uuid:"CD02C4FF-0269-477D-90B0-28DEC40EBCD6"}
 */
function beforeNewRecord() {
    return true;
}

/**
 * @protected 
 * @return {JSRecord}
 * @properties={typeid:24,uuid:"E247A95A-1839-41F3-9EE7-B234AC19B1F4"}
 */
function createNewRecord(){
    // create record;
    var newRecIndex = foundset.newRecord();

    if (newRecIndex == -1) {
        throw new scopes.svyDataUtils.NewRecordFailedException('New Record Failed', foundset);
    }
    
    return foundset.getRecord(newRecIndex);
}

/**
 * This method is called as part of the [new record]{@link newRecord} operation flow.
 * It is called after the new record is successfully created in the foundset.
 * It can be overridden by extending forms to perform any needed custom tasks.
 * 
 * @protected
 * @param {JSRecord} record The new record which was created.
 * 
 * @properties={typeid:24,uuid:"003D75DB-7973-4804-9F03-8FDEEA5A2C67"}
 */
function afterNewRecord(record) { }

/**
 * This method is called as part of the [new record]{@link newRecord} operation flow if an error is encountered while creating the new record.
 * It can be overridden by extending forms to perform any needed custom error handling.
 * 
 * @protected
 * @param {scopes.svyDataUtils.NewRecordFailedException} error Custom exception object containing information about the particular error.
 * 
 * @properties={typeid:24,uuid:"70BE571E-C17F-4E80-93AE-287FBE89DD2F"}
 */
function onNewRecordError(error) { }

/**
 * Standard form action to save in the database any changed and new records currently in the batch of work scope controlled by this form. 
 * As part of the save action flow the following methods will be executed in the specified order allowing extending forms to perform additional custom tasks: 
 * - {@link beforeSave}
 * - {@link validate}
 * - {@link saveValidatedRecords}
 * - {@link afterSave}
 * 
 * If the result of the validation contains any validation markers with ERROR level the save operation will be canceled.
 * Saving the edited/new record(s) can be blocked also by returning false in {@link beforeSave}.
 * If an error is encountered while saving any record then the whole operation will be reverted (rolling back any database transaction currently in progress) and the method {@link onSaveError} will be called allowing extending forms to handle the error condition as needed.
 * Depending on the record locking [policy]{@link getCrudPolicies} configuration the edited record(s) may be locked before validating the record(s) and during the actual database save operation.
 * 
 * @protected
 * @return {Boolean} True if all records were saved.
 *  
 * @properties={typeid:24,uuid:"987117A7-2184-4702-8101-C89EF93F833A"}
 */
function save() {

    // collect edited records
    var records = getEditedRecords();
    if (!records.length) {
    	afterSave(records);
        updateStandardFormActionsState();
    	updateUIHandler(createDummyJSEvent(), FORM_ACTION_NAMES.SAVE);
        return true;
    }

    if (getCrudPolicies().getRecordLockingPolicy() == scopes.svyCRUDManager.RECORD_LOCKING_POLICY.AUTO) {
        if (!lockRecords(records)) {
            return false;
        }
    }

    try {
        // Call before-save handler(s)
        if (!beforeSave(records)) {
            updateUIHandler(createDummyJSEvent(), FORM_ACTION_NAMES.SAVE);
            return false;
        }
        
        // validate
        if (getCrudPolicies().getValidationPolicy() != scopes.svyCRUDManager.VALIDATION_POLICY.NONE) {
            var markers = validate(records);
            updateValidationMarkersHandler(markers, null);
            if (hasErrors(markers)) {
            	onValidationError(markers, FORM_ACTION_NAMES.SAVE);
                updateUIHandler(createDummyJSEvent(), FORM_ACTION_NAMES.SAVE);
                return false;
            }
        }

        var usingLocalTransaction = !databaseManager.hasTransaction();

        // begin transaction
        if (usingLocalTransaction) {
            databaseManager.startTransaction();
        }
        
        try {
            saveValidatedRecords(records);
            
            // commit transaction
            if (usingLocalTransaction) {
                if (!databaseManager.commitTransaction(false)) {
                    throw new scopes.svyDataUtils.SaveDataFailedException('Could not commit transaction');
                }
            }
        } catch (e) {

            // rollback transaction
            databaseManager.rollbackTransaction(false, false);
            //on error releasing all locks as soon as possible instead of waiting for the finally block
            releaseAllLocks();

            // notify on-error
            /** @type {scopes.svyDataUtils.SaveDataFailedException} */
            var ex = e;
            if (! (e instanceof scopes.svyDataUtils.SaveDataFailedException)) {
                ex = new scopes.svyDataUtils.SaveDataFailedException('Save Failed: ' + e.message);
            }
            onSaveError(ex);
            updateStandardFormActionsState();
            updateUIHandler(createDummyJSEvent(), FORM_ACTION_NAMES.SAVE);
            return false;
        }
    } finally {
        releaseAllLocks();
    }

    // clear validation markers
    clearValidationMarkers();
    updateValidationMarkersHandler(getValidationMarkers(), null);

    try {
        // clear tracked records
        clearTracking();

        // post-save handler
        afterSave(records);

        return true;
    } finally {
        updateStandardFormActionsState();
        updateUIHandler(createDummyJSEvent(), FORM_ACTION_NAMES.SAVE);
    }
}

/**
 * This method is called as part of the [save]{@link save} operation and is executed in the context of the save database transaction.
 * The provided records have already been validated and it is responsibility of this method to actually save them in the database.
 * This method should throw an exception if any record could not be saved for some reason in order to ensure that the encompassing database transaction is rolled back correctly.
 * Extending forms may override this method if as part of the same database transaction they need to save/delete any additional records which are not part of work batch scope.
 * 
 * @protected 
 * @param {Array<JSRecord>} records The validated records which must be saved in the database.
 * @throws {Error} If any record could not be saved and the database transaction needs to be rolled back.
 * 
 * @properties={typeid:24,uuid:"E80B1DAF-2CCD-4AE7-8ECD-A35C4C3969A3"}
 */
function saveValidatedRecords(records){
    // save records 1-by-1
    for (var i in records) {
        var record = records[i];

        try {
            if (!databaseManager.saveData(record)) {
                throw new scopes.svyDataUtils.SaveDataFailedException('Save Failed', record);
            }
        } catch (ex) {
            throw new scopes.svyDataUtils.SaveDataFailedException(ex.message, record);
        }
    }
}

/**
 * This method is called as part of the [save]{@link save} operation flow.
 * It is called before the validation and actual saving of the records in the database.
 * It can be overridden by extending forms to perform any needed custom tasks.
 * If this method returns false then the delete operation will be canceled and the selected record(s) will not be deleted.
 *
 * @protected
 * @param {Array<JSRecord>} records The records to be saved.
 * @return {Boolean} True (default) if the delete operation can proceed, false to cancel the delete operation.
 *
 * @properties={typeid:24,uuid:"90B9D3C6-863E-471D-9A4F-189BC98402AA"}
 */
function beforeSave(records) {
    return true;
}

/**
 * This method is called as part of the [save]{@link save} operation flow.
 * It is called after the records are successfully saved in the database.
 * It can be overridden by extending forms to perform any needed custom tasks.
 * 
 * @param {Array<JSRecord>} records
 * 
 * @protected
 * 
 * @properties={typeid:24,uuid:"4A7F8CEA-9DF0-4FBE-98EE-17854331DDAE"}
 */
function afterSave(records) { }

/**
 * This method is called as part of the [save]{@link save} operation flow if an error is encountered while saving any of the records in the database.
 * It can be overridden by extending forms to perform any needed custom error handling.
 * 
 * @protected
 * @param {scopes.svyDataUtils.SaveDataFailedException} error Custom exception object containing information about the particular error.
 * 
 * @properties={typeid:24,uuid:"24E8B121-4E3A-4465-B2D1-A32A5EAA8DF6"}
 */
function onSaveError(error) { }

/**
 * Standard form action to cancel any unsaved changes and revert the records currently in the batch of work scope controlled by this form back to its original state. 
 * As part of the cancel action flow the following methods will be executed in the specified order allowing extending forms to perform additional custom tasks: 
 * - {@link beforeCancel}
 * - {@link afterCancel}
 * 
 * Canceling/reverting the records changes can be blocked by returning false in {@link beforeCancel}.
 * 
 * @protected
 * @return {Boolean} True if the unsaved changes were canceled/reverted successfully.
 *  
 * @properties={typeid:24,uuid:"3C6EB4F1-3B75-4AB4-BCB5-4DD2146F5B86"}
 */
function cancel() {

    // collect edited records
    var records = getEditedRecords();
    if (!records.length) {
    	afterCancel(records);
    	updateStandardFormActionsState();
    	updateUIHandler(createDummyJSEvent(), FORM_ACTION_NAMES.CANCEL);    	
        return true;
    }

    try {
        // check pre-cancel handler(s)
        if (!beforeCancel(records)) {
            return false;
        }

        // revert records 1-by-1
        for (var i in records) {
            var record = records[i];
            record.revertChanges();
        }

        // clear validation markers
        clearValidationMarkers();
        updateValidationMarkersHandler(getValidationMarkers(), null);
        
        releaseAllLocks();

        // clear tracking
        clearTracking();

        // notify post-cancel handler
        afterCancel(records);

        return true;
    } finally {
        updateStandardFormActionsState();
        updateUIHandler(createDummyJSEvent(), FORM_ACTION_NAMES.CANCEL);
    }
}

/**
 * This method is called as part of the [cancel]{@link cancel} operation flow.
 * It is called before the actual reverting of the unsaved changes.
 * It can be overridden by extending forms to perform any needed custom tasks.
 * If this method returns false then the cancel operation will be blocked(canceled) and the unsaved changes will remain intact.
 *
 * @protected
 * @param {Array<JSRecord>} records The records to be reverted back to their original state.
 * @return {Boolean} True (default) if the cancel operation can proceed, false to block the cancel operation.
 * 
 * @properties={typeid:24,uuid:"FAD7AC85-F98C-4CF1-A3B3-6B2FA8A6AB25"}
 */
function beforeCancel(records) {
    return true;
}

/**
 * This method is called as part of the [cancel]{@link cancel} operation flow.
 * It is called after the unsaved changes are canceled and the records are reverted back to their original state.
 * It can be overridden by extending forms to perform any needed custom tasks.
 * 
 * @param {Array<JSRecord>} records
 * 
 * @protected
 * 
 * @properties={typeid:24,uuid:"F2ECBD52-7DD1-4B30-945E-D4D707351BBA"}
 */
function afterCancel(records) { }

/**
 * Standard form action to navigate to the next record in the foundset. 
 * If there are any unsaved changes and the record selection [policy]{@link getCrudPolicies} is set to PREVENT_WHEN_EDITING then the {@link onUserLeave} method will be called to determine how to proceed:
 *  - save the changes and select the next record
 *  - cancel the changes and select the next record
 *  - block the operation and stay on the current record 
 * 
 * @protected
 * @return {Boolean} True if the next record was selected.
 * 
 * @properties={typeid:24,uuid:"7C3F8738-74A6-405C-9526-1FB6BABDFAEB"}
 */
function selectNextRecord() {

    // check position at end of foundset
    if (foundset.getSelectedIndex() == foundset.getSize()) {
        return false;
    }

    // check pre-move handler
    if (!beforeMoveRecord()) {
        return false;
    }

    // move selection
    controller.setSelectedIndex(foundset.getSelectedIndex() + 1);

    return true;
}

/**
 * Standard form action to navigate to the previous record in the foundset. 
 * If there are any unsaved changes and the record selection [policy]{@link getCrudPolicies} is set to PREVENT_WHEN_EDITING then the {@link onUserLeave} method will be called to determine how to proceed:
 *  - save the changes and select the previous record
 *  - cancel the changes and select the previous record
 *  - block the operation and stay on the current record 
 * 
 * @protected
 * @return {Boolean} True if the previous record was selected.
 * 
 * @properties={typeid:24,uuid:"57C11407-A4FB-4978-A34E-6B908208EDA4"}
 */
function selectPreviousRecord() {

    // check position at end of foundset
    if (foundset.getSelectedIndex() == 1) {
        return false;
    }

    // check pre-move handler
    if (!beforeMoveRecord()) {
        return false;
    }

    // move selection
    controller.setSelectedIndex(foundset.getSelectedIndex() - 1);

    return true;
}

/**
 * Standard form action to navigate to the first record in the foundset. 
 * If there are any unsaved changes and the record selection [policy]{@link getCrudPolicies} is set to PREVENT_WHEN_EDITING then the {@link onUserLeave} method will be called to determine how to proceed:
 *  - save the changes and select the first record
 *  - cancel the changes and select the first record
 *  - block the operation and stay on the current record 
 * 
 * @protected
 * @return {Boolean} True if the first record was selected.
 * 
 * @properties={typeid:24,uuid:"E8F23881-342A-47D7-B79D-3AFD90C4F11D"}
 */
function selectFirstRecord() {
    // check position at end of foundset
    if ( (foundset.getSelectedIndex() == 1) || (foundset.getSize() == 0)) {
        return false;
    }

    // check pre-move handler
    if (!beforeMoveRecord()) {
        return false;
    }

    // move selection
    controller.setSelectedIndex(1);

    return true;
}

/**
 * Standard form action to navigate to the last record in the foundset. 
 * If there are any unsaved changes and the record selection [policy]{@link getCrudPolicies} is set to PREVENT_WHEN_EDITING then the {@link onUserLeave} method will be called to determine how to proceed:
 *  - save the changes and select the last record
 *  - cancel the changes and select the last record
 *  - block the operation and stay on the last record 
 * 
 * @protected
 * @return {Boolean} True if the last record was selected.
 * 
 * @properties={typeid:24,uuid:"0E6051A2-DD95-4851-A02D-AA9AB9B1CF84"}
 */
function selectLastRecord() {
    // check position at end of foundset
    if ( (foundset.getSize() == 0) || (foundset.getSelectedIndex() == foundset.getSize())) {
        return false;
    }

    // check pre-move handler
    if (!beforeMoveRecord()) {
        return false;
    }

    // move selection
    controller.setSelectedIndex(foundset.getSize());

    return true;
}

/**
 * Used as part of the standard navigation actions. Enforces the record selection [policy]{@link getCrudPolicies}.
 * 
 * @private
 * @return {Boolean} True if the navigation action can proceed.
 * 
 * @properties={typeid:24,uuid:"9A234C65-8A04-49D8-89D0-421BDDD02507"}
 */
function beforeMoveRecord() {
    if (hasEdits()) {
        if (getCrudPolicies().getRecordSelectionPolicy() === scopes.svyCRUDManager.RECORD_SELECTION_POLICY.PREVENT_WHEN_EDITING) {
            var userLeaveAction = onUserLeave();
            if (userLeaveAction == scopes.svyCRUDManager.USER_LEAVE.BLOCK) {
                return false;
            }
            if (userLeaveAction == scopes.svyCRUDManager.USER_LEAVE.SAVE_EDITS) {
                return save();
            } else {
                return cancel();
            }
        } else if (getCrudPolicies().getRecordSelectionPolicy() === scopes.svyCRUDManager.RECORD_SELECTION_POLICY.PREVENT_WHEN_HAS_EDITING_ERRORS) {
    		var records = getEditedRecords();
    		var markers = validate(records);
            updateValidationMarkersHandler(markers, null);
            if (hasErrors(markers)) {
                return false;
            }
        }
    }
    //a policy PREVENT_WHEN_EDITING could be implemented here that would always block moving records
    //when a validation error occurs, even when the user did not edit anything; then it should block
    //even when there are no edits
    return true;
}

/**
 * Override of the svyBase implementation to include additional behavior implementation.
 * Provides internal handling of the event fired after users change data in form fields.
 * If a parent form is available and it extends the svyBase then this event will "bubble up" to the parent through the {@link svyBase#onEventBubble} method.
 * In NGClient you can return also a (i18n) string, instead of false, which will be shown as a tooltip on the respective UI field.
 * It is recommended that extending forms do not override this method. Instead, they should override the dedicated {@link svyBase#fieldValueChanged} method.
 * 
 * @override 
 * @private 
 * @param oldValue old value
 * @param newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean|String} Return false if the value should not be accepted.
 *
 *
 * @properties={typeid:24,uuid:"309166A4-E459-41AC-9B55-165B1FD54845"}
 */
function onElementDataChangeHandler(oldValue, newValue, event) {
    try {
        //	Call applySuper to see if vetoed
        if (!applySuper('onElementDataChangeHandler', [oldValue, newValue, event])) {
            return false;
        }

        // track data change
        trackDataChange(event);

        // Continuous validation
        if (getCrudPolicies().getValidationPolicy() == scopes.svyCRUDManager.VALIDATION_POLICY.CONTINUOUS) {
            var markers = validate(getEditedRecords());
            updateValidationMarkersHandler(markers, event);
            // TODO Consider returning false  to block data change ?
        }

        return true;
    } finally {
        updateStandardFormActionsState();
        updateUIHandler(event, BUBBLE_EVENT_TYPES.ELEMENT_DATA_CHANGE);
    }
}

/**
 * Remove record(s) from the batch scope tracking controlled by this form when the batch scope [policy]{@link getCrudPolicies} is set to AUTO.
 * The records should have been added to the batch scope using the {@link track} method.
 *
 * @protected
 * @param {JSRecord|Array<JSRecord>|JSFoundSet} records The record(s) which should not be tracked anymore by the batch scope of this form.
 *
 * @properties={typeid:24,uuid:"A9352768-976A-402E-9F4B-5EC2B0A02378"}
 */
function untrack(records) {

    //	Ignore if tracking not set
    if (getCrudPolicies().getBatchScopePolicy() != scopes.svyCRUDManager.BATCH_SCOPE_POLICY.AUTO) {
        // TODO Log warning
        return;
    }

    // untrack foundset
    if (records instanceof JSFoundSet) {
        /** @type {JSFoundSet} */
        var fs = records;
        untrack(databaseManager.getEditedRecords(fs));

        // untrack array of records
    } else if (records instanceof Array) {
        for (var i in records) {
            untrack(records[i]);
        }

        // untrack record
    } else {
        /** @type {JSRecord} */
        var record = records;
        var index = trackedRecords.indexOf(record);
        if (index > -1) {
            trackedRecords.splice(index, 1);

            //	TODO Fire special tracking event ?
        }
    }
}

/**
 * Add record(s) to the batch scope tracking controlled by this form when the batch scope [policy]{@link getCrudPolicies} is set to AUTO.
 * The records are automatically removed from the batch scope when the changes are saved or canceled.
 * The records can also be removed from the batch scope using the {@link untrack} method.
 *
 * @protected
 * @param {JSRecord|Array<JSRecord>|JSFoundSet} records The records to add and track in the batch scope of this form.
 * 
 * @properties={typeid:24,uuid:"40E46972-E802-43D9-AF07-B32B1B3DBF4E"}
 */
function track(records) {

    //	Ignore if tracking not set
    if (getCrudPolicies().getBatchScopePolicy() != scopes.svyCRUDManager.BATCH_SCOPE_POLICY.AUTO) {
        // TODO Log warning
        return;
    }

    // track foundset
    if (records instanceof JSFoundSet) {
        /** @type {JSFoundSet} */
        var fs = records;
        track(databaseManager.getEditedRecords(fs));

        // track array of records
    } else if (records instanceof Array) {
        for (var i in records) {
            track(records[i]);
        }

        // track record
    } else {
        /** @type {JSRecord} */
        var record = records;
        if (trackedRecords.indexOf(record) == -1) {
            trackedRecords.push(record);

            //	TODO Fire special tracking event ?
        }
    }
}

/**
 * Used for clearing the batch scope after saving or canceling the changes.
 * 
 * @private
 * 
 * @properties={typeid:24,uuid:"0B4A4D48-187A-4663-B435-922BABBC7259"}
 */
function clearTracking() {
    trackedRecords = [];
}

/**
 * Used in the data change event handlers to add the applicable records to the batch scope.
 * 
 * @private
 * @param {JSEvent} event The source event that has triggered the action.
 * 
 * @properties={typeid:24,uuid:"5CD3C129-C26C-41DC-B3D2-440FCBCA6CB7"}
 */
function trackDataChange(event) {

    //  Ignore if tracking not set
    if (getCrudPolicies().getBatchScopePolicy() != scopes.svyCRUDManager.BATCH_SCOPE_POLICY.AUTO) {
        // TODO Log warning
        return;
    }

    if (!event.getElementName()) {
    	// TODO un-named components not supported
    	return;
    }
    
    var elementSource = scopes.svyUI.getRuntimeElementSource(event.getFormName(), event.getElementName());
    var columnName = elementSource.getUnrelatedDataProviderID();
    var record = elementSource.getRecord();
    if (columnName && record) {
        var col = databaseManager.getTable(record).getColumn(columnName);
        if (col) {
            //	primary data provider (skip variables, calcs, aggregates)
            track(record);
        }
    } else {
        //	TODO custom components that have data change ?
    }
}

/**
 * @private 
 * @param {Array<scopes.svyValidationManager.ValidationMarker>} markers
 * @param {JSEvent} [event]
 *
 * @properties={typeid:24,uuid:"588BD0EC-5DDC-484F-B4C5-C07FC6CA0F53"}
 */
function updateValidationMarkersHandler(markers, event) {
    updateValidationMarkersUI(markers, event);
    
	// fire event bubble
	var eventData = new scopes.svyEventManager.Event(VALIDATE_EVENT_TYPE_NAME, controller.getName(), [event, markers]);
	scopes.svyEventManager.fireEvent(VALIDATE_EVENT_TYPE_NAME, VALIDATE_EVENT_TYPE_NAME, eventData, true);
}

/**
 * This method is used to validate record changes before [saving]{@link save} them in the database.
 * If the validation [policy]{@link getCrudPolicies} is set to CONTINUOUS then this validation method will be called after each data change.  
 * Its default implementation uses the available validation providers associated with the datasources of the specified records to perform the actual validation.
 * The validation results will combine information returned from all applicable validation providers.
 * If the validation results contain any validation markers with ERROR level then the records will not be allowed to be saved in the database.
 * Don't override this method. If you wish to extend or fully override the validation run by this form override the method [validateRecords]{@link validateRecords}
 * 
 * 
 * @protected
 * @param {Array<JSRecord>} records The records to validate.
 * @return {Array<scopes.svyValidationManager.ValidationMarker>} Validation markers containing any validation results (errors, warnings, info) or an empty array.
 * 
 * @properties={typeid:24,uuid:"21B623BA-8874-47FE-AC07-EE610C0A1C46"}
 */
function validate(records) {
    //	delegate to registered validators and collect markers
    clearValidationMarkers();
    
    validationMarkers = validateRecords(records);
    
    return validationMarkers;
}

/**
 * This method is called during validation.
 * You can implement your custom validations overriding this method. 
 * You can here run validation on formVariables or any other specific form state which is not covered by the validationProvider.
 * 
 * @protected
 * @param {Array<JSRecord>} records The records to validate.
 * @return {Array<scopes.svyValidationManager.ValidationMarker>} Validation markers containing any validation results (errors, warnings, info) or an empty array.
 * 
 * @example <pre>function validateRecords(records) {
 *	// call the super to extend the returned ValidationMarkers with custom ValidationMarkers applicable to this form
 *	var markers = _super.validateRecords(records);
 *	var markerIP
 *	if (!loginName) {
 *		markerLoginName = new scopes.svyValidationManager.ValidationMarker(null, 'Missing required field loginName', scopes.svyValidationManager.VALIDATION_LEVEL.ERROR,'loginName');
 *		markers.push(markerLoginName);
 *	}
 *	return markers;
 *}
 * </pre>
 * 
 *
 * @properties={typeid:24,uuid:"B6F52E76-EE9E-45EF-AAC1-2ECDFF44851E"}
 */
function validateRecords(records) {
	validationMarkers = [];
    for (var i in records) {
        validationMarkers = validationMarkers.concat(scopes.svyValidationManager.validate(records[i]));
    }
    return validationMarkers;
}

/**
 * This method is called as part of the [delete]{@link deleteSelectedRecords} and [save]{@link save} operation 
 * flow if an error is encountered while validating the records to be deleted or saved.
 * It can be overridden by extending forms to perform any needed custom error handling.
 * 
 * @param {Array<scopes.svyValidationManager.ValidationMarker>} markers containing any validation errors
 * @param {String} formActionName the form action that triggered this method as one of the FORM_ACTION_NAMES 
 * 
 * @protected 
 *
 * @properties={typeid:24,uuid:"925A30F5-C7A9-414D-B650-E43A78E1955B"}
 */
function onValidationError(markers, formActionName) {
	
}

/**
 * This method is used to obtain user confirmation before [deleting]{@link deleteSelectedRecords} records from the database.
 * Its default implementation displays a dialog to the user prompting to confirm the deletion.
 * Extending forms can override it to provide custom delete confirmation.
 * 
 * @protected
 * @param {Array<JSRecord>} records The records which will be deleted.
 * @return {Boolean} True if the delete operation is confirmed and can proceed.
 * 
 * @properties={typeid:24,uuid:"16BDEADF-D8B4-43D2-BF78-73455B0DF8A2"}
 */
function confirmDelete(records) {
    var confirmBtn = 'Delete';
    var res = plugins.dialogs.showQuestionDialog('Confirm Delete', 'Do you want to delete the selected record(s)?<br>Note: There is no undo for this operation.', 'Cancel', confirmBtn);
    return (res == confirmBtn);
}

/**
 * This method is used to validate if the specified records can be [deleted]{@link deleteSelectedRecords} from the database.
 * Its default implementation uses the available validation providers associated with the datasources of the specified records to perform the actual validation.
 * The validation results will combine information returned from all applicable validation providers.
 * If the validation results contain any validation markers with ERROR level then the records will not be allowed to be deleted from the database. 
 * 
 * @protected
 * @param {Array<JSRecord>} records The records to validate that can be deleted.
 * @return {Array<scopes.svyValidationManager.ValidationMarker>} Validation markers containing any validation results (errors, warnings, info) or an empty array.
 * 
 * @properties={typeid:24,uuid:"6DB99A4B-1130-4358-81BD-7C0ECE8D2DE5"}
 */
function canDelete(records) {
    //	delegate to registered validators and collect markers
	var deletionMarkers = [];
    for (var i in records) {
    	deletionMarkers = deletionMarkers.concat(scopes.svyValidationManager.canDelete(records[i]));
    }

    return deletionMarkers;
}

/**
 * This method is used to get the records included in the batch scope controlled by this form which need to base saved in the database.
 * 
 * @protected
 * @return {Array<JSRecord>} An array with the records which need to be saved or an empty array if no records are available. 
 * 
 * @properties={typeid:24,uuid:"B4E3A104-69D2-473B-9B87-EDECC5CA111A"}
 */
function getEditedRecords() {
    //	collect records to validate based on CRUD scope
    /** @type {Array<JSRecord>} */
    var records = [];
    var poli = getCrudPolicies().getBatchScopePolicy();
    switch (poli) {
        case scopes.svyCRUDManager.BATCH_SCOPE_POLICY.ALL: {
        	// TODO shall get also Failed Records !?
            records = databaseManager.getEditedRecords();
            break;
        }
        case scopes.svyCRUDManager.BATCH_SCOPE_POLICY.FOUNDSET: {
        	// TODO should get also Failed Records ?
            records = databaseManager.getEditedRecords(foundset)
            break;
        }
        case scopes.svyCRUDManager.BATCH_SCOPE_POLICY.CURRENT_RECORD: {
            var rec = foundset.getSelectedRecord();
            if (rec) {
                records.push(rec);
            }
            break;
        }
        case scopes.svyCRUDManager.BATCH_SCOPE_POLICY.AUTO: {
            for (var i in trackedRecords) {
                records.push(trackedRecords[i]);                
            }
            break;
        }

        // shouldn't happen
        default: {
            throw new Error(utils.stringFormat('Unknown Batch Scope Policy', [poli]));
        }
    }
    return records;
}

/**
 * Gets the validation markers currently available in the context of this form.
 * Usually the validation markers are set by calls to the {@link validate} and {@link canDelete} methods.  
 * 
 * @protected
 * @return {Array<scopes.svyValidationManager.ValidationMarker>} The validation markers currently available in the context of this form.
 *
 * @properties={typeid:24,uuid:"433FDF42-887B-4C39-A12A-A7AE3932C38B"}
 */
function getValidationMarkers() {
    return validationMarkers;
}

/**
 * By default, validation markers are cleared only after successful save/cancel/delete operations or when performing validations and there are no validation messages. 
 * Use this method if it is necessary to clear the internal validation markers without performing any of the above operations.
 *   
 * @protected
 *
 * @properties={typeid:24,uuid:"2946BFE1-3027-44BE-8BE3-BC3F38A69AB9"}
 */
function clearValidationMarkers() {
	validationMarkers = [];
//	clearValidationMarkersUI(validationMarkers);
}

/**
 * Gets any validation markers with ERROR level.
 * 
 * @public
 * @param {Array<scopes.svyValidationManager.ValidationMarker>} [markersToCheck] If not specified will use the internal validation markers, otherwise will inspect the provided markers.
 * @return {Array<scopes.svyValidationManager.ValidationMarker>} An array containing only the validation markers with ERROR level or an empty array if there are no error markers.
 * 
 * @properties={typeid:24,uuid:"1AC72AB8-8F20-4BA7-9FBF-BE403C079F9C"}
 */
function getErrors(markersToCheck) {
    var markers = [];
    if (!markersToCheck){
        markersToCheck = getValidationMarkers();
    }
    for (var i in markersToCheck) {
        if (markersToCheck[i].getLevel() == scopes.svyValidationManager.VALIDATION_LEVEL.ERROR) {
            markers.push(markersToCheck[i]);
        }
    }
    return markers;
}

/**
 * Override of the svyBase implementation intercept data change notifications from child forms.
 * The method will be called when child forms (extending svyBase) hosted by this form bubble their form events to this parent form.
 * Extending forms can override this method to provide any necessary custom handling.
 * By default, this method returns true.
 *
 * @override 
 * @protected
 * @param {JSEvent} event The original source event which has triggered the action in the child form.
 * @param {String} bubbleEventType oOe of the {@link BUBBLE_EVENT_TYPES) enumeration values describing the type of the original source form event.
 * @return {Boolean} Return true if the form event can proceed or false if the form event should be blocked.
 * 
 * @properties={typeid:24,uuid:"D7A776BE-7055-41F2-A00B-C041B0DDF4AD"}
 */
function onEventBubble(event, bubbleEventType) {
    switch (bubbleEventType) {

        case BUBBLE_EVENT_TYPES.ELEMENT_DATA_CHANGE: {
            updateStandardFormActionsState();
            
            // track data change
            trackDataChange(event);
            
            if (getCrudPolicies().getValidationPolicy() == scopes.svyCRUDManager.VALIDATION_POLICY.CONTINUOUS) {
                //this will update the UI as well
                var markers = validate(getEditedRecords());
                // TODO do i need to propagate the event !?
                // updateValidationMarkersUI(markers, event);
                updateValidationMarkersHandler(markers,event);
            } else {
                updateUIHandler(event, BUBBLE_EVENT_TYPES.ELEMENT_DATA_CHANGE);
            }
            break;
        }
    }
    return true;
}

/**
 * Override of the svyBase implementation to enforce the record selection [policy]{@link getCrudPolicies}.
 * Provides internal handling to the record selection event.
 * If a parent form is available and it extends the svyBase then this event will "bubble up" to the parent through the {@link svyBase#onEventBubble} method.
 * It is recommended that extending forms do not override this method. Instead, they should override the dedicated {@link svyBase#onRecordSelection} method.
 * 
 * @override 
 * @private 
 * @param {JSEvent} event The event that triggered the action.
 * 
 * @properties={typeid:24,uuid:"B9F1DFF9-3FD9-4E82-BEDE-7697186855BD"}
 */
function onRecordSelectionHandler(event) {
    var selRec = foundset.getSelectedRecord();

	//see if we have the same record by comparing if the pks of the two records are the same
    if (lastSelectedRecord && selRec && !(selRec.getPKs().every(function(x, i) { return x === lastSelectedRecord.getPKs()[i] }))) {
    	var preventSelection = false;
		if (getCrudPolicies().getRecordSelectionPolicy() === scopes.svyCRUDManager.RECORD_SELECTION_POLICY.PREVENT_WHEN_EDITING) {
            var editedRecords = databaseManager.getEditedRecords(foundset);
			if(editedRecords.length == 1 && editedRecords[0] == selRec) {
                //When there is only a new record, navigate should be working to the new record
                //Example: When showing the newRecord in a popup for directly edit the navigate should work and not be blocked
				preventSelection = false
			} else {
			    //prevent record selection when the there are edits or the record is newly created
                preventSelection = hasEdits() || (lastSelectedRecord.hasChangedData() || lastSelectedRecord.isNew());
            }
		}
		if (getCrudPolicies().getRecordSelectionPolicy() === scopes.svyCRUDManager.RECORD_SELECTION_POLICY.PREVENT_WHEN_HAS_EDITING_ERRORS) {
			//prevent record selection when there are errors
			preventSelection = hasErrors(getValidationMarkers());
		}
    	if (preventSelection) {
            if ((hasEdits() || (lastSelectedRecord.hasChangedData() || lastSelectedRecord.isNew())) && lastSelectedRecord.foundset != foundset) {
                throw new Error('Invalid form state - the foundset of the form was replaced with a different foundset while there were pending changes and the record selection policy does not allow record selection changes when editing records.');
            }

            //intentionally using foundset.setSelectedIndex to prevent firing the onRecordSelection event
            foundset.setSelectedIndex(foundset.getRecordIndex(lastSelectedRecord));
            if (!beforeMoveRecord()) {
                return;
            }
            lastSelectedRecord = selRec;
            if (selRec) {
                //intentionally using foundset.setSelectedIndex to prevent firing the onRecordSelection event
                foundset.setSelectedIndex(foundset.getRecordIndex(selRec));
            }
        }
    }
    
    // TODO clear or Update validation at the onRecordSelection
    
    //fire handler only if the record has really been changed or we have no lastSelectedRecord. If there was lastSelectedRecord but no selRec, yet the record selection is considered changed.
    var fireHandler = !lastSelectedRecord || (lastSelectedRecord && !selRec) || (lastSelectedRecord && selRec && !(selRec.getPKs().every(function(x, i) { return x === lastSelectedRecord.getPKs()[i] })));
    lastSelectedRecord = selRec;
    updateStandardFormActionsState();
    
    //using applySuper to overcome encapsulation warnings
    if (fireHandler) {
    	applySuper('onRecordSelectionHandler', [event]);
    }
}

/**
 * Acquires a lock for the specified record.
 * Any locks acquired with this method should be released using the {@link releaseLock} or {@link releaseAllLocks} methods.
 * The lock retries count can be set by {@link setRecordLockRetries}.
 * The duration of the lock retries period can be set by {@link setRecordLockRetryPeriod}. 
 * 
 * @protected
 * @param {JSRecord} record The record to lock.
 * @return {String} The name of the acquired lock.
 * @throws {Error} If could not lock the record.
 * 
 * @properties={typeid:24,uuid:"311D6C10-E068-4615-AF72-53358A0A6873"}
 */
function lockRecord(record) {
    var lockName = application.getUUID().toString();
    //using automatic retry to acquire record lock - for example, try 3 times to lock the record in 100ms intervals
    for (var i = 0; i < recordLockRetries; i++) {
        var locked = databaseManager.acquireLock(record.foundset, record.foundset.getRecordIndex(record), lockName);
        if (locked) {
            recordLocks.push(lockName);
            return lockName;
        }
        application.sleep(recordLockRetryPeriodMilliseconds);
    }
    throw new Error('Could not acquire record lock.');
}

/**
 * Acquires locks for all of the specified records.
 * Any locks acquired with this method should be released using the {@link releaseAllLocks} method.
 * The lock retries count can be set by {@link setRecordLockRetries}.
 * The duration of the lock retries period can be set by {@link setRecordLockRetryPeriod}.
 *  
 * @protected
 * @param {Array<JSRecord>} records The records to lock.
 * @return {Boolean} False if could not lock one of the specified records (will add a validation error marker for it).
 * 
 * @properties={typeid:24,uuid:"68681782-449B-41C9-887D-4A211EE813D3"}
 */
function lockRecords(records) {
    if (records) {
        for (var i in records) {
            var rec = records[i];
            try {
                lockRecord(rec);
            } catch (e) {
                releaseAllLocks();
                validationMarkers.push(new scopes.svyValidationManager.ValidationMarker(rec, e.message, scopes.svyValidationManager.VALIDATION_LEVEL.ERROR));
                return false;
            }
        }
    }
    return true;
}

/**
 * Releases the specified lock.
 * The locks should be acquired using {@link lockRecord} method.
 *
 * @protected
 * @param {String} lockName The name of the lock to release;
 *
 * @properties={typeid:24,uuid:"1DA040A1-4A3D-4AB7-960B-44F632FE5CCA"}
 */
function releaseLock(lockName) {
    var lockIndx = recordLocks.indexOf(lockName);
    if (lockIndx > -1) {
        recordLocks.splice(lockIndx, 1);
    }
    databaseManager.releaseAllLocks(lockName);

}

/**
 * Releases all locks acquired by using the {@link lockRecord} or {@link lockRecords} methods.
 * 
 * @protected
 * 
 * @properties={typeid:24,uuid:"A8B701A0-EC80-45D9-A196-40CB3B81D463"}
 */
function releaseAllLocks() {
    while (recordLocks.length > 0) {
        var lockName = recordLocks.pop();
        databaseManager.releaseAllLocks(lockName);
    }
}

/**
 * Sets the maximum number of times to try to [acquire a record lock]{@link lockRecord}.
 * If a record lock cannot be acquired after the specified number of retries an error will be thrown. 
 * 
 * @protected
 * @param {Number} retryCount The maximum number of times to try to acquire a record lock.
 *
 * @properties={typeid:24,uuid:"4119C5BD-4B66-48A0-B63D-A538DB71D52D"}
 */
function setRecordLockRetries(retryCount) {
    if (retryCount > 1) {
        recordLockRetries = retryCount;
    } else {
        //should try at least once to acquire record lock
        recordLockRetries = 1;
    }
}

/**
 * Sets the duration (in milliseconds) between retries to [acquire a record lock]{@link lockRecord}.
 * 
 * @protected
 * @param {Number} milliseconds The duration between lock retries in milliseconds.
 *
 * @properties={typeid:24,uuid:"0F5BBC7A-A488-4874-8AF3-739483F94E06"}
 */
function setRecordLockRetryPeriod(milliseconds) {
    if (milliseconds > 0) {
        recordLockRetryPeriodMilliseconds = milliseconds;
    } else {
        recordLockRetryPeriodMilliseconds = 0;
    }
}

/**
 * Override of the svyBase implementation to add custom behavior.
 * Provides internal handling to the event fired when the form is (re)loaded.
 * If a parent form is available and it extends the svyBase then this event will "bubble up" to the parent through the {@link svyBase#onEventBubble} method.
 * It is recommended that extending forms do not override this method. Instead, they should override the dedicated {@link svyBase#onLoad} method.
 * 
 * @override 
 * @private 
 * @param {JSEvent} event the event that triggered the action.
 *
 * @properties={typeid:24,uuid:"A13066F8-44CB-47DA-BB61-E229CCFD6618"}
 */
function onLoadHandler(event) {
    addStandardFormActions();
    //using applySuper to overcome encapsulation warnings
    applySuper('onLoadHandler', [event]);
    updateStandardFormActionsState();
}

/**
 * Provides internal handling to the event fired when the form is shown.
 * If a parent form is available and it extends the svyBase then this event will "bubble up" to the parent through the {@link onEventBubble} method.
 * It is recommended that extending forms do not override this method. Instead, they should override the dedicated {@link onShow} method.
 *
 * @private 
 * @param {Boolean} firstShow True if the form is shown for the first time after load.
 * @param {JSEvent} event The event that triggered the action.
 *
 * @properties={typeid:24,uuid:"3ED8A13F-404E-4FAB-8396-3288C3A367C9"}
 * @override
 */
function onShowHandler(firstShow, event) {
	lastSelectedRecord = foundset.getSelectedRecord();
	 //using applySuper to overcome encapsulation warnings
    applySuper('onShowHandler', [firstShow, event]);
}

/**
 * This method adds(registers) the standard form actions implemented by svyBaseCRUD form.
 * It is automatically called when the form is being loaded.
 * 
 * @protected
 * 
 * @properties={typeid:24,uuid:"1CFD2AF3-C53C-453D-995C-9C36110C9EC6"}
 */
function addStandardFormActions() {

    /**
     * @private
     * @param {String} name
     * @param {Function} handler
     * @param {String} text
     * @param {String} tooltip
     */
    function innerAddAction(name, handler, text, tooltip) {
        var action = addAction(name, handler);
        action.setText(text);
        action.setTooltipText(tooltip);
        action.setVisible(true);
        action.setEnabled(false);
    }

    innerAddAction(FORM_ACTION_NAMES.NEW, newRecord, 'New', 'Add new record');
    innerAddAction(FORM_ACTION_NAMES.DELETE, deleteSelectedRecords, 'Delete', 'Delete selected record(s)');
    innerAddAction(FORM_ACTION_NAMES.SAVE, save, 'Save', 'Save changes');
    innerAddAction(FORM_ACTION_NAMES.CANCEL, cancel, 'Cancel', 'Cancel changes');
    innerAddAction(FORM_ACTION_NAMES.FIRST, selectFirstRecord, 'First', 'Go to the first record');
    innerAddAction(FORM_ACTION_NAMES.PREVIOUS, selectPreviousRecord, 'Previous', 'Go to the previous record');
    innerAddAction(FORM_ACTION_NAMES.NEXT, selectNextRecord, 'Next', 'Go to the next record');
    innerAddAction(FORM_ACTION_NAMES.LAST, selectLastRecord, 'Last', 'Go to the last record');
}

/**
 * This method initiates the update of the user interface of this form.
 * It is recommended that extending forms do not override this method. Instead they should override the dedicated {@link updatingUI} method to add custom code for updating of the UI.
 * 
 * This method is overwritten here to prevent too many applySuper calls
 * 
 * @private 
 * @param {JSEvent} event the event that triggered the action
 * @param {String} eventType the event type as one of the BUBBLE_EVENT_TYPES or FORM_ACTION_NAMES
 * 
 * @properties={typeid:24,uuid:"D09C7E80-9CA9-4BF2-828E-7E65B07DB16C"}
 */
function updateUIHandler(event, eventType) {
	if (!event) event = createDummyJSEvent();
	
	// propagate bubble event to other visible forms
	switch (eventType) {
	case FORM_ACTION_NAMES.CANCEL:
	case FORM_ACTION_NAMES.SAVE:
	case FORM_ACTION_NAMES.NEW:
	case FORM_ACTION_NAMES.DELETE:
		// TODO do i need to include other type of actions ?
		
		/** @type {{bubble: Function}} */
		var thisForm = this;
		thisForm.bubble(event, eventType);
		break;
	default:
		break;
	}
	
	//using applySuper to overcome encapsulation warnings
	applySuper('updateUIHandler', [event, eventType]);
}

/**
 * This method updates the enabled state of the standard form actions based on the current form state and the state of the records in its batch of work scope.
 * It is automatically called when the form or applicable records state is changed.
 * 
 * @protected
 * 
 * @properties={typeid:24,uuid:"3BDDABA0-2874-4726-B41E-489421681734"}
 */
function updateStandardFormActionsState() {
    var hasFS = (foundset != null);
    var isInFind = (hasFS && foundset.isInFind());
    var selectionIndex = 0;
    var fsSize = 0;
    if (hasFS) {
        selectionIndex = foundset.getSelectedIndex();
        fsSize = foundset.getSize();
    }
    var hasRecordSelection = (hasFS && (selectionIndex > 0) && !isInFind);
    var hasUnsavedChanges = hasEdits();
    var canMoveWhenEditing = (getCrudPolicies().getRecordSelectionPolicy() == scopes.svyCRUDManager.RECORD_SELECTION_POLICY.ALLOW_WHEN_EDITING);
    var canMove = (hasFS && !isInFind && (!hasUnsavedChanges || canMoveWhenEditing));

    /**
     * @private
     * @param {String} name
     * @param {Boolean} enabled
     */
    function innerSetActionEnabled(name, enabled) {
        var action = getAction(name);
        if (action) {
            action.setEnabled(enabled);
        }
    }

    innerSetActionEnabled(FORM_ACTION_NAMES.NEW, canMove);
    //Note: delete must be disabled if there are unsaved changes, otherwise the delete will try to silently save the changes first without doing any validation
    innerSetActionEnabled(FORM_ACTION_NAMES.DELETE, (hasRecordSelection && canMove && !hasUnsavedChanges));
    innerSetActionEnabled(FORM_ACTION_NAMES.SAVE, hasUnsavedChanges);
    innerSetActionEnabled(FORM_ACTION_NAMES.CANCEL, hasUnsavedChanges);
    innerSetActionEnabled(FORM_ACTION_NAMES.FIRST, (canMove && (selectionIndex > 1)));
    innerSetActionEnabled(FORM_ACTION_NAMES.PREVIOUS, (canMove && (selectionIndex > 1)));
    innerSetActionEnabled(FORM_ACTION_NAMES.NEXT, (canMove && (selectionIndex < fsSize)));
    innerSetActionEnabled(FORM_ACTION_NAMES.LAST, (canMove && (selectionIndex < fsSize)));
}

/**
 * Override of the svyBase implementation to enforce the form hide [policy]{@link getCrudPolicies}.
 * Provides internal handling to the event fired when the form window is hiding.
 * If a parent form is available and it extends the svyBase then this event will "bubble up" to the parent through the {@link svyBase#onEventBubble} method.
 * It is recommended that extending forms do not override this method. Instead, they should override the dedicated {@link svyBase#onHide} method.
 * 
 * @override 
 * @private
 * @param {JSEvent} event The event that triggered the action.
 *
 * @return {Boolean} True if the form can be hidden, false to block the action so the form will remain visible.
 *
 * @properties={typeid:24,uuid:"BA442073-BB77-423B-B6C6-6BE0369EF186"}
 */
function onHideHandler(event) {
    //apply the FormHide policy
    if (getCrudPolicies().getFormHidePolicy() == scopes.svyCRUDManager.FORM_HIDE_POLICY.PREVENT_WHEN_EDITING) {
        if (hasEdits()){
            plugins.dialogs.showInfoDialog('Unsaved Changes', 'Please, save or cancel any unsaved changes before navigating away from the current form.');
            return false;
        }
    }
    //using applySuper to overcome encapsulation warnings
    var result = applySuper('onHideHandler', [event]);
    if (result !== false) {
    	// clear the lastSelectedRecord
    	lastSelectedRecord = null;
    }
    return result;
}

/**
 * Loads a foundset, record, PK Dataset, Number, UUID or UUID String primary key. 
 * Tries to preserve selection based on primary key, otherwise first record is selected.
 * 
 * To set a reference to a specific foundset in this form, use {@link setFoundSet}. 
 * Passing a foundset in this method, will only result in the same records being present, 
 * but not in a shared foundset. When a related foundset is passed into this method for
 * example, the relation will be lost, only the records will be "copied" over.
 * 
 * This method will return false if the record selection policy is set to
 * PREVENT_WHEN_EDITING and this form has open edits
 * 
 * @param {JSFoundSet|JSRecord|JSDataSet|QBSelect|Number|UUID|String} foundsetOrRecordToLoad
 *
 * @return {Boolean} true if successful
 * 
 * @override
 * @public 
 *
 * @properties={typeid:24,uuid:"1ECF6C7F-B28E-47E8-9E1B-01909AC711C8"}
 */
function loadRecords(foundsetOrRecordToLoad) {
	if (!beforeMoveRecord()) {
		return false;
	}
	updateStandardFormActionsState();
	return _super.loadRecords(foundsetOrRecordToLoad)
}

/**
 * Sets this form's foundset to the one provided, having this form share the 
 * passed foundest. Use {@link loadRecords} if this form should only show
 * the same records, but not share the foundset
 * 
 * This method will return false if the record selection policy is set to
 * PREVENT_WHEN_EDITING and this form has open edits 
 * 
 * @param {JSFoundSet} foundsetToSet
 *
 * @return {Boolean} true if successful
 * @override
 * @public 
 *
 * @properties={typeid:24,uuid:"74504B2B-7355-4265-BA8B-4FFAE36900A5"}
 */
function setFoundSet(foundsetToSet) {
	if (!beforeMoveRecord()) {
		return false;
	}
	updateStandardFormActionsState();
	return _super.setFoundSet(foundsetToSet)
}

/**
 * Creates a dummy jsevent for updateUI calls
 * 
 * @param {String} [name]
 * @param {String} [type]
 * @param {String} [elementName]
 * 
 * @protected  
 *
 * @properties={typeid:24,uuid:"18D91B20-A132-45C7-A4F4-0B1D8B0F3998"}
 */
function createDummyJSEvent(name, type, elementName) {
	/** @type {JSEvent} */
	var result = {
		formName: controller.getName(),
		timestamp: application.getTimeStamp(),
		data: null,
		getFormName: function() {
			return controller.getName()
		},
		getElementName: function() {
			return elementName;
		},
		getModifiers: function() {
			return null;
		},
		getName: function() {
			return name || 'form';
		},
		getSource: function() {
			return null;
		},
		getTimestamp: function() {
			return this.timestamp;
		},
		getType: function() {
			return type || JSEvent.FORM;
		},
		getX: function() {
			return -1
		},
		getY: function() {
			return -1;
		}
	}
	return result;
}

/**
 * Calls the given _super method passing the given arguments
 * 
 * This approach is needed to overcome warnings when calling private _super methods
 * 
 * @param {String} methodName
 * @param {Array<*>} methodArgs
 * 
 * @protected  
 *
 * @properties={typeid:24,uuid:"ABC65304-3DAC-4383-9BB8-25A41F5162A5"}
 */
function applySuper(methodName, methodArgs) {
	return _super[methodName].apply(this, methodArgs);
}
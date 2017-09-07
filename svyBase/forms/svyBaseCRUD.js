/**
 * Used for the standard form action names
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
 * @private
 * @properties={typeid:35,uuid:"C86C5862-377B-417B-BD56-4843BE201DC0",variableType:-4}
 */
var m_CrudPolicies = scopes.svyCRUDManager.createCRUDPolicies();

/**
 * @protected
 * @return {scopes.svyCRUDManager.CRUDPolicies}
 * @properties={typeid:24,uuid:"89F329BC-F975-4C32-98D7-7A333A47EA2F"}
 */
function getCrudPolicies() {
    return m_CrudPolicies;
}

/**
 * @private
 * @type {Array<scopes.svyValidationManager.ValidationMarker>}
 * @properties={typeid:35,uuid:"E675958D-88A2-4F16-AE2B-4B0E0364C9A5",variableType:-4}
 */
var m_ValidationMarkers = [];

/**
 * TODO EXPERIMENTAL TEST ME
 * @private
 * @type {Array<JSRecord>}
 * @properties={typeid:35,uuid:"89983EDF-C8A5-4B52-A2B6-2201FFD1D4D0",variableType:-4}
 */
var m_Tracking = [];

/**
 * @private
 * @type {JSRecord}
 * @properties={typeid:35,uuid:"F2378E77-3583-490A-AD73-602D91186937",variableType:-4}
 */
var m_LastSelectedRecord = null;

/**
 * @private
 * @type {Array<String>}
 * @properties={typeid:35,uuid:"3865FDE2-6E9E-4D77-B18E-CF624D567811",variableType:-4}
 */
var m_RecordLocks = [];

/**
 * @private
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"D1EBFFC4-9B7D-46D8-86FB-3F30D697DF8C",variableType:4}
 */
var m_RecordLockRetries = 3;

/**
 * @private
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"D964F6E8-1808-4A13-8D42-9F0E6DBB0F24",variableType:4}
 */
var m_RecordLockRetryPeriodMilliseconds = 100;

/**
 * @public
 * @return {Boolean}
 * @properties={typeid:24,uuid:"6B9C30B7-28CF-404C-B37D-4624A163C070"}
 */
function hasEdits() {

    var records = getEditedRecords();
    for (var i in records) {
        if (records[i].hasChangedData() || records[i].isNew()) {
            return true;
        }
    }
    return false;
}

/**
 * Indicates if there are ERROR markers on this form since the last validation
 * @public
 * @return {Boolean}
 * @properties={typeid:24,uuid:"55BD75F0-EE8A-445C-89E7-6148A70D9DFC"}
 */
function hasErrors() {
    for (var i in m_ValidationMarkers) {
        if (m_ValidationMarkers[i].getLevel() == scopes.svyValidationManager.VALIDATION_LEVEL.ERROR) {
            return true;
        }
    }
    return false;
}

/**
 * @protected
 * @return {String} Default is to block the operation (scopes.svyCRUDManager.USER_LEAVE.BLOCK)
 * @properties={typeid:24,uuid:"B05DFAF8-FBDB-4B68-BBC5-E62155E7CAA6"}
 */
function onUserLeave() {
    //the default behavior should not cause loss of use data changes, so the safest option is to block
    return scopes.svyCRUDManager.USER_LEAVE.BLOCK;
}

/**
 * @return {Boolean}
 * @properties={typeid:24,uuid:"53C0E0C1-925B-4A06-AA0A-0670456433D9"}
 */
function newRecord() {

    if (!beforeMoveRecord()) {
        return false;
    }

    // check pre handler(s)
    if (!beforeDelete()) {
        return false;
    }

    try {

        // create record;
        var newRecIndex = foundset.newRecord();

        if (newRecIndex == -1) {
            throw new scopes.svyDataUtils.NewRecordFailedException('New Record Failed', foundset);
        }
    } catch (e) {
        // notify on-error
        /** @type {scopes.svyDataUtils.NewRecordFailedException} */
        var ex = e;
        if (! (e instanceof scopes.svyDataUtils.NewRecordFailedException)) {
            ex = new scopes.svyDataUtils.NewRecordFailedException('New Record Failed: ' + e.message, foundset);
        }
        onNewRecordError(ex);
        updateUI();
        return false;
    }

    // track record if tracking on
    track(foundset.getRecord(newRecIndex));

    afterNewRecord();

    updateUI();

    return true;
}

/**
 * TODO Consider Locking
 * @properties={typeid:24,uuid:"38217020-D34E-413A-AE8E-9D53FD1F1C56"}
 */
function deleteSelectedRecords() {

    // records to delete
    var records = foundset.getSelectedRecords();
    if (!records.length) {
        return false;
    }

    if (!confirmDelete(records)){
        return false;
    }
    
    //lock
    if (getCrudPolicies().getRecordLockingPolicy() == scopes.svyCRUDManager.RECORD_LOCKING_POLICY.AUTO) {
        if (!lockRecords(records)) {
            return false;
        }
    }

    try {

        // validate
        if (getCrudPolicies().getValidationPolicy() != scopes.svyCRUDManager.VALIDATION_POLICY.NONE) {
            canDelete(records);
            if (hasErrors()) {
                return false;
            }
        }

        // check pre-delete handler(s)
        if (!beforeDelete()) {
            return false;
        }

        var usingLocalTransaction = !databaseManager.hasTransaction();

        if (usingLocalTransaction) {
            // open transaction
            databaseManager.startTransaction();
        }
        try {

            // Delete selected records individually for better error handling
            for (var i in records) {
                var record = records[i];

                // delete record
                try {
                    if (!foundset.deleteRecord(record)) {
                        throw new scopes.svyDataUtils.DeleteRecordFailedException('Delete Record Failed: ' + record.exception, record);
                    }

                    // handle expected errors, i.e. DELETE_NOT_GRANTED
                } catch (e) {
                    throw new scopes.svyDataUtils.DeleteRecordFailedException(e.message, record);
                }
            }

            if (usingLocalTransaction) {
                // commit transaction
                if (!databaseManager.commitTransaction()) {

                    // TODO consider adding transaction failed exception to svyDataUtils
                    throw new scopes.svyDataUtils.SvyDataException('Transaction Failed', foundset);
                }
            }
        } catch (e) {

            // rollback transaction
            databaseManager.rollbackTransaction();
            //releasing locks as soon as possible instead of waiting for the finally block
            releaseAllLocks();

            // notify on-error
            /** @type {scopes.svyDataUtils.DeleteRecordFailedException} */
            var ex = e;
            if (! (e instanceof scopes.svyDataUtils.DeleteRecordFailedException)) {
                ex = new scopes.svyDataUtils.DeleteRecordFailedException('Delete failed: ' + e.message, foundset);
            }
            onDeleteError(ex);
            updateUI();
            return false;
        }
    } finally {
        releaseAllLocks();
    }

    // remove from tracking
    untrack(records);

    // post-delete handler
    afterDelete();

    updateUI();

    return true;
}

/**
 * @protected
 * @return {Boolean}
 * @properties={typeid:24,uuid:"4A359896-25AF-4326-A118-9A232249485A"}
 */
function beforeDelete() {
    return true;
}

/**
 * @protected
 * @properties={typeid:24,uuid:"23E38465-DFD5-41AD-AD15-D31ED60353E3"}
 */
function afterDelete() { }

/**
 * @protected
 * @param {scopes.svyDataUtils.DeleteRecordFailedException} error
 * @properties={typeid:24,uuid:"0600B27F-F792-4191-BD57-9BA1AEE78601"}
 */
function onDeleteError(error) { }

/**
 * @protected
 * @return {Boolean}
 * @properties={typeid:24,uuid:"CD02C4FF-0269-477D-90B0-28DEC40EBCD6"}
 */
function beforeNewRecord() {
    return true;
}

/**
 * @protected
 * @properties={typeid:24,uuid:"003D75DB-7973-4804-9F03-8FDEEA5A2C67"}
 */
function afterNewRecord() { }

/**
 * @protected
 * @param {scopes.svyDataUtils.NewRecordFailedException} error
 * @properties={typeid:24,uuid:"70BE571E-C17F-4E80-93AE-287FBE89DD2F"}
 */
function onNewRecordError(error) { }

/**
 * TODO Consider ValidationException with markers passed to onSaveError(e)
 * TODO Consider multi-selection
 * TODO consider locking option
 * @properties={typeid:24,uuid:"987117A7-2184-4702-8101-C89EF93F833A"}
 */
function save() {

    // collect edited records
    var records = getEditedRecords();
    if (!records.length) {
        return false;
    }

    if (getCrudPolicies().getRecordLockingPolicy() == scopes.svyCRUDManager.RECORD_LOCKING_POLICY.AUTO) {
        if (!lockRecords(records)) {
            return false;
        }
    }

    try {
        // validate
        if (getCrudPolicies().getValidationPolicy() != scopes.svyCRUDManager.VALIDATION_POLICY.NONE) {
            validate();
            if (hasErrors()) {
                return false;
            }
        }

        // Call before-save handler(s)
        if (!beforeSave()) {
            return false;
        }

        var usingLocalTransaction = !databaseManager.hasTransaction();

        // begin transaction
        if (usingLocalTransaction) {
            databaseManager.startTransaction();
        }
        try {

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

            // commit transaction
            if (usingLocalTransaction) {
                if (!databaseManager.commitTransaction()) {
                    throw new scopes.svyDataUtils.SaveDataFailedException('Could not commit transaction', record);
                }
            }
        } catch (e) {

            // rollback transaction
            databaseManager.rollbackTransaction();
            //on error releasing all locks as soon as possible instead of waiting for the finally block
            releaseAllLocks();

            // notify on-error
            /** @type {scopes.svyDataUtils.SaveDataFailedException} */
            var ex = e;
            if (! (e instanceof scopes.svyDataUtils.SaveDataFailedException)) {
                ex = new scopes.svyDataUtils.SaveDataFailedException('Save Failed: ' + e.message);
            }
            onSaveError(ex);
            updateUI();
            return false;
        }
    } finally {
        releaseAllLocks();
    }

    // clear validation markers
    m_ValidationMarkers = [];

    // clear tracked records
    clearTracking();

    // post-save handler
    afterSave();

    updateUI();

    return true;
}

/**
 * @protected
 * @return {Boolean}
 * @properties={typeid:24,uuid:"FAD7AC85-F98C-4CF1-A3B3-6B2FA8A6AB25"}
 */
function beforeCancel() {
    return true;
}

/**
 * @properties={typeid:24,uuid:"3C6EB4F1-3B75-4AB4-BCB5-4DD2146F5B86"}
 */
function cancel() {

    // collect edited records
    var records = getEditedRecords();
    if (!records.length) {
        return false;
    }

    // check pre-cancel handler(s)
    if (!beforeCancel()) {
        return false;
    }

    // revert records 1-by-1
    for (var i in records) {
        var record = records[i];
        record.revertChanges();
    }

    // clear validation markers
    m_ValidationMarkers = [];

    releaseAllLocks();

    // clear tracking
    clearTracking();

    // notify post-cancel handler
    afterCancel();

    updateUI();

    return true;
}

/**
 * @protected
 * @properties={typeid:24,uuid:"F2ECBD52-7DD1-4B30-945E-D4D707351BBA"}
 */
function afterCancel() { }

/**
 * @return {Boolean}
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
    foundset.setSelectedIndex(foundset.getSelectedIndex() + 1);

    return true;
}

/**
 * @return {Boolean}
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
    foundset.setSelectedIndex(foundset.getSelectedIndex() - 1);

    return true;
}

/**
 * @return {Boolean}
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
    foundset.setSelectedIndex(1);

    return true;
}

/**
 * @return {Boolean}
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
    foundset.setSelectedIndex(foundset.getSize());

    return true;
}

/**
 * @private
 * @return {Boolean}
 * @properties={typeid:24,uuid:"9A234C65-8A04-49D8-89D0-421BDDD02507"}
 */
function beforeMoveRecord() {
    if (hasEdits()) {
        if (getCrudPolicies().getRecordSelectionPolicy() == scopes.svyCRUDManager.RECORD_SELECTION_POLICY.PREVENT_WHEN_EDITING) {
            var userLeaveAction = onUserLeave();
            if (userLeaveAction == scopes.svyCRUDManager.USER_LEAVE.BLOCK) {
                return false;
            }
            if (userLeaveAction == scopes.svyCRUDManager.USER_LEAVE.SAVE_EDITS) {
                return save();
            } else {
                return cancel();
            }
        }
    }
    return true;
}

/**
 * Handle changed data, return false if the value should not be accepted. In NGClient you can return also a (i18n) string, instead of false, which will be shown as a tooltip.
 *
 * @param oldValue old value
 * @param newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean}
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"309166A4-E459-41AC-9B55-165B1FD54845"}
 */
function onElementDataChange(oldValue, newValue, event) {

    //	Call super to see if vetoed
    if (!_super.onElementDataChange(oldValue, newValue, event)) {
        return false;
    }

    // track data change
    trackDataChange(event);

    // Continuous validation
    if (getCrudPolicies().getValidationPolicy() == scopes.svyCRUDManager.VALIDATION_POLICY.CONTINUOUS) {
        validate();
        // TODO Consider returning false  to block data change ?
    }

    // update UI
    updateUI();

    return true;
}
/**
 * Remove record from tracking
 *
 * TODO EXPERIMENTAL TEST ME
 * @private
 * @param {JSRecord|Array<JSRecord>|JSFoundSet} records
 * TODO Consider makeing protected
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
        var index = m_Tracking.indexOf(record);
        if (index == -1) {
            m_Tracking.splice(index, 1);

            //	TODO Fire special tracking event ?
        }
    }
}

/**
 * Add records to tracking
 *
 * TODO EXPERIMENTAL TEST ME
 * @private
 * @param {JSRecord|Array<JSRecord>|JSFoundSet} records
 * TODO Consider makeing protected
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
        if (record.hasChangedData() && m_Tracking.indexOf(record) == -1) {
            m_Tracking.push(record);

            //	TODO Fire special tracking event ?
        }
    }
}

/**
 * @private
 * @properties={typeid:24,uuid:"0B4A4D48-187A-4663-B435-922BABBC7259"}
 */
function clearTracking() {
    m_Tracking = [];
}
/**
 * TODO EXPERIMENTAL TEST ME
 * @private
 * @param {JSEvent} event
 * @properties={typeid:24,uuid:"5CD3C129-C26C-41DC-B3D2-440FCBCA6CB7"}
 */
function trackDataChange(event) {

    //  Ignore if tracking not set
    if (getCrudPolicies().getBatchScopePolicy() != scopes.svyCRUDManager.BATCH_SCOPE_POLICY.AUTO) {
        // TODO Log warning
        return;
    }

    //	TODO Move functionality to svyUtils or svyBase to find relations, etc
    var name = event.getElementName();
    if (name) {
        /** @type {RuntimeTextField} */
        var component = elements[name];
        if (component.getDataProviderID) {
            var dataProvider = component.getDataProviderID();

            //	related data provider
            var path = dataProvider.split('.');
            if (path.length > 1) {
                path.pop();

                /** @type {JSFoundSet} */
                var fs = this[path];
                if (fs) {
                    track(fs.getSelectedRecord());
                }
                //	primary data provider (skip variables, calcs, aggregates)
            } else {
                var col = databaseManager.getTable(foundset).getColumn(dataProvider);
                if (col) {
                    track(foundset.getSelectedRecord());
                }
            }
            //	TODO custom components that have data change ?
        } else {

        }

        // TODO un-named components not supported ?
    } else {

    }
}

/**
 * @protected
 * @return {Array<scopes.svyValidationManager.ValidationMarker>}
 * @properties={typeid:24,uuid:"21B623BA-8874-47FE-AC07-EE610C0A1C46"}
 */
function validate() {

    //	collect records to validate based on CRUD scope
    var records = getEditedRecords()

    //	delegate to registered validators and collect markers
    m_ValidationMarkers = [];
    for (var i in records) {
        m_ValidationMarkers = m_ValidationMarkers.concat(scopes.svyValidationManager.validate(records[i]));
    }

    // update UI
    updateUI();

    return m_ValidationMarkers;
}

/**
 * @protected 
 * @param {Array<JSRecord>} records
 * @return {Boolean}
 * @properties={typeid:24,uuid:"16BDEADF-D8B4-43D2-BF78-73455B0DF8A2"}
 */
function confirmDelete(records){
    var confirmBtn = 'Delete';
    var res = plugins.dialogs.showQuestionDialog('Confirm Delete', 'Do you want to delete the selected record(s)?<br>Note: There is no undo for this operation.', 'Cancel', confirmBtn);
    return (res == confirmBtn);
}

/**
 * @protected
 * @param {Array<JSRecord>} records
 * @return {Array<scopes.svyValidationManager.ValidationMarker>}
 * @properties={typeid:24,uuid:"6DB99A4B-1130-4358-81BD-7C0ECE8D2DE5"}
 */
function canDelete(records) {    
    //	delegate to registered validators and collect markers
    m_ValidationMarkers = [];
    for (var i in records) {
        m_ValidationMarkers = m_ValidationMarkers.concat(scopes.svyValidationManager.canDelete(records[i]));
    }

    // update UI
    updateUI();

    return m_ValidationMarkers;
}

/**
 * @protected
 * @return {Array<JSRecord>}
 * @properties={typeid:24,uuid:"B4E3A104-69D2-473B-9B87-EDECC5CA111A"}
 */
function getEditedRecords() {
    //	collect records to validate based on CRUD scope
    /** @type {Array<JSRecord>} */
    var records = [];
    var poli = getCrudPolicies().getBatchScopePolicy();
    switch (poli) {
        case scopes.svyCRUDManager.BATCH_SCOPE_POLICY.ALL: {
            records = databaseManager.getEditedRecords();
            break;
        }
        case scopes.svyCRUDManager.BATCH_SCOPE_POLICY.FOUNDSET: {
            records = databaseManager.getEditedRecords(foundset)
            break;
        }
        case scopes.svyCRUDManager.BATCH_SCOPE_POLICY.CURRENT_RECORD: {
            records = [foundset.getSelectedRecord()];
            break;
        }
        case scopes.svyCRUDManager.BATCH_SCOPE_POLICY.AUTO: {
            for (var i in m_Tracking) {
                if (m_Tracking[i].hasChangedData() || m_Tracking[i].isNew()) {
                    records.push(m_Tracking[i]);
                }
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
 * @protected
 * @return {Boolean}
 * @properties={typeid:24,uuid:"90B9D3C6-863E-471D-9A4F-189BC98402AA"}
 */
function beforeSave() {
    return true;
}

/**
 * @protected
 * @properties={typeid:24,uuid:"4A7F8CEA-9DF0-4FBE-98EE-17854331DDAE"}
 */
function afterSave() { }

/**
 * @protected
 * @param {scopes.svyDataUtils.SaveDataFailedException} error
 * @properties={typeid:24,uuid:"24E8B121-4E3A-4465-B2D1-A32A5EAA8DF6"}
 */
function onSaveError(error) { }

/**
 * TODO: Make defensive copy ?
 * @protected
 * @return {Array<scopes.svyValidationManager.ValidationMarker>}
 *
 * @properties={typeid:24,uuid:"433FDF42-887B-4C39-A12A-A7AE3932C38B"}
 */
function getValidationMarkers() {
    return m_ValidationMarkers;
}

/**
 * @protected
 * @return {Array<scopes.svyValidationManager.ValidationMarker>}
 * @properties={typeid:24,uuid:"1AC72AB8-8F20-4BA7-9FBF-BE403C079F9C"}
 */
function getErrors() {
    var markers = [];
    for (var i in m_ValidationMarkers) {
        if (m_ValidationMarkers[i].getLevel() == scopes.svyValidationManager.VALIDATION_LEVEL.ERROR) {
            markers.push(m_ValidationMarkers[i]);
        }
    }
    return markers;
}

/**
 * @protected
 * @param {JSEvent} event
 * @override
 * @properties={typeid:24,uuid:"D7A776BE-7055-41F2-A00B-C041B0DDF4AD"}
 */
function onEventBubble(event) {
    switch (event.getType()) {

        case JSEvent.DATACHANGE: {
            if (getCrudPolicies().getValidationPolicy() == scopes.svyCRUDManager.VALIDATION_POLICY.CONTINUOUS) {
                validate();
            }
            break;
        }
    }
}

/**
 * Checks to ensure that no open edits exist
 * Prompts user to save/cancel or remain on current record
 *
 * @protected
 * @param {JSEvent} [event]
 * @override
 * @properties={typeid:24,uuid:"B9F1DFF9-3FD9-4E82-BEDE-7697186855BD"}
 */
function onRecordSelection(event) {
    var selRec = foundset.getSelectedRecord();

    if (hasEdits() && (selRec != m_LastSelectedRecord)) {
        if (getCrudPolicies().getRecordSelectionPolicy() == scopes.svyCRUDManager.RECORD_SELECTION_POLICY.PREVENT_WHEN_EDITING) {
            if (m_LastSelectedRecord && (m_LastSelectedRecord.foundset != foundset)) {
                throw new Error('Invalid form state - the foundset of the form was replaced with a different foundset while there were pending changes and the record selection policy does not allow record selection changes when editing records.');
            }

            foundset.setSelectedIndex(foundset.getRecordIndex(m_LastSelectedRecord));
            if (!beforeMoveRecord()) {
                return;
            }
        }
        foundset.setSelectedIndex(foundset.getRecordIndex(selRec));
    }

    m_LastSelectedRecord = selRec;
    _super.onRecordSelection(event);
}

/**
 * @protected
 * @param {JSRecord} record
 * @return {String} the lock name
 * @throws {Error} if could not lock the record
 * @properties={typeid:24,uuid:"311D6C10-E068-4615-AF72-53358A0A6873"}
 */
function lockRecord(record) {
    var lockName = application.getUUID().toString();
    //using automatic retry to acquire record lock - for example, try 3 times to lock the record in 100ms intervals
    for (var i = 0; i < m_RecordLockRetries; i++) {
        var locked = databaseManager.acquireLock(record.foundset, record.foundset.getRecordIndex(record), lockName);
        if (locked) {
            m_RecordLocks.push(lockName);
            return lockName;
        }
        application.sleep(m_RecordLockRetryPeriodMilliseconds);
    }
    throw new Error('Could not acquire record lock.');
}

/**
 * @protected
 * @param {Array<JSRecord>} records
 * @return {Boolean} false if could not lock one of the records (will add a validation error marker for it)
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
                m_ValidationMarkers.push(new scopes.svyValidationManager.ValidationMarker(rec, e.message, scopes.svyValidationManager.VALIDATION_LEVEL.ERROR));
                return false;
            }
        }
    }
    return true;
}

/**
 * @protected
 * @properties={typeid:24,uuid:"1DA040A1-4A3D-4AB7-960B-44F632FE5CCA"}
 */
function releaseLock(lockName) {
    var lockIndx = m_RecordLocks.indexOf(lockName);
    if (lockIndx > -1) {
        m_RecordLocks.splice(lockIndx, 1);
    }
    databaseManager.releaseAllLocks(lockName);

}

/**
 * @protected
 * @properties={typeid:24,uuid:"A8B701A0-EC80-45D9-A196-40CB3B81D463"}
 */
function releaseAllLocks() {
    while (m_RecordLocks.length > 0) {
        var lockName = m_RecordLocks.pop();
        databaseManager.releaseAllLocks(lockName);
    }
}

/**
 * @protected
 * @param {Number} retryCount
 *
 * @properties={typeid:24,uuid:"4119C5BD-4B66-48A0-B63D-A538DB71D52D"}
 */
function setRecordLockRetries(retryCount) {
    if (retryCount > 1) {
        m_RecordLockRetries = retryCount;
    } else {
        //should try at least once to acquire record lock
        m_RecordLockRetries = 1;
    }
}

/**
 * @protected
 * @param {Number} milliseconds
 *
 * @properties={typeid:24,uuid:"0F5BBC7A-A488-4874-8AF3-739483F94E06"}
 */
function setRecordLockRetryPeriod(milliseconds) {
    if (milliseconds > 0) {
        m_RecordLockRetryPeriodMilliseconds = milliseconds;
    } else {
        m_RecordLockRetryPeriodMilliseconds = 0;
    }
}

/**
 * Callback method when form is (re)loaded.
 * @override
 * @protected
 * @param {JSEvent} event the event that triggered the action
 *
 *
 * @properties={typeid:24,uuid:"A13066F8-44CB-47DA-BB61-E229CCFD6618"}
 */
function onLoad(event) {
    addStandardFormActions();
    _super.onLoad(event);
}

/**
 * @protected
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
 * @protected
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
    
    function innerSetActionEnabled(name, enabled) {
        var action = getAction(name);
        if (action) {
            action.setEnabled(enabled);
        }
    }
    
    innerSetActionEnabled(FORM_ACTION_NAMES.NEW, canMove);
    innerSetActionEnabled(FORM_ACTION_NAMES.DELETE, (hasRecordSelection && canMove));
    innerSetActionEnabled(FORM_ACTION_NAMES.SAVE, hasUnsavedChanges);
    innerSetActionEnabled(FORM_ACTION_NAMES.CANCEL, hasUnsavedChanges);
    innerSetActionEnabled(FORM_ACTION_NAMES.FIRST, (canMove && (selectionIndex > 1)));
    innerSetActionEnabled(FORM_ACTION_NAMES.PREVIOUS, (canMove && (selectionIndex > 1)));
    innerSetActionEnabled(FORM_ACTION_NAMES.NEXT, (canMove && (selectionIndex < fsSize)));
    innerSetActionEnabled(FORM_ACTION_NAMES.LAST, (canMove && (selectionIndex < fsSize)));
}

/**
 * @override
 * @protected
 * @properties={typeid:24,uuid:"E7BDC27B-EC43-47AE-A21A-1AEA9CCC7124"}
 */
function updateUI() {
    updateStandardFormActionsState();
    _super.updateUI();
}
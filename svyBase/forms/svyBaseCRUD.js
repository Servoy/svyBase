/*
 *	TODO Consider Locking
 *  TODO Consider multi-select-enabled foundsets
 *	TODO Consider optimistic save vs transactional 
 *  
 */


/**
 * @protected 
 * @properties={typeid:35,uuid:"C86C5862-377B-417B-BD56-4843BE201DC0",variableType:-4}
 */
var crudPolicies = scopes.svyCRUDManager.createCRUDPolicies();

/**
 * @protected 
 * @return {scopes.svyCRUDManager.CRUDPolicies}
 * @properties={typeid:24,uuid:"89F329BC-F975-4C32-98D7-7A333A47EA2F"}
 */
function getCrudPolicies(){
	return crudPolicies;
}

/**
 * @private 
 * @type {Array<scopes.svyValidationManager.ValidationMarker>}
 * @properties={typeid:35,uuid:"E675958D-88A2-4F16-AE2B-4B0E0364C9A5",variableType:-4}
 */
var validationMarkers = [];

/**
 * TODO EXPERIMENTAL TEST ME
 * @private
 * @type {Array<JSRecord>} 
 * @properties={typeid:35,uuid:"89983EDF-C8A5-4B52-A2B6-2201FFD1D4D0",variableType:-4}
 */
var tracking = [];

/**
 * @public 
 * @return {Boolean}
 * @properties={typeid:24,uuid:"6B9C30B7-28CF-404C-B37D-4624A163C070"}
 */
function hasEdits(){
	
	var records = getEditedRecords();
	for(var i in records){
		if(records[i].hasChangedData() || records[i].isNew()){
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
function hasErrors(){
	for(var i in validationMarkers){
		if(validationMarkers[i].getLevel() == scopes.svyValidationManager.VALIDATION_LEVEL.ERROR){
			return true;
		}
	}
	return false;
}

/**
 * @protected 
 * @return {String} Default is cancel edits
 * @properties={typeid:24,uuid:"B05DFAF8-FBDB-4B68-BBC5-E62155E7CAA6"}
 */
function onUserLeave(){
	return scopes.svyCRUDManager.USER_LEAVE.CANCEL_EDITS;
}


/**
 * @properties={typeid:24,uuid:"53C0E0C1-925B-4A06-AA0A-0670456433D9"}
 */
function newRecord(){
	
	if(hasEdits()){
		if(crudPolicies.getRecordSelectionPolicy() == scopes.svyCRUDManager.RECORD_SELECTION_POLICY.PREVENT_WHEN_EDITING){
			var userLeaveAction = onUserLeave();
			if(userLeaveAction == scopes.svyCRUDManager.USER_LEAVE.BLOCK){
				return;
			}
			if(userLeaveAction == scopes.svyCRUDManager.USER_LEAVE.SAVE_EDITS){
				save();
			} else {
				cancel();
			}
		}
	}
	
	// create record;
	// TODO: handler new record failed differently
	if(foundset.newRecord() == -1){
		throw 'New record failed';
	}
	
	// track record if tracking on
	if(crudPolicies.getTransactionScopePolicy() == scopes.svyCRUDManager.TRANSACTION_SCOPE_POLICY.AUTO){
		track(foundset.getSelectedRecord());
	}
}

/**
 * TODO delete in transaction like FW
 * TODO remove from tracking
 * TODO Consider Locking
 * TODO Consider multi-selection
 * @properties={typeid:24,uuid:"38217020-D34E-413A-AE8E-9D53FD1F1C56"}
 */
function deleteRecord(){
	
	// records to delete
	var records = foundset.getSelectedRecords();
	if(!records.length){
		return false;
	}
	
	// check pre-delete handler(s)
	if(!beforeDelete()){
		return false;
	}
	
	// open transaction
	databaseManager.startTransaction();
	try {
		
		// Delete selected records individually for better error handling
		for(var i in records){
			var record = records[i];
			
			// delete record
			try{
				
				// handle unexpected error
				if(!foundset.deleteRecord(record)){
					throw new scopes.svyDataUtils.DeleteRecordFailedException('Delete Record Failed: ' + record.exception,record);
				}
				
			// handle expected errors, i.e. DELETE_NOT_GRANTED
			} catch(e){
				throw new scopes.svyDataUtils.DeleteRecordFailedException(e.message,record);
			}
		}

		// commit transaction
		if(!databaseManager.commitTransaction()){
			
			// TODO consider adding transaction failed exception to svyDataUtils
			throw new scopes.svyDataUtils.SvyDataException('Transaction Failed',foundset);
		}
		
		// remove from tracking
		if(crudPolicies.getTransactionScopePolicy() == scopes.svyCRUDManager.TRANSACTION_SCOPE_POLICY.AUTO){
			untrack(records); 
		}
		
		// post-delete handler
		afterDelete();
		
		return true;
		
	// handle error condition
	} catch (e) {
		
		// rollback transaction
		databaseManager.rollbackTransaction();
		
		// notify on-error
		/** @type {scopes.svyDataUtils.DeleteRecordFailedException} */
		var ex = e;
		if(!(e instanceof scopes.svyDataUtils.DeleteRecordFailedException)){
			ex = new scopes.svyDataUtils.DeleteRecordFailedException('Delete failed: ' + e.message, foundset);
		}
		onDeleteError(ex);
		
		return false;
	}
}

/**
 * @protected 
 * @return {Boolean}
 * @properties={typeid:24,uuid:"4A359896-25AF-4326-A118-9A232249485A"}
 */
function beforeDelete(){
	return true;
}

/**
 * @protected 
 * @properties={typeid:24,uuid:"23E38465-DFD5-41AD-AD15-D31ED60353E3"}
 */
function afterDelete(){
	updateUI();
}

/**
 * @protected 
 * @param {scopes.svyDataUtils.DeleteRecordFailedException} error
 * @properties={typeid:24,uuid:"0600B27F-F792-4191-BD57-9BA1AEE78601"}
 */
function onDeleteError(error){
	updateUI();
}

/**
 * TODO Consider ValidationException with markers passed to onSaveError(e)
 * TODO Consider multi-selection
 * TODO consider locking option
 * @properties={typeid:24,uuid:"987117A7-2184-4702-8101-C89EF93F833A"}
 */
function save(){
	
	// collect edited records
	var records = getEditedRecords();
	if(!records.length){
		return false;
	}
	
	// validate
	if(crudPolicies.getValidationPolicy() != scopes.svyCRUDManager.VALIDATION_POLICY.NONE){
		validate();
		if(hasErrors()){
			return false;
		}
	}
	
	// Call before-save handler(s)
	if(!beforeSave()){
		return false;
	}
	
	// begin transaction
	databaseManager.startTransaction();
	try {
		
		// save records 1-by-1
		for(var i in records){
			var record = records[i];
			
			//	Save: handle failed save
			if(!databaseManager.saveData(record)){
				throw new scopes.svyDataUtils.SaveDataFailedException('Save Failed',record);
			}
		}
		
		// commit transaction
		if(!databaseManager.commitTransaction()){
			throw new scopes.svyDataUtils.SaveDataFailedException('Could not commit transaction',record);
		}
		
		// clear tracked records
		if(crudPolicies.getTransactionScopePolicy() == scopes.svyCRUDManager.TRANSACTION_SCOPE_POLICY.AUTO){
			clearTracking();
		}
		
		// clear validation markers
		validationMarkers = [];
		
		// post-save handler
		afterSave();
		
		return true;
		
	// handle 
	} catch(e){
		
		// rollback transaction
		databaseManager.rollbackTransaction();
		
		// notify on-error
		/** @type {scopes.svyDataUtils.SaveDataFailedException} */
		var ex = e;
		if(!(e instanceof scopes.svyDataUtils.SaveDataFailedException)){
			ex = new scopes.svyDataUtils.SaveDataFailedException('Save failed: ' + e.message);
		}
		onSaveError(ex);
		
		return false;
	}
}

/**
 * @protected 
 * @return {Boolean}
 * @properties={typeid:24,uuid:"FAD7AC85-F98C-4CF1-A3B3-6B2FA8A6AB25"}
 */
function beforeCancel(){
	return true;
}

/**
 * @properties={typeid:24,uuid:"3C6EB4F1-3B75-4AB4-BCB5-4DD2146F5B86"}
 */
function cancel(){
	
	// collect edited records
	var records = getEditedRecords();
	if(!records.length){
		return false;
	}
	
	// check pre-cancel handler(s)
	if(!beforeCancel()){
		return false;
	}
	
	// revert records 1-by-1
	for(var i in records){
		var record = records[i];
		record.revertChanges();
	}
	
	// clear tracking
	if(crudPolicies.getTransactionScopePolicy() == scopes.svyCRUDManager.TRANSACTION_SCOPE_POLICY.AUTO){
		clearTracking();
	}
	
	// clear validation markers
	validationMarkers = [];
	
	// notify post-cancel handler
	afterCancel();
	
	return true;
}

/**
 * @protected 
 * @properties={typeid:24,uuid:"F2ECBD52-7DD1-4B30-945E-D4D707351BBA"}
 */
function afterCancel(){
	updateUI();
}

/**
 * @properties={typeid:24,uuid:"7C3F8738-74A6-405C-9526-1FB6BABDFAEB"}
 */
function nextRecord(){
	
	// check position at end of foundset
	if(foundset.getSelectedIndex() == foundset.getSize()){
		return false;
	}
	
	// check pre-move handler
	if(!beforeMoveRecord()){
		return false;
	}
	
	// move selection
	foundset.setSelectedIndex(foundset.getSelectedIndex() + 1 );
	
	return true;
}

/**
 * @properties={typeid:24,uuid:"57C11407-A4FB-4978-A34E-6B908208EDA4"}
 */
function previousRecord(){
	
	// check position at end of foundset
	if(foundset.getSelectedIndex() == 1){
		return false;
	}
	
	// check pre-move handler
	if(!beforeMoveRecord()){
		return false;
	}
	
	// move selection
	foundset.setSelectedIndex(foundset.getSelectedIndex() - 1 );
	
	return true;
}

/**
 * @properties={typeid:24,uuid:"E8F23881-342A-47D7-B79D-3AFD90C4F11D"}
 */
function firstRecord(){
	
}

/**
 * @properties={typeid:24,uuid:"0E6051A2-DD95-4851-A02D-AA9AB9B1CF84"}
 */
function lastRecord(){
	
}

/**
 * @private 
 * @return {Boolean}
 * @properties={typeid:24,uuid:"9A234C65-8A04-49D8-89D0-421BDDD02507"}
 */
function beforeMoveRecord(){
	if(hasEdits()){
		if(crudPolicies.getRecordSelectionPolicy() == scopes.svyCRUDManager.RECORD_SELECTION_POLICY.PREVENT_WHEN_EDITING){
			var userLeaveAction = onUserLeave();
			if(userLeaveAction == scopes.svyCRUDManager.USER_LEAVE.BLOCK){
				return false;
			}
			if(userLeaveAction == scopes.svyCRUDManager.USER_LEAVE.SAVE_EDITS){
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
	if(!_super.onElementDataChange(oldValue, newValue, event)){
		return false;
	}

	// track data change
	if(crudPolicies.getTransactionScopePolicy() == scopes.svyCRUDManager.TRANSACTION_SCOPE_POLICY.AUTO){
		trackDataChange(event);
	}
	
	// Continuous validation
	if(crudPolicies.getValidationPolicy() == scopes.svyCRUDManager.VALIDATION_POLICY.CONTINUOUS){
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
function untrack(records){
	
	//	Ignore if tracking not set 
	if(crudPolicies.getTransactionScopePolicy() != scopes.svyCRUDManager.TRANSACTION_SCOPE_POLICY.AUTO){
		// TODO Log warning
		return;
	}
	
	// untrack foundset
	if(records instanceof JSFoundSet){
		/** @type {JSFoundSet} */
		var fs = records;
		untrack(databaseManager.getEditedRecords(fs));
	
	// untrack array of records
	} else if(records instanceof Array){
		for(var i in records){
			untrack(records[i]);
		}
		
	// untrack record
	} else {
		/** @type {JSRecord} */
		var record = records;
		var index = tracking.indexOf(record);
		if(index == -1){
			tracking.splice(index,1);
			
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
function track(records){
	
	//	Ignore if tracking not set 
	if(crudPolicies.getTransactionScopePolicy() != scopes.svyCRUDManager.TRANSACTION_SCOPE_POLICY.AUTO){
		// TODO Log warning
		return;
	}
	
	// track foundset
	if(records instanceof JSFoundSet){
		/** @type {JSFoundSet} */
		var fs = records;
		track(databaseManager.getEditedRecords(fs));
	
	// track array of records
	} else if(records instanceof Array){
		for(var i in records){
			track(records[i]);
		}
		
	// track record
	} else {
		/** @type {JSRecord} */
		var record = records;
		if(record.hasChangedData() && tracking.indexOf(record) == -1){
			tracking.push(record);
			
			//	TODO Fire special tracking event ?
		}
	}
}

/**
 * @private 
 * @properties={typeid:24,uuid:"0B4A4D48-187A-4663-B435-922BABBC7259"}
 */
function clearTracking(){
	tracking = [];
}
/**
 * TODO EXPERIMENTAL TEST ME
 * @private 
 * @param {JSEvent} event
 * @properties={typeid:24,uuid:"5CD3C129-C26C-41DC-B3D2-440FCBCA6CB7"}
 */
function trackDataChange(event){
	
	//	TODO Move functionality to svyUtils or svyBase to find relations, etc
	var name = event.getElementName();
	if(name){
		/** @type {RuntimeTextField} */
		var component = elements[name];
		if(component.getDataProviderID){
			var dataProvider = component.getDataProviderID();
			
			//	related data provider
			var path = dataProvider.split('.');
			if(path.length > 1){
				path.pop();
				
				/** @type {JSFoundSet} */
				var fs = this[path];
				if(fs){
					track(fs.getSelectedRecord());
				}
			//	primary data provider (skip variables, calcs, aggregates)
			} else {
				var col = databaseManager.getTable(foundset).getColumn(dataProvider);
				if(col){
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
function validate(){
	
	//	collect records to validate based on CRUD scope
	var records = getEditedRecords()
	
	//	delegate to registered validators and collect markers
	validationMarkers = [];
	for(var i in records){
		validationMarkers = validationMarkers.concat(scopes.svyValidationManager.validate(records[i]));
	}
	
	// update UI
	updateUI();
	
	return validationMarkers;
}

/**
 * @protected 
 * @return {Array<JSRecord>}
 * @properties={typeid:24,uuid:"B4E3A104-69D2-473B-9B87-EDECC5CA111A"}
 */
function getEditedRecords(){
	//	collect records to validate based on CRUD scope
	/** @type {Array<JSRecord>} */
	var records = [];
	switch (crudPolicies.getTransactionScopePolicy()) {
		case scopes.svyCRUDManager.TRANSACTION_SCOPE_POLICY.ALL:
			records = databaseManager.getEditedRecords();
			break;
		case scopes.svyCRUDManager.TRANSACTION_SCOPE_POLICY.FOUNDSET:
			records = databaseManager.getEditedRecords(foundset)
			break;
		case scopes.svyCRUDManager.TRANSACTION_SCOPE_POLICY.CURRENT_RECORD:
			records = [foundset.getSelectedRecord()];
			break;
		case scopes.svyCRUDManager.TRANSACTION_SCOPE_POLICY.AUTO:
			for(var i in tracking){
				if(tracking[i].hasChangedData()){
					records.push(tracking[i]);
				}
			}
			break;
			
		// shouldn't happen
		default:
			break;
	}
	return records;
}

/**
 * @protected 
 * @return {Boolean}
 * @properties={typeid:24,uuid:"90B9D3C6-863E-471D-9A4F-189BC98402AA"}
 */
function beforeSave(){
	return true;
}

/**
 * @protected 
 * @properties={typeid:24,uuid:"4A7F8CEA-9DF0-4FBE-98EE-17854331DDAE"}
 */
function afterSave(){
	updateUI();
}

/**
 * @protected 
 * @param {scopes.svyDataUtils.SaveDataFailedException} error
 * @properties={typeid:24,uuid:"24E8B121-4E3A-4465-B2D1-A32A5EAA8DF6"}
 */
function onSaveError(error){
	updateUI();
}
/**
 * TODO: Make defensive copy ?
 * @protected 
 * @return {Array<scopes.svyValidationManager.ValidationMarker>}
 *
 * @properties={typeid:24,uuid:"433FDF42-887B-4C39-A12A-A7AE3932C38B"}
 */
function getValidationMarkers(){
	return validationMarkers;
}

/**
 * @protected 
 * @return {Array<scopes.svyValidationManager.ValidationMarker>}
 * @properties={typeid:24,uuid:"1AC72AB8-8F20-4BA7-9FBF-BE403C079F9C"}
 */
function getErrors(){
	var markers = [];
	for(var i in validationMarkers){
		if(validationMarkers[i].getLevel() == scopes.svyValidationManager.VALIDATION_LEVEL.ERROR){
			markers.push(validationMarkers[i]);
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
function onEventBubble(event){
	switch (event.getType()) {
		
		case JSEvent.DATACHANGE:
			if(getCrudPolicies().getValidationPolicy() == scopes.svyCRUDManager.VALIDATION_POLICY.CONTINUOUS){
				validate();
			}
		break;
	
		default:
			break;
	}
}
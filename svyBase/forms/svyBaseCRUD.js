/**
 * @public 
 * @enum 
 * @properties={typeid:35,uuid:"71FE3498-2E20-44CF-8F77-B6DE74833ACC",variableType:-4}
 */
var FORM_HIDE_POLICY = {
	
	/**
	 * Prevents this form from hiding while editing
	 * @type {String}
	 */
	PREVENT_WHEN_EDITING:'prevent-when-editing',
	
	/**
	 * Allows this form to hide while editing
	 * @type {String}
	 */
	ALLOW_WHEN_EDITING:'allow-when-editing'
};

/**
 * @public 
 * @enum 
 * @properties={typeid:35,uuid:"48721F72-EEBE-4288-B779-684813499BA5",variableType:-4}
 */
var CRUD_SCOPE_POLICY = {
	
	ALL : 'all',
	
	FOUNDSET : 'foundset',
	
	CURRENT_RECORD : 'current-record',
	
	AUTO : 'auto'
}


/**
 * @public 
 * @enum 
 * @properties={typeid:35,uuid:"5B87FFB8-417E-4176-8C9B-458BA524D305",variableType:-4}
 */
var RECORD_SELECTION_POLICY = {
	
	/**
	 * Prevents this form from hiding while editing
	 * @type {String}
	 */
	PREVENT_WHEN_EDITING:'prevent-when-editing',
	
	/**
	 * Allows this form to hide while editing
	 * @type {String}
	 */
	ALLOW_WHEN_EDITING:'allow-when-editing'
};

/**
 * @deprecated 
 * @protected 
 * @enum 
 * @properties={typeid:35,uuid:"9B2DDADD-F781-4DDB-BCDB-A28AFAEFEC35",variableType:-4}
 */
var MODES = {
	ADD:'add',
	EDIT:'edit',
	BROWSE:'browse'
};

/**
 * @protected 
 * @enum 
 * @properties={typeid:35,uuid:"6D961F30-5500-42FA-89A9-24922A9491ED",variableType:-4}
 */
var USER_LEAVE = {
	SAVE_EDITS:'save',
	CANCEL_EDITS:'cancel',
	BLOCK:'block'
};

/**
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"AABAB611-4458-4DB7-9B7E-7E4E22B1D98A"}
 */
var formHidePolicy = FORM_HIDE_POLICY.ALLOW_WHEN_EDITING;

/**
 * @private 
 * @type {String}
 * @properties={typeid:35,uuid:"F9A7C189-FF3C-4D91-9096-C015CCD356C9"}
 */
var recordSelectionPolicy = RECORD_SELECTION_POLICY.ALLOW_WHEN_EDITING;

/**
 * @private 
 * @type {String}
 * @properties={typeid:35,uuid:"6FC52E39-3172-4E0A-ABE2-95EE2194A171"}
 */
var crudScopePolicy = CRUD_SCOPE_POLICY.FOUNDSET;

/**
 * @deprecated 
 * @protected 
 * @type {Array<String>}
 * @properties={typeid:35,uuid:"81F18204-48D6-474E-837A-2667C8C00D0F",variableType:-4}
 */
var managedFoundsets = [];

/**
 * @deprecated 
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"909ED036-2F7E-43A7-856D-B109844AE8F9"}
 */
var mode = MODES.BROWSE;

/**
 * TODO EXPERIMENTAL TEST ME
 * @private
 * @type {Array<JSRecord>} 
 * @properties={typeid:35,uuid:"89983EDF-C8A5-4B52-A2B6-2201FFD1D4D0",variableType:-4}
 */
var tracking = [];
	
/**
 * @deprecated 
 * @protected 
 * @param {String|JSFoundSet} fs named/related foundset or relation name
 *
 * @properties={typeid:24,uuid:"DC5EE517-0551-428C-AB7B-8123C58AAD22"}
 */
function addManagedFoundset(fs){
	/** @type {String} */
	var name;
	if(fs instanceof JSFoundSet){
		name = fs.getRelationName();
	} else {
		name = fs;
	}
	
	//	unrelated foundset not supported
	if(!name){
		// TODO warn
		return;
	}
	
	//	already added
	if(managedFoundsets.indexOf(name) >= 0){
		// TODO debug
		return;
	}
	
	//	add to list of managed foundsets
	managedFoundsets.push(name);
}

/**
 * @deprecated 
 * @protected 
 * @param {String|JSFoundSet} fs named/related foundset or relation name
 * @return {Boolean}
 * 
 * @properties={typeid:24,uuid:"4201C3B7-085C-4097-B861-70EA764B0A96"}
 */
function removeManagedFoundset(fs){
	
	/** @type {String} */
	var name;
	if(fs instanceof JSFoundSet){
		name = fs.getRelationName();
	} else {
		name = fs;
	}
	
	//	unrelated foundset not supported
	if(!name){
		// TODO warn
		return false;
	}
	
	//	not managed
	var index = managedFoundsets.indexOf(name); 
	if(index == -1){
		// TODO debug
		return false;
	}
	
	//	remove
	managedFoundsets.splice(index,1);
	return true;
}

/**
 * @protected 
 * @param {String} m
 * @deprecated 
 * @properties={typeid:24,uuid:"2CE89234-C775-4CDD-B299-174D7F791C97"}
 */
function setMode(m){
	mode = m;
}

/**
 * @protected  
 * @param {String} policy
 *
 * @properties={typeid:24,uuid:"292F7663-E1F7-4F3A-83BF-FF21B0E3B4D8"}
 */
function setFormHidePolicy(policy){
	formHidePolicy = policy;
}

/**
 * @protected  
 * @return {String} policy
 *
 * @properties={typeid:24,uuid:"A6E173C0-CCB5-4508-B3BD-F46373F84F83"}
 */
function getFormHidePolicy(){
	return formHidePolicy;
}

/**
 * @protected  
 * @param policy
 *
 * @properties={typeid:24,uuid:"8A62A8C8-FA22-4A1D-9017-B62E0FD56BA8"}
 */
function setRecordSelectionPolicy(policy){
	recordSelectionPolicy = policy;
}


/**
 * @protected  
 * @return {String}
 * @properties={typeid:24,uuid:"4A1D8028-F39E-4E37-9E8B-29F23FB8EF16"}
 */
function getRecordSelectionPolicy(){
	return recordSelectionPolicy
}

/**
 * @public 
 * @return {Boolean}
 * @properties={typeid:24,uuid:"6B9C30B7-28CF-404C-B37D-4624A163C070"}
 */
function hasEdits(){
	if(crudScopePolicy == CRUD_SCOPE_POLICY.ALL){
		return databaseManager.getEditedRecords().length > 0;
	}
	
	if(crudScopePolicy == CRUD_SCOPE_POLICY.FOUNDSET){
		return databaseManager.hasRecordChanges(foundset);
	}
	
	if(crudScopePolicy == CRUD_SCOPE_POLICY.CURRENT_RECORD){
		return foundset.getSelectedRecord().hasChangedData();
	}
	
	//	AUTO
	for(var i in tracking){
		if(tracking[i].hasChangedData()){
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
	return USER_LEAVE.CANCEL_EDITS;
}

/**
 * @properties={typeid:24,uuid:"53C0E0C1-925B-4A06-AA0A-0670456433D9"}
 */
function newRecord(){
	
	if(hasEdits()){
		if(recordSelectionPolicy == RECORD_SELECTION_POLICY.PREVENT_WHEN_EDITING){
			var userLeaveAction = onUserLeave();
			if(userLeaveAction == USER_LEAVE.BLOCK){
				return;
			}
			if(userLeaveAction == USER_LEAVE.SAVE_EDITS){
				save();
			} else {
				cancel();
			}
		}
	}
	
	// create record;
	if(foundset.newRecord() == -1){
		throw 'New record failed';
	}
	
	//	set mode to ADD
	setMode(MODES.ADD);
}

/**
 * @properties={typeid:24,uuid:"38217020-D34E-413A-AE8E-9D53FD1F1C56"}
 */
function deleteRecord(){
	
}

/**
 * @properties={typeid:24,uuid:"987117A7-2184-4702-8101-C89EF93F833A"}
 */
function save(){
	
}

/**
 * @properties={typeid:24,uuid:"3C6EB4F1-3B75-4AB4-BCB5-4DD2146F5B86"}
 */
function cancel(){
	
}

/**
 * @properties={typeid:24,uuid:"7C3F8738-74A6-405C-9526-1FB6BABDFAEB"}
 */
function nextRecord(){
	
}

/**
 * @properties={typeid:24,uuid:"57C11407-A4FB-4978-A34E-6B908208EDA4"}
 */
function previousRecord(){
	
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
	if(crudScopePolicy == CRUD_SCOPE_POLICY.AUTO){
		trackDataChange(event);
	}
	return true;
}

/**
 * TODO EXPERIMENTAL TEST ME
 * @private 
 * @param {JSRecord|Array<JSRecord>|JSFoundSet} records
 *
 * @properties={typeid:24,uuid:"40E46972-E802-43D9-AF07-B32B1B3DBF4E"}
 */
function track(records){
	
	//	Ignore if tracking not set 
	if(crudScopePolicy != CRUD_SCOPE_POLICY.AUTO){
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
			
			//	TODO Fire event
		}
	}
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

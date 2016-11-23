/**
 * @enum
 * @properties={typeid:35,uuid:"68EE6175-D364-44BF-BDEE-2FC3AC7AA025",variableType:-4}
 */
var DESIGN_TIME_PROPERTIES = {
	OMIT_DATA_CHANGE:'omitDataChange'
};

/**
 * @protected  
 * @enum 
 * @properties={typeid:35,uuid:"61CFC02F-08BE-4014-9DC5-FF696A81B338",variableType:-4}
 */
var MODES = {
	BROWSE:'browse',
	EDIT:'edit',
	ADD:'add'
};

/**
 * @private 
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"4B02BFAE-7E3B-4FC7-A0FC-D00CAB20951F",variableType:4}
 */
var lastSelectedIndex = -1;

/**
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"8FB40080-BC64-4FE8-9E98-9B9112A91BE5"}
 */
var mode = MODES.BROWSE;


/**
 * Creates a new record and the form is set for editing
 * Action is blocked if form is already editing a record
 * User has option to cancel current edits
 * 
 * @public  
 * @properties={typeid:24,uuid:"116F246E-3547-4DD7-B609-E3C65E4D8D55"}
 */
function newRecord(){
	
	//	check for current mode;
	if(hasEdits()){
		
		// warn user
		if(!confirmSaveOnUserLeave()){
			return;
		}
	}
	
	//	 create record;
	if(foundset.newRecord() == -1){
		throw 'New record failed';
	}
	
		//	set mode to ADD
	setMode(MODES.ADD);
}

/**
 * @protected
 * @return {Boolean}
 * @properties={typeid:24,uuid:"19A59A4B-04FE-474A-B53A-9D94F9B97B90"}
 */
function beforeDelete() {
	clearValidationMarkers();
	/** @type {Function} */	
	var beforeDeleteHandler = foundset['beforeRecordDelete'];
	if (beforeDeleteHandler){
		validationMarkers = validationMarkers.concat(beforeDeleteHandler());	
	}	
	if (validationMarkers.length > 0){
		return false;
	}
	return true;
}

/**
 * Deletes the selected record in the foundset
 * User has an option to first confirm delete
 * If form is editing, form will no longer be set in editing mode 
 * @public  
 * @properties={typeid:24,uuid:"884C09D8-7B49-469E-9DA0-08AEA833CAD8"}
 */
function deleteRecord(){
	var title;
	var msg;
	var input;
	var options;
	var yesString = i18n.getI18NMessage("picas.label.yes");
	var noString = i18n.getI18NMessage("picas.label.no");
	var okString = i18n.getI18NMessage("i18n:picas.label.OK");
	var errorMsg;

	//  Before Delete Event
	if (!beforeDelete()) {
		title = i18n.getI18NMessage("i18n:picas.label.error");
		options = [okString];
	    errorMsg = "<b>" + i18n.getI18NMessage("i18n:picas.error.delete") + "</b>";
	    if (validationMarkers){
			var markers = getValidationMarkers();
			for(var i in markers){
				var marker = markers[i];
				errorMsg+='<br>' + marker.title;				
			}
	    }	    
	    application.output('Delete Failed.',LOGGINGLEVEL.ERROR);	    	    
	    plugins.dialogs.showErrorDialog(title,errorMsg,options);
		return false;
	}
	
	// confirm with user
	title = i18n.getI18NMessage("picas.label.warning");
	msg = i18n.getI18NMessage("picas.message.deleteRecord") + " " + i18n.getI18NMessage("picas.message.areYouSure");
	options = [yesString,noString];
	input = plugins.dialogs.showWarningDialog(title,msg,options);
	if(input != options[0]){
		return false;
	}
	try {    			
		foundset.deleteRecord();			
	}
	catch(err) {		
		title = i18n.getI18NMessage("i18n:picas.label.error");
		options = [okString];
	    errorMsg = "<b>" + i18n.getI18NMessage("i18n:picas.error.delete") + "</b><br>";
	    if (err.message.toUpperCase().indexOf('LOCK') >= 0) {
	    	errorMsg+=i18n.getI18NMessage("i18n:picas.error.lock");	    	
	    }
	    else if (err.message.toUpperCase().indexOf('UNEXPECTED NR OF RECORDS AFFECTED') >= 0) {
	    	errorMsg+=i18n.getI18NMessage("i18n:picas.error.recordAlreadyDeleted");
	    }	    
	    else {
	    	errorMsg+=i18n.getI18NMessage("i18n:picas.error.undefined") + "<br><br>" + err.message;
	    	application.output('Delete Failed.  Undefined Error Occurred. (' + err.message + ')',LOGGINGLEVEL.ERROR);	
	    }	
	    application.output('1 errorMsg: ' + errorMsg,LOGGINGLEVEL.ERROR);	    
	    plugins.dialogs.showErrorDialog(title,errorMsg,options);
		return false;
	}
	
	//	set mode to browse
	setMode(MODES.BROWSE);
	
	//  Display notification to the user about Delete Complete
	forms.baseNotification.createNotification(forms.baseNotification.NOTIFICATION_TYPE.SUCCESS,forms.baseNotification.NOTIFICATION_POSITION.TOP_RIGHT,i18n.getI18NMessage('picas.message.deleteComplete'));
	
	return true;
}

/**
 * @protected 
 * @return {Array<JSFoundSet>}
 *
 * @properties={typeid:24,uuid:"6A420107-6A3F-43B1-83D0-6127EE2A87D9"}
 */
function getManagedFoundsets(){
	return [foundset];
}

/**
 * Saves current changes and sets to form to non-editing mode
 * Save will check validation first and will terminate if validation errors are found
 * @public  
 * @return {Boolean}
 * @properties={typeid:24,uuid:"9DCAF60B-ABF5-4195-9296-6E99D088D9BF"}
 */
function save(){	
	var index;
	
	//	terminate if no edits
	if(!hasEdits()){
		return false;
	}
	
	//Grab all foundsets to save
	var foundsets = getManagedFoundsets();
	
	//Error check the foundsets
	for (index = 0; index < foundsets.length; index++) {
		//	terminate if validation fails	
		validate();
		if(hasErrors()){
			return false;
		}
		
		//  Before Save Event
		if(mode == MODES.ADD){
			if (!beforeSave()) {
				return false;
			}
		}		
	}

	//Save the foundsets
	for (index = 0; index < foundsets.length; index++) {	
		if(!databaseManager.saveData(foundsets[index])){	
			var failedRecordArray = databaseManager.getFailedRecords(foundsets[index])
			for( var i = 0 ; i < failedRecordArray.length ; i++ )
			{
				var record = failedRecordArray[i];
				var title = i18n.getI18NMessage("i18n:picas.label.error");
				var okString = i18n.getI18NMessage("i18n:picas.label.OK");
				var options = [okString];
			    var errorMsg = '<b>' + i18n.getI18NMessage("i18n:picas.error.save") + '</b> <br>';
			    if (record.exception.getMessage().toUpperCase().indexOf('LOCK') >= 0){
			    	errorMsg+=i18n.getI18NMessage("i18n:picas.error.lock");
			    }
			    else if (record.exception.getMessage().toUpperCase().indexOf('DUPLICATE KEY') >= 0){
			    	errorMsg+=i18n.getI18NMessage("i18n:picas.error.duplicateKey");
			    	var pks = scopes.picasCore.getPrimaryKeyNames(foundset);
			    	if (pks) {
			    		errorMsg+= "<br><br>" + i18n.getI18NMessage("i18n:picas.label.uniqueID") + ": " + pks;
			    	}		    	
			    }
			    else {
			    	errorMsg+=i18n.getI18NMessage("i18n:picas.error.undefined") + "<br><br>" + record.exception.getMessage();
			    	application.output('Save Failed.  Undefined Error Occurred. (' + record.exception.getMessage() + ')',LOGGINGLEVEL.ERROR);	
			    }		    
			    plugins.dialogs.showErrorDialog(title,errorMsg,options);
			}			
			return false;
		}	
	}
	
	//	set mode back to browse
	setMode(MODES.BROWSE);
	
	//  Display notification to the user about Save Complete
	forms.baseNotification.createNotification(forms.baseNotification.NOTIFICATION_TYPE.SUCCESS,forms.baseNotification.NOTIFICATION_POSITION.TOP_RIGHT,i18n.getI18NMessage('picas.message.saveComplete'));
	
	return true;
}

/**
 * @protected 
 * @return {Boolean}
 * @properties={typeid:24,uuid:"7D6C3263-77EC-49A5-ABF6-3223C1A64C38"}
 */
function beforeSave(){
	/* This logic is done in the child class */
	return true;
}

/**
 * Cancels current changes and allows form to set to non-edit mode
 * @public  
 * @properties={typeid:24,uuid:"E199ADFA-0C31-4E8C-870E-7A0EEF53AE91"}
 */
function cancel(){
	setMode(MODES.BROWSE);
	
	//Grab all foundsets to save
	var foundsets = getManagedFoundsets();
	
	//Cancel edits made to the foundsets
	for (var index = 0; index < foundsets.length; index++) {
		databaseManager.revertEditedRecords(foundsets[index]);
	}
}

/**
 * Indicates if form has open edits
 * @protected 
 * @return {Boolean}
 * @properties={typeid:24,uuid:"4A42EFC9-6EAB-4A17-93F1-B576C53B8C7B"}
 */
function hasEdits(){
	return mode == MODES.ADD || mode == MODES.EDIT;
}

/**
 * Indicates if form has open edits involving a new record
 * @protected 
 * @return {Boolean}
 *
 * @properties={typeid:24,uuid:"F1ED2A3A-0BDC-481C-B0E9-F0F84C3FE90E"}
 */
function hasNewRecord(){
	return mode == MODES.ADD
}

/**
 * Handle hide window.
 *
 * @param {JSEvent} [event] the event that triggered the action
 *
 * @return {Boolean}
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"B131ED19-41D9-4609-9794-8D1CAE23BB5F"}
 */
function onHide(event) {
	var innerForms = scopes.svyUI.getVisibleForms(this);
	for(var i in innerForms){
		/** @type {RuntimeForm<baseCRUD>} */
		var form = innerForms[i];
		if(scopes.svyUI.isJSFormInstanceOf(form,forms.baseCRUD)){
			if(!form.canHide()){
				return false;
			}
		}
	}
	return canHide();
}

/**
 * Called to inquire if this form can hide
 * Checks to ensure that no open edits exist
 * Prompts user to save/cancel or remain on form
 * 
 * @public  
 * @return {Boolean}
 * @properties={typeid:24,uuid:"F158CF91-92F1-4973-A530-471FF6BA562F"}
 */
function canHide(){
	
	//	check if open edits
	if(hasEdits()){
		
		// warn user
		if(!confirmSaveOnUserLeave()){
			return false;
		}
	}
	return true;
}

/**
 * Checks to ensure that no open edits exist
 * Prompts user to save/cancel or remain on current record
 *
 * @protected 
 * @param {JSEvent} [event]
 * @override 
 * @properties={typeid:24,uuid:"A4B42B56-5A2D-4028-BD13-52CCCF1D5BDC"}
 */
function onRecordSelection(event){
	var index = foundset.getSelectedIndex();
	if(!index){
		return;
	}
	if(hasEdits() && index != lastSelectedIndex){
		foundset.setSelectedIndex(lastSelectedIndex);
		if(!confirmSaveOnUserLeave()){
			return;
		}
		foundset.setSelectedIndex(index);
	}
	lastSelectedIndex = index;
	_super.onRecordSelection(event);
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
 * @override 
 *
 * @properties={typeid:24,uuid:"7617FAC2-A550-42D2-9FF8-1A651DEA24B7"}
 */
function onElementDataChange(oldValue, newValue, event) {
	
	//	check for design-time prop to omit data change
	/** @type {JSComponent} */
	var component = event.getSource();
	if(!component.getDesignTimeProperty(DESIGN_TIME_PROPERTIES.OMIT_DATA_CHANGE)){
		if(!hasEdits()){
			setMode(MODES.EDIT);
		}
//		validate();
	}
	return _super.onElementDataChange(oldValue,newValue,event);
}

/**
 * @protected 
 * @param {String} m
 *
 * @properties={typeid:24,uuid:"892ACFC5-5EDD-4A5C-84F0-D56E293165AA"}
 */
function setMode(m){
	mode = m;
}

/**
 * @protected 
 * @return {Boolean}
 * @properties={typeid:24,uuid:"6ED37835-05EE-477D-8E09-DBDE8582048B"}
 */
function confirmSaveOnUserLeave(){
	return true;
}
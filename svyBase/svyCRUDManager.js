/**
 * TODO: Add policy for child/inner forms
 * 
 */

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
 var BATCH_SCOPE_POLICY = {
 	
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
  * @public 
  * @enum 
  * @properties={typeid:35,uuid:"7603FC71-8F93-478E-A8DE-B8DB27D62D78",variableType:-4}
  */
 var VALIDATION_POLICY = {
 	
 	/**
 	 * Form will validate opportunistically, i.e. on element data change 
 	 * @type {String}
 	 */
 	CONTINUOUS : 'continuous',
 	
 	/**
 	 * Form will defer validation until before-save
 	 * @type {String}
 	 */
 	DEFERRED : 'deferred',
 	
 	/**
 	 * Form will not ask for validation
 	 * @type {String}
 	 */
 	NONE : 'none'
 };
 
 /**
 * @properties={typeid:35,uuid:"000B774B-7367-4543-95C4-EB58BA935919",variableType:-4}
 */
var RECORD_LOCKING_POLICY = {
    /**
     * Records will be automatically locked before each save or delete operation (in essence, this is optimistic locking at the very last moment)
     * @type {String}
     */
    AUTO : 'auto',
    /**
     * Records will not be locked
     * @type {String}
     */
    NONE : 'none'
}

 /**
  * @public  
  * @enum 
  * @properties={typeid:35,uuid:"6D961F30-5500-42FA-89A9-24922A9491ED",variableType:-4}
  */
 var USER_LEAVE = {
 	SAVE_EDITS:'save',
 	CANCEL_EDITS:'cancel',
 	BLOCK:'block'
 };
 
 /**
  * @public 
  * @return {CRUDPolicies}
  * @properties={typeid:24,uuid:"A367BF17-F480-4F90-A517-EB97AEE8612B"}
  */
function createCRUDPolicies(){
	 return new CRUDPolicies();
 }

 /**
  * @private 
  * @constructor 
  * @properties={typeid:24,uuid:"F9F90AD9-B2BE-4BFF-963A-0969A8AE9218"}
  */
function CRUDPolicies(){
	 
	/**
	 * @protected  
	 * @type {String}
	 */
	this.formHidePolicy = FORM_HIDE_POLICY.ALLOW_WHEN_EDITING;
	
	/**
	 * @protected 
	 * @type {String}
	 */
	this.recordSelectionPolicy = RECORD_SELECTION_POLICY.ALLOW_WHEN_EDITING;
	
	/**
	 * @protected 
	 * @type {String}
	 */
	this.recordLockingPolicy = RECORD_LOCKING_POLICY.NONE;
	
	/**
	 * @protected 
	 * @type {String}
	 */
	this.batchScopePolicy = BATCH_SCOPE_POLICY.FOUNDSET;
	
	/**
	 * @protected 
	 * @type {String}
	 */
	this.validationPolicy = VALIDATION_POLICY.DEFERRED;
	
	/**
	 * @public 
	 * @param {String} policy
	 * @return {CRUDPolicies}
	 */
	this.setFormHidePolicy = function(policy){
		this.formHidePolicy = policy;
		return this;
	}
	
	/**
	 * @public 
	 * @return {String}
	 */
	this.getFormHidePolicy = function(){
		return this.formHidePolicy;
	}
	
	/**
	 * @public 
	 * @param {String} policy
	 * @return {CRUDPolicies}
	 */
	this.setRecordSelectionPolicy = function(policy){
		this.recordSelectionPolicy = policy;
		return this;
	}
	
	/**
	 * @public 
	 * @return {String}
	 */
	this.getRecordSelectionPolicy = function(){
		return this.recordSelectionPolicy;
	}
	
	/**
	 * @public 
	 * @param {String} policy
	 * @return {CRUDPolicies}
	 */
	this.setRecordLockingPolicy = function(policy){
		this.recordLockingPolicy = policy;
		return this;
	}
	
	/**
	 * @public 
	 * @return {String}
	 */
	this.getRecordLockingPolicy = function(){
		return this.recordLockingPolicy;
	}
	
	/**
	 * @public 
	 * @param {String} policy
	 * @return {CRUDPolicies}
	 */
	this.setBatchScopePolicy = function(policy){
		this.batchScopePolicy = policy;
		return this;
	}
	
	/**
	 * @public 
	 * @return {String}
	 */
	this.getBatchScopePolicy = function(){
		return this.batchScopePolicy;
	}
	
	/**
	 * @public 
	 * @param {String} policy
	 * @return {CRUDPolicies}
	 */
	this.setValidationPolicy = function(policy){
		this.validationPolicy = policy;
		return this;
	}
	
	/**
	 * @public 
	 * @return {String}
	 */
	this.getValidationPolicy = function(){
		return this.validationPolicy;
	}
}
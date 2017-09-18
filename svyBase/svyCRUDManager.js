/**
 * Enumeration for the form hide policy options which control if the form can be hidden while there are any outstanding/unsaved changes.
 * @public
 * @enum
 * @properties={typeid:35,uuid:"71FE3498-2E20-44CF-8F77-B6DE74833ACC",variableType:-4}
 */
var FORM_HIDE_POLICY = {

    /**
     * Prevents the form from hiding while editing.
     */
    PREVENT_WHEN_EDITING: 'prevent-when-editing',

    /**
     * Allows the form to hide while editing.
     */
    ALLOW_WHEN_EDITING: 'allow-when-editing'
};

/**
 * Enumeration for the batch scope policy options which control what records will be included in the batch of work of the form. 
 * @public
 * @enum
 * @properties={typeid:35,uuid:"48721F72-EEBE-4288-B779-684813499BA5",variableType:-4}
 */
var BATCH_SCOPE_POLICY = {
    /**
     * The form batch of work will include all changed and new records from all foundsets. 
     */
    ALL: 'all',
    /**
     * The form batch of work will include all changed and new records from the form's foundset only.
     */
    FOUNDSET: 'foundset',
    /**
     * The form batch of work will include only the current/selected record from the form's foundset.
     */
    CURRENT_RECORD: 'current-record',
    /**
     * The form will automatically add to the batch of work any new or changed record from the form's foundset or from any other related foundset which is exposed on the form by its fields.
     * Additional records can be added to the batch of work programmatically.
     */
    AUTO: 'auto'
}

/**
 * Enumeration for the record selection policy options which control if a record can be selected while there are any outstanding/unsaved changes.
 * @public
 * @enum
 * @properties={typeid:35,uuid:"5B87FFB8-417E-4176-8C9B-458BA524D305",variableType:-4}
 */
var RECORD_SELECTION_POLICY = {

    /**
     * Prevents the selection of other records while editing the current one.
     */
    PREVENT_WHEN_EDITING: 'prevent-when-editing',

    /**
     * Allows the selection of other records while editing the current one.
     */
    ALLOW_WHEN_EDITING: 'allow-when-editing'
};

/**
 * Enumeration for the validation policy options which control when data changes will be validated.
 * @public
 * @enum
 * @properties={typeid:35,uuid:"7603FC71-8F93-478E-A8DE-B8DB27D62D78",variableType:-4}
 */
var VALIDATION_POLICY = {

    /**
     * The form will validate opportunistically, i.e. on element data change.
     */
    CONTINUOUS: 'continuous',

    /**
     * The form will defer validation until the save or delete action is invoked.
     */
    DEFERRED: 'deferred',

    /**
     * The form will not perform any automatic validation and it will be a responsibility of the developers to validate the data changes. 
     */
    NONE: 'none'
};

/**
 * Enumeration for the record locking policy options which control if and how records will be locked during validation and database save/delete operations.
 * @public 
 * @enum  
 * @properties={typeid:35,uuid:"000B774B-7367-4543-95C4-EB58BA935919",variableType:-4}
 */
var RECORD_LOCKING_POLICY = {
    /**
     * Records will be automatically locked before each save or delete operation. In essence, this is optimistic locking at the very last moment before the validation is performed in the locks will remain in place until the save or delete operation is completed.
     */
    AUTO: 'auto',
    /**
     * Records will not be locked automatically and the developers are responsible to lock any records as needed.
     */
    NONE: 'none'
}

/**
 * Enumeration for the options returned by the onUserLeave method which control what to do if the record selection policy does not allow moving to a different record while editing and the user tries to select or move to a different record.
 * @public
 * @enum
 * @properties={typeid:35,uuid:"6D961F30-5500-42FA-89A9-24922A9491ED",variableType:-4}
 */
var USER_LEAVE = {
    /**
     * Any outstanding unsaved changes will be saved before leaving the currently edited record.
     */
    SAVE_EDITS: 'save',
    /**
     * Any outstanding unsaved changes will be canceled before leaving the currently edited record.
     */
    CANCEL_EDITS: 'cancel',
    /**
     * The user cannot leave the currently edited record.
     */
    BLOCK: 'block'
};

/**
 * Factory method for creating {@link CRUDPolicies} objects.
 * @public
 * @return {CRUDPolicies} The created {@link CRUDPolicies} object.
 * @properties={typeid:24,uuid:"A367BF17-F480-4F90-A517-EB97AEE8612B"}
 */
function createCRUDPolicies() {
    return new CRUDPolicies();
}

/**
 * Internal constructor. To create a new instance of the CRUDPolicies class use the method {@link createCRUDPolicies}.
 * @classdesc This class encapsulates the various supported form policies.
 * @protected
 * @constructor
 * @properties={typeid:24,uuid:"F9F90AD9-B2BE-4BFF-963A-0969A8AE9218"}
 */
function CRUDPolicies() {

    /**
     * @protected
     * @type {String}
     * @ignore
     */
    this.formHidePolicy = FORM_HIDE_POLICY.ALLOW_WHEN_EDITING;

    /**
     * @protected
     * @type {String}
     * @ignore
     */
    this.recordSelectionPolicy = RECORD_SELECTION_POLICY.ALLOW_WHEN_EDITING;

    /**
     * @protected
     * @type {String}
     * @ignore
     */
    this.recordLockingPolicy = RECORD_LOCKING_POLICY.NONE;

    /**
     * @protected
     * @type {String}
     * @ignore
     */
    this.batchScopePolicy = BATCH_SCOPE_POLICY.FOUNDSET;

    /**
     * @protected
     * @type {String}
     * @ignore
     */
    this.validationPolicy = VALIDATION_POLICY.DEFERRED;

    /**
     * Sets the form hide policy.
     * @public
     * @param {String} policy The form hide policy to use. Must be one of the {@link FORM_HIDE_POLICY} enumeration options.
     * @return {CRUDPolicies} This CRUDPolicies instance for call-chaining support.
     */
    this.setFormHidePolicy = function(policy) {
        this.formHidePolicy = policy;
        return this;
    }

    /**
     * Gets the current form hide policy.
     * @public
     * @return {String} The current form hide policy as one of the {@link FORM_HIDE_POLICY} enumeration options.
     */
    this.getFormHidePolicy = function() {
        return this.formHidePolicy;
    }

    /**
     * Sets the record selection policy.
     * @public
     * @param {String} policy The record selection policy to use. Must be one of the {@link RECORD_SELECTION_POLICY} enumeration options.
     * @return {CRUDPolicies} This CRUDPolicies instance for call-chaining support.
     */
    this.setRecordSelectionPolicy = function(policy) {
        this.recordSelectionPolicy = policy;
        return this;
    }

    /**
     * Gets the current record selection policy.
     * @public
     * @return {String} The current record selection policy as one of the {@link RECORD_SELECTION_POLICY} enumeration options.
     */
    this.getRecordSelectionPolicy = function() {
        return this.recordSelectionPolicy;
    }

    /**
     * Sets the record locking policy.
     * @public
     * @param {String} policy The record locking policy to use. Must be one of the {@link RECORD_LOCKING_POLICY} enumeration options.
     * @return {CRUDPolicies} This CRUDPolicies instance for call-chaining support.
     */
    this.setRecordLockingPolicy = function(policy) {
        this.recordLockingPolicy = policy;
        return this;
    }

    /**
     * Gets the current record locking policy.
     * @public
     * @return {String} The current record locking policy as one of the {@link RECORD_LOCKING_POLICY} enumeration options.
     */
    this.getRecordLockingPolicy = function() {
        return this.recordLockingPolicy;
    }

    /**
     * Sets the batch scope policy.
     * @public
     * @param {String} policy The batch scope policy to use. Must be one of the {@link BATCH_SCOPE_POLICY} enumeration options.
     * @return {CRUDPolicies} This CRUDPolicies instance for call-chaining support.
     */
    this.setBatchScopePolicy = function(policy) {
        this.batchScopePolicy = policy;
        return this;
    }

    /**
     * Gets the current batch scope policy.
     * @public
     * @return {String} The current batch scope policy as one of the {@link BATCH_SCOPE_POLICY} enumeration options.
     */
    this.getBatchScopePolicy = function() {
        return this.batchScopePolicy;
    }

    /**
     * Sets the validation policy.
     * @public
     * @param {String} policy The validation policy to use. Must be one of the {@link VALIDATION_POLICY} enumeration options.
     * @return {CRUDPolicies} This CRUDPolicies instance for call-chaining support.
     */
    this.setValidationPolicy = function(policy) {
        this.validationPolicy = policy;
        return this;
    }

    /**
     * Gets the current validation policy.
     * @public
     * @return {String} The current validation policy as one of the {@link VALIDATION_POLICY} enumeration options.
     */
    this.getValidationPolicy = function() {
        return this.validationPolicy;
    }
}

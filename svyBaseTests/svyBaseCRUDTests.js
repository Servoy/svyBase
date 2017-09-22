/**
 * @type {Array<{name: String, args: Array}>}
 * @properties={typeid:35,uuid:"2C701C14-45F5-41A8-A45B-B9B6D32FA7D3",variableType:-4}
 */
var m_CallLog = [];

/**
 * @properties={typeid:24,uuid:"465B501D-1573-4DF4-AEA8-CD23F1436656"}
 */
function setUp() {
    databaseManager.startTransaction();
    m_CallLog = [];
}

/**
 * @properties={typeid:24,uuid:"A2B9E207-5427-4DE0-801B-96784EF22180"}
 */
function tearDown() {
    if (databaseManager.hasTransaction()) {
        databaseManager.rollbackTransaction();
    }
    databaseManager.revertEditedRecords();
    databaseManager.releaseAllLocks();
}

/**
 * @param {String} name
 * @param {Array} args
 *
 * @properties={typeid:24,uuid:"66C1E2CE-5656-4DF5-9C41-4D83C73FCC28"}
 */
function logCall(name, args) {
    m_CallLog.push({ name: name, args: args });
}

/**
 * @properties={typeid:24,uuid:"632FA30E-E82B-4759-B27C-96E4807CD3A7"}
 */
function testNewRecord_blockBefore() {
    var f = forms.utFormBaseCRUDExt;
    f.registerCallLogCallback(logCall);

    f.m_BeforeNewRecordResult = false;

    var res = f.newRecord();
    jsunit.assertFalse(res);
    jsunit.assertEquals(1, m_CallLog.length);
    jsunit.assertEquals('beforeNewRecord', m_CallLog[0].name);
    jsunit.assertEquals(0, m_CallLog[0].args.length);
}

/**
 * @properties={typeid:24,uuid:"3C1C26F0-EA80-448C-A88F-E5BC2E913DB8"}
 */
function testNewRecord_failCreate() {
    var f = forms.utFormBaseCRUDExt;
    f.registerCallLogCallback(logCall);

    f.m_FailCreateNewRecord = true;

    var res = f.newRecord();
    jsunit.assertFalse(res);
    jsunit.assertEquals(4, m_CallLog.length);

    jsunit.assertEquals('beforeNewRecord', m_CallLog[0].name);
    jsunit.assertEquals(0, m_CallLog[0].args.length);

    jsunit.assertEquals('createNewRecord', m_CallLog[1].name);
    jsunit.assertEquals(0, m_CallLog[1].args.length);

    jsunit.assertEquals('onNewRecordError', m_CallLog[2].name);
    jsunit.assertEquals(1, m_CallLog[2].args.length);

    jsunit.assertEquals('updatingUI', m_CallLog[3].name);
    jsunit.assertEquals(0, m_CallLog[3].args.length);
}

/**
 * @properties={typeid:24,uuid:"F84F7544-B7D7-4F67-BF55-5B1E8AE3C91E"}
 */
function testNewRecord_success() {
    var f = forms.utFormBaseCRUDExt;
    f.registerCallLogCallback(logCall);

    var res = f.newRecord();
    jsunit.assertTrue(res);
    jsunit.assertEquals(5, m_CallLog.length);

    jsunit.assertEquals('beforeNewRecord', m_CallLog[0].name);
    jsunit.assertEquals(0, m_CallLog[0].args.length);

    jsunit.assertEquals('createNewRecord', m_CallLog[1].name);
    jsunit.assertEquals(0, m_CallLog[1].args.length);

    jsunit.assertEquals('track', m_CallLog[2].name);
    jsunit.assertEquals(1, m_CallLog[2].args.length);

    jsunit.assertEquals('afterNewRecord', m_CallLog[3].name);
    jsunit.assertEquals(1, m_CallLog[3].args.length);

    jsunit.assertEquals('updatingUI', m_CallLog[4].name);
    jsunit.assertEquals(0, m_CallLog[4].args.length);
}

/**
 * @properties={typeid:24,uuid:"BA72096B-B775-4812-9F46-B8E90364623E"}
 */
function testNewRecord_blockMove() {
    var f = forms.utFormBaseCRUDExt;
    f.registerCallLogCallback(logCall);

    f.getCrudPolicies().setRecordSelectionPolicy(scopes.svyCRUDManager.RECORD_SELECTION_POLICY.PREVENT_WHEN_EDITING);

    var res = f.newRecord();
    jsunit.assertTrue(res);

    m_CallLog = [];
    res = f.newRecord();
    jsunit.assertFalse(res);
    jsunit.assertEquals(1, m_CallLog.length);

    jsunit.assertEquals('onUserLeave', m_CallLog[0].name);
    jsunit.assertEquals(0, m_CallLog[0].args.length);

    f.m_UserLeaveResult = scopes.svyCRUDManager.USER_LEAVE.CANCEL_EDITS;
    m_CallLog = [];

    res = f.newRecord();
    jsunit.assertTrue(res);
    jsunit.assertEquals(12, m_CallLog.length);

    jsunit.assertEquals('onUserLeave', m_CallLog[0].name);
    jsunit.assertEquals(0, m_CallLog[0].args.length);

    jsunit.assertEquals('beforeCancel', m_CallLog[1].name);
    jsunit.assertEquals(1, m_CallLog[1].args.length);

    jsunit.assertEquals('clearValidationMarkers', m_CallLog[2].name);
    jsunit.assertEquals(0, m_CallLog[2].args.length);

    jsunit.assertEquals('releaseAllLocks', m_CallLog[3].name);
    jsunit.assertEquals(0, m_CallLog[3].args.length);

    jsunit.assertEquals('clearTracking', m_CallLog[4].name);
    jsunit.assertEquals(0, m_CallLog[4].args.length);

    jsunit.assertEquals('afterCancel', m_CallLog[5].name);
    jsunit.assertEquals(0, m_CallLog[5].args.length);

    jsunit.assertEquals('updatingUI', m_CallLog[6].name);
    jsunit.assertEquals(0, m_CallLog[6].args.length);

    jsunit.assertEquals('beforeNewRecord', m_CallLog[7].name);
    jsunit.assertEquals(0, m_CallLog[7].args.length);

    jsunit.assertEquals('createNewRecord', m_CallLog[8].name);
    jsunit.assertEquals(0, m_CallLog[8].args.length);

    jsunit.assertEquals('track', m_CallLog[9].name);
    jsunit.assertEquals(1, m_CallLog[9].args.length);

    jsunit.assertEquals('afterNewRecord', m_CallLog[10].name);
    jsunit.assertEquals(1, m_CallLog[10].args.length);

    jsunit.assertEquals('updatingUI', m_CallLog[11].name);
    jsunit.assertEquals(0, m_CallLog[11].args.length);
}

/**
 * @properties={typeid:24,uuid:"6BD4E7FB-072D-498D-B1EB-264E9AD5433D"}
 */
function testCancel_blockBefore() {
    var f = forms.utFormBaseCRUDExt;
    f.registerCallLogCallback(logCall);
    f.m_BeforeCancelResult = false;

    var res = f.newRecord();
    jsunit.assertTrue(res);
    m_CallLog = [];

    res = f.cancel();
    jsunit.assertFalse(res);

    jsunit.assertEquals(2, m_CallLog.length);

    jsunit.assertEquals('beforeCancel', m_CallLog[0].name);
    jsunit.assertEquals(1, m_CallLog[0].args.length);

    jsunit.assertEquals('updatingUI', m_CallLog[1].name);
    jsunit.assertEquals(0, m_CallLog[1].args.length);
}

/**
 * @properties={typeid:24,uuid:"274F3E40-340D-406E-8CE8-DE9515F2E191"}
 */
function testCancel_success() {
    var f = forms.utFormBaseCRUDExt;
    f.registerCallLogCallback(logCall);

    var res = f.newRecord();
    jsunit.assertTrue(res);
    m_CallLog = [];

    res = f.cancel();

    jsunit.assertTrue(res);
    jsunit.assertEquals(6, m_CallLog.length);

    jsunit.assertEquals('beforeCancel', m_CallLog[0].name);
    jsunit.assertEquals(1, m_CallLog[0].args.length);

    jsunit.assertEquals('clearValidationMarkers', m_CallLog[1].name);
    jsunit.assertEquals(0, m_CallLog[1].args.length);

    jsunit.assertEquals('releaseAllLocks', m_CallLog[2].name);
    jsunit.assertEquals(0, m_CallLog[2].args.length);

    jsunit.assertEquals('clearTracking', m_CallLog[3].name);
    jsunit.assertEquals(0, m_CallLog[3].args.length);

    jsunit.assertEquals('afterCancel', m_CallLog[4].name);
    jsunit.assertEquals(0, m_CallLog[4].args.length);

    jsunit.assertEquals('updatingUI', m_CallLog[5].name);
    jsunit.assertEquals(0, m_CallLog[5].args.length);
}

/**
 * @properties={typeid:24,uuid:"DAC46EB0-79C4-49EA-AE22-5148BF349AFA"}
 */
function testSave_blockBefore_noLock() {
    var f = forms.utFormBaseCRUDExt;
    f.registerCallLogCallback(logCall);
    f.getCrudPolicies().setRecordLockingPolicy(scopes.svyCRUDManager.RECORD_LOCKING_POLICY.NONE);
    f.m_BeforeSaveResult = false;

    var res = f.newRecord();
    jsunit.assertTrue(res);
    m_CallLog = [];
    var rec = f.foundset.getSelectedRecord();
    res = f.save();
    jsunit.assertFalse(res);

    jsunit.assertEquals(3, m_CallLog.length);

    jsunit.assertEquals('beforeSave', m_CallLog[0].name);
    jsunit.assertEquals(1, m_CallLog[0].args.length);
    jsunit.assertEquals(1, m_CallLog[0].args[0].length);
    jsunit.assertSame(rec, m_CallLog[0].args[0][0]);

    jsunit.assertEquals('updatingUI', m_CallLog[1].name);
    jsunit.assertEquals(0, m_CallLog[1].args.length);

    jsunit.assertEquals('releaseAllLocks', m_CallLog[2].name);
    jsunit.assertEquals(0, m_CallLog[2].args.length);
}

/**
 * @properties={typeid:24,uuid:"F2169A95-E861-4A92-A357-F05B16A20EA1"}
 */
function testSave_blockBefore_withLock() {
    var f = forms.utFormBaseCRUDExt;
    f.registerCallLogCallback(logCall);
    f.getCrudPolicies().setRecordLockingPolicy(scopes.svyCRUDManager.RECORD_LOCKING_POLICY.AUTO);
    f.m_BeforeSaveResult = false;

    var res = f.newRecord();
    jsunit.assertTrue(res);
    m_CallLog = [];
    var rec = f.foundset.getSelectedRecord();
    res = f.save();
    jsunit.assertFalse(res);

    jsunit.assertEquals(4, m_CallLog.length);

    jsunit.assertEquals('lockRecords', m_CallLog[0].name);
    jsunit.assertEquals(1, m_CallLog[0].args.length);
    jsunit.assertEquals(1, m_CallLog[0].args[0].length);
    jsunit.assertSame(rec, m_CallLog[0].args[0][0]);

    jsunit.assertEquals('beforeSave', m_CallLog[1].name);
    jsunit.assertEquals(1, m_CallLog[1].args.length);
    jsunit.assertEquals(1, m_CallLog[1].args[0].length);
    jsunit.assertSame(rec, m_CallLog[1].args[0][0]);

    jsunit.assertEquals('updatingUI', m_CallLog[2].name);
    jsunit.assertEquals(0, m_CallLog[2].args.length);

    jsunit.assertEquals('releaseAllLocks', m_CallLog[3].name);
    jsunit.assertEquals(0, m_CallLog[3].args.length);
}

/**
 * @properties={typeid:24,uuid:"5E82C913-BDFF-48D0-BE1D-2B31E41DAF2C"}
 */
function testSave_validationErrors_withLock() {
    var f = forms.utFormBaseCRUDExt;
    f.registerCallLogCallback(logCall);
    f.getCrudPolicies().setRecordLockingPolicy(scopes.svyCRUDManager.RECORD_LOCKING_POLICY.AUTO).setValidationPolicy(scopes.svyCRUDManager.VALIDATION_POLICY.DEFERRED);

    var res = f.newRecord();
    jsunit.assertTrue(res);
    m_CallLog = [];
    var rec = f.foundset.getSelectedRecord();
    try {
        forms.utValidationProviderA.setValidationResult([new scopes.svyValidationManager.ValidationMarker(rec, 'TestValidationError', scopes.svyValidationManager.VALIDATION_LEVEL.ERROR)]);

        res = f.save();
        jsunit.assertFalse(res);

        jsunit.assertEquals(5, m_CallLog.length);

        jsunit.assertEquals('lockRecords', m_CallLog[0].name);
        jsunit.assertEquals(1, m_CallLog[0].args.length);
        jsunit.assertEquals(1, m_CallLog[0].args[0].length);
        jsunit.assertSame(rec, m_CallLog[0].args[0][0]);

        jsunit.assertEquals('beforeSave', m_CallLog[1].name);
        jsunit.assertEquals(1, m_CallLog[1].args.length);
        jsunit.assertEquals(1, m_CallLog[1].args[0].length);
        jsunit.assertSame(rec, m_CallLog[1].args[0][0]);

        jsunit.assertEquals('validate', m_CallLog[2].name);
        jsunit.assertEquals(1, m_CallLog[2].args.length);
        jsunit.assertEquals(1, m_CallLog[2].args[0].length);
        jsunit.assertSame(rec, m_CallLog[2].args[0][0]);

        jsunit.assertEquals('updatingUI', m_CallLog[3].name);
        jsunit.assertEquals(0, m_CallLog[3].args.length);

        jsunit.assertEquals('releaseAllLocks', m_CallLog[4].name);
        jsunit.assertEquals(0, m_CallLog[4].args.length);
    } finally {
        forms.utValidationProviderA.setValidationResult([]);
    }
}

/**
 * @properties={typeid:24,uuid:"8E8CE832-3730-483E-9191-5DFE4150AFDF"}
 */
function testSave_failSaveValidatedRecords_withLock() {
    var f = forms.utFormBaseCRUDExt;
    f.registerCallLogCallback(logCall);
    f.getCrudPolicies().setRecordLockingPolicy(scopes.svyCRUDManager.RECORD_LOCKING_POLICY.AUTO).setValidationPolicy(scopes.svyCRUDManager.VALIDATION_POLICY.DEFERRED);
    f.m_FailSaveValidatedRecords = true;
    var res = f.newRecord();
    jsunit.assertTrue(res);
    m_CallLog = [];
    var rec = f.foundset.getSelectedRecord();
    res = f.save();
    jsunit.assertFalse(res);

    jsunit.assertEquals(8, m_CallLog.length);

    jsunit.assertEquals('lockRecords', m_CallLog[0].name);
    jsunit.assertEquals(1, m_CallLog[0].args.length);
    jsunit.assertEquals(1, m_CallLog[0].args[0].length);
    jsunit.assertSame(rec, m_CallLog[0].args[0][0]);

    jsunit.assertEquals('beforeSave', m_CallLog[1].name);
    jsunit.assertEquals(1, m_CallLog[1].args.length);
    jsunit.assertEquals(1, m_CallLog[1].args[0].length);
    jsunit.assertSame(rec, m_CallLog[1].args[0][0]);

    jsunit.assertEquals('validate', m_CallLog[2].name);
    jsunit.assertEquals(1, m_CallLog[2].args.length);
    jsunit.assertEquals(1, m_CallLog[2].args[0].length);
    jsunit.assertSame(rec, m_CallLog[2].args[0][0]);

    jsunit.assertEquals('saveValidatedRecords', m_CallLog[3].name);
    jsunit.assertEquals(1, m_CallLog[3].args.length);
    jsunit.assertEquals(1, m_CallLog[3].args[0].length);
    jsunit.assertSame(rec, m_CallLog[3].args[0][0]);

    jsunit.assertEquals('releaseAllLocks', m_CallLog[4].name);
    jsunit.assertEquals(0, m_CallLog[4].args.length);

    jsunit.assertEquals('onSaveError', m_CallLog[5].name);
    jsunit.assertEquals(1, m_CallLog[5].args.length);

    jsunit.assertEquals('updatingUI', m_CallLog[6].name);
    jsunit.assertEquals(0, m_CallLog[6].args.length);

    jsunit.assertEquals('releaseAllLocks', m_CallLog[7].name);
    jsunit.assertEquals(0, m_CallLog[7].args.length);
}

/**
 * @properties={typeid:24,uuid:"B9BDD4DD-532D-425C-B06B-CDC0011D2EFE"}
 */
function testSave_failDBError_withLock() {
    var f = forms.utFormBaseCRUDExt;
    f.registerCallLogCallback(logCall);
    f.getCrudPolicies().setRecordLockingPolicy(scopes.svyCRUDManager.RECORD_LOCKING_POLICY.AUTO).setValidationPolicy(scopes.svyCRUDManager.VALIDATION_POLICY.DEFERRED);

    var res = f.newRecord();
    jsunit.assertTrue(res);
    m_CallLog = [];
    var rec = f.foundset.getSelectedRecord();
    //save without filling in required data so the db save will fail
    res = f.save();
    jsunit.assertFalse(res);

    jsunit.assertEquals(8, m_CallLog.length);

    jsunit.assertEquals('lockRecords', m_CallLog[0].name);
    jsunit.assertEquals(1, m_CallLog[0].args.length);
    jsunit.assertEquals(1, m_CallLog[0].args[0].length);
    jsunit.assertSame(rec, m_CallLog[0].args[0][0]);

    jsunit.assertEquals('beforeSave', m_CallLog[1].name);
    jsunit.assertEquals(1, m_CallLog[1].args.length);
    jsunit.assertEquals(1, m_CallLog[1].args[0].length);
    jsunit.assertSame(rec, m_CallLog[1].args[0][0]);

    jsunit.assertEquals('validate', m_CallLog[2].name);
    jsunit.assertEquals(1, m_CallLog[2].args.length);
    jsunit.assertEquals(1, m_CallLog[2].args[0].length);
    jsunit.assertSame(rec, m_CallLog[2].args[0][0]);

    jsunit.assertEquals('saveValidatedRecords', m_CallLog[3].name);
    jsunit.assertEquals(1, m_CallLog[3].args.length);
    jsunit.assertEquals(1, m_CallLog[3].args[0].length);
    jsunit.assertSame(rec, m_CallLog[3].args[0][0]);

    jsunit.assertEquals('releaseAllLocks', m_CallLog[4].name);
    jsunit.assertEquals(0, m_CallLog[4].args.length);

    jsunit.assertEquals('onSaveError', m_CallLog[5].name);
    jsunit.assertEquals(1, m_CallLog[5].args.length);

    jsunit.assertEquals('updatingUI', m_CallLog[6].name);
    jsunit.assertEquals(0, m_CallLog[6].args.length);

    jsunit.assertEquals('releaseAllLocks', m_CallLog[7].name);
    jsunit.assertEquals(0, m_CallLog[7].args.length);
}

/**
 * @properties={typeid:24,uuid:"E3BC82E0-CE8D-4377-9C29-913B354277FB"}
 */
function testSave_success_withLock() {
    var f = forms.utFormBaseCRUDExt;
    f.registerCallLogCallback(logCall);
    f.getCrudPolicies().setRecordLockingPolicy(scopes.svyCRUDManager.RECORD_LOCKING_POLICY.AUTO).setValidationPolicy(scopes.svyCRUDManager.VALIDATION_POLICY.DEFERRED);

    var res = f.newRecord();
    jsunit.assertTrue(res);
    m_CallLog = [];
    var rec = f.foundset.getSelectedRecord();
    //make a valid record which can be saved
    rec.categoryname = 'test name';
    res = f.save();
    jsunit.assertTrue(res);

    jsunit.assertEquals(9, m_CallLog.length);

    jsunit.assertEquals('lockRecords', m_CallLog[0].name);
    jsunit.assertEquals(1, m_CallLog[0].args.length);
    jsunit.assertEquals(1, m_CallLog[0].args[0].length);
    jsunit.assertSame(rec, m_CallLog[0].args[0][0]);

    jsunit.assertEquals('beforeSave', m_CallLog[1].name);
    jsunit.assertEquals(1, m_CallLog[1].args.length);
    jsunit.assertEquals(1, m_CallLog[1].args[0].length);
    jsunit.assertSame(rec, m_CallLog[1].args[0][0]);

    jsunit.assertEquals('validate', m_CallLog[2].name);
    jsunit.assertEquals(1, m_CallLog[2].args.length);
    jsunit.assertEquals(1, m_CallLog[2].args[0].length);
    jsunit.assertSame(rec, m_CallLog[2].args[0][0]);

    jsunit.assertEquals('saveValidatedRecords', m_CallLog[3].name);
    jsunit.assertEquals(1, m_CallLog[3].args.length);
    jsunit.assertEquals(1, m_CallLog[3].args[0].length);
    jsunit.assertSame(rec, m_CallLog[3].args[0][0]);

    jsunit.assertEquals('releaseAllLocks', m_CallLog[4].name);
    jsunit.assertEquals(0, m_CallLog[4].args.length);

    jsunit.assertEquals('clearValidationMarkers', m_CallLog[5].name);
    jsunit.assertEquals(0, m_CallLog[5].args.length);

    jsunit.assertEquals('clearTracking', m_CallLog[6].name);
    jsunit.assertEquals(0, m_CallLog[6].args.length);

    jsunit.assertEquals('afterSave', m_CallLog[7].name);
    jsunit.assertEquals(0, m_CallLog[7].args.length);

    jsunit.assertEquals('updatingUI', m_CallLog[8].name);
    jsunit.assertEquals(0, m_CallLog[8].args.length);
}

/**
 * @properties={typeid:24,uuid:"411A6EF4-A311-49A7-BC7B-5172C2A368AC"}
 */
function testDelete_noRecord() {
    var f = forms.utFormBaseCRUDExt;
    f.registerCallLogCallback(logCall);
    f.foundset.clear();
    m_CallLog = [];
    var res = f.save();
    jsunit.assertFalse(res);

    jsunit.assertEquals(0, m_CallLog.length);
}

/**
 * @properties={typeid:24,uuid:"447F21AB-5A7E-4DA2-89AC-859E4DA4DD3D"}
 */
function testDelete_blockConfirm() {
    var f = forms.utFormBaseCRUDExt;
    f.registerCallLogCallback(logCall);
    f.getCrudPolicies().setRecordLockingPolicy(scopes.svyCRUDManager.RECORD_LOCKING_POLICY.AUTO);

    var res = f.newRecord();
    jsunit.assertTrue(res);
    var rec = f.foundset.getSelectedRecord();
    rec.categoryname = 'TestName';
    res = f.save();
    jsunit.assertTrue(res);

    f.m_ConfirmDeleteResult = false;
    m_CallLog = [];

    res = f.deleteSelectedRecords();
    jsunit.assertFalse(res);

    jsunit.assertEquals(1, m_CallLog.length);

    jsunit.assertEquals('confirmDelete', m_CallLog[0].name);
    jsunit.assertEquals(1, m_CallLog[0].args.length);
    jsunit.assertEquals(1, m_CallLog[0].args[0].length);
    jsunit.assertSame(rec, m_CallLog[0].args[0][0]);
}

/**
 * @properties={typeid:24,uuid:"BA5DFCB9-E7D8-4BD3-8AA9-91BE0340FF26"}
 */
function testDelete_blockBefore_withLock() {
    var f = forms.utFormBaseCRUDExt;
    f.registerCallLogCallback(logCall);
    f.getCrudPolicies().setRecordLockingPolicy(scopes.svyCRUDManager.RECORD_LOCKING_POLICY.AUTO);

    var res = f.newRecord();
    jsunit.assertTrue(res);
    var rec = f.foundset.getSelectedRecord();
    rec.categoryname = 'TestName';
    res = f.save();
    jsunit.assertTrue(res);

    f.m_BeforeDeleteResult = false;
    m_CallLog = [];

    res = f.deleteSelectedRecords();
    jsunit.assertFalse(res);

    jsunit.assertEquals(5, m_CallLog.length);

    jsunit.assertEquals('confirmDelete', m_CallLog[0].name);
    jsunit.assertEquals(1, m_CallLog[0].args.length);
    jsunit.assertEquals(1, m_CallLog[0].args[0].length);
    jsunit.assertSame(rec, m_CallLog[0].args[0][0]);

    jsunit.assertEquals('lockRecords', m_CallLog[1].name);
    jsunit.assertEquals(1, m_CallLog[1].args.length);
    jsunit.assertEquals(1, m_CallLog[1].args[0].length);
    jsunit.assertSame(rec, m_CallLog[1].args[0][0]);

    jsunit.assertEquals('beforeDelete', m_CallLog[2].name);
    jsunit.assertEquals(1, m_CallLog[2].args.length);
    jsunit.assertEquals(1, m_CallLog[2].args[0].length);
    jsunit.assertSame(rec, m_CallLog[2].args[0][0]);

    jsunit.assertEquals('updatingUI', m_CallLog[3].name);
    jsunit.assertEquals(0, m_CallLog[3].args.length);

    jsunit.assertEquals('releaseAllLocks', m_CallLog[4].name);
    jsunit.assertEquals(0, m_CallLog[4].args.length);
}

/**
 * @properties={typeid:24,uuid:"E44EE84A-8824-416C-882C-2A35431C2AA1"}
 */
function testDelete_validationError_withLock() {
    var f = forms.utFormBaseCRUDExt;
    f.registerCallLogCallback(logCall);
    f.getCrudPolicies().setRecordLockingPolicy(scopes.svyCRUDManager.RECORD_LOCKING_POLICY.AUTO);

    var res = f.newRecord();
    jsunit.assertTrue(res);
    var rec = f.foundset.getSelectedRecord();
    rec.categoryname = 'TestName';
    res = f.save();
    jsunit.assertTrue(res);

    m_CallLog = [];

    forms.utValidationProviderA.setValidationResult([new scopes.svyValidationManager.ValidationMarker(rec, 'TestDeleteValidationError', scopes.svyValidationManager.VALIDATION_LEVEL.ERROR)]);
    try {

        res = f.deleteSelectedRecords();
        jsunit.assertFalse(res);

        jsunit.assertEquals(6, m_CallLog.length);

        jsunit.assertEquals('confirmDelete', m_CallLog[0].name);
        jsunit.assertEquals(1, m_CallLog[0].args.length);
        jsunit.assertEquals(1, m_CallLog[0].args[0].length);
        jsunit.assertSame(rec, m_CallLog[0].args[0][0]);

        jsunit.assertEquals('lockRecords', m_CallLog[1].name);
        jsunit.assertEquals(1, m_CallLog[1].args.length);
        jsunit.assertEquals(1, m_CallLog[1].args[0].length);
        jsunit.assertSame(rec, m_CallLog[1].args[0][0]);

        jsunit.assertEquals('beforeDelete', m_CallLog[2].name);
        jsunit.assertEquals(1, m_CallLog[2].args.length);
        jsunit.assertEquals(1, m_CallLog[2].args[0].length);
        jsunit.assertSame(rec, m_CallLog[2].args[0][0]);

        jsunit.assertEquals('canDelete', m_CallLog[3].name);
        jsunit.assertEquals(1, m_CallLog[3].args.length);
        jsunit.assertEquals(1, m_CallLog[3].args[0].length);
        jsunit.assertSame(rec, m_CallLog[3].args[0][0]);

        jsunit.assertEquals('updatingUI', m_CallLog[4].name);
        jsunit.assertEquals(0, m_CallLog[4].args.length);

        jsunit.assertEquals('releaseAllLocks', m_CallLog[5].name);
        jsunit.assertEquals(0, m_CallLog[5].args.length);
    } finally {
        forms.utValidationProviderA.setValidationResult([]);
    }
}

/**
 * @properties={typeid:24,uuid:"375A78F6-1A07-49F5-958A-06EF6104DE30"}
 */
function testDelete_failDeleteValidatedRecords_withLock() {
    var f = forms.utFormBaseCRUDExt;
    f.registerCallLogCallback(logCall);
    f.getCrudPolicies().setRecordLockingPolicy(scopes.svyCRUDManager.RECORD_LOCKING_POLICY.AUTO);

    var res = f.newRecord();
    jsunit.assertTrue(res);
    var rec = f.foundset.getSelectedRecord();
    rec.categoryname = 'TestName';
    res = f.save();
    jsunit.assertTrue(res);

    f.m_FailDeleteValidatedRecords = true;
    m_CallLog = [];

    res = f.deleteSelectedRecords();
    jsunit.assertFalse(res);

    jsunit.assertEquals(9, m_CallLog.length);

    jsunit.assertEquals('confirmDelete', m_CallLog[0].name);
    jsunit.assertEquals(1, m_CallLog[0].args.length);
    jsunit.assertEquals(1, m_CallLog[0].args[0].length);
    jsunit.assertSame(rec, m_CallLog[0].args[0][0]);

    jsunit.assertEquals('lockRecords', m_CallLog[1].name);
    jsunit.assertEquals(1, m_CallLog[1].args.length);
    jsunit.assertEquals(1, m_CallLog[1].args[0].length);
    jsunit.assertSame(rec, m_CallLog[1].args[0][0]);

    jsunit.assertEquals('beforeDelete', m_CallLog[2].name);
    jsunit.assertEquals(1, m_CallLog[2].args.length);
    jsunit.assertEquals(1, m_CallLog[2].args[0].length);
    jsunit.assertSame(rec, m_CallLog[2].args[0][0]);

    jsunit.assertEquals('canDelete', m_CallLog[3].name);
    jsunit.assertEquals(1, m_CallLog[3].args.length);
    jsunit.assertEquals(1, m_CallLog[3].args[0].length);
    jsunit.assertSame(rec, m_CallLog[3].args[0][0]);

    jsunit.assertEquals('deleteValidatedRecords', m_CallLog[4].name);
    jsunit.assertEquals(1, m_CallLog[4].args.length);
    jsunit.assertEquals(1, m_CallLog[4].args[0].length);
    jsunit.assertSame(rec, m_CallLog[4].args[0][0]);

    jsunit.assertEquals('releaseAllLocks', m_CallLog[5].name);
    jsunit.assertEquals(0, m_CallLog[5].args.length);

    jsunit.assertEquals('onDeleteError', m_CallLog[6].name);
    jsunit.assertEquals(1, m_CallLog[6].args.length);

    jsunit.assertEquals('updatingUI', m_CallLog[7].name);
    jsunit.assertEquals(0, m_CallLog[7].args.length);

    jsunit.assertEquals('releaseAllLocks', m_CallLog[8].name);
    jsunit.assertEquals(0, m_CallLog[8].args.length);
}

/**
 * @properties={typeid:24,uuid:"735A75B7-77B0-4B79-B73F-B401FB4394CE"}
 */
function testDelete_success_withLock() {
    var f = forms.utFormBaseCRUDExt;
    f.registerCallLogCallback(logCall);
    f.getCrudPolicies().setRecordLockingPolicy(scopes.svyCRUDManager.RECORD_LOCKING_POLICY.AUTO);

    var res = f.newRecord();
    jsunit.assertTrue(res);
    var rec = f.foundset.getSelectedRecord();
    rec.categoryname = 'TestName';
    res = f.save();
    jsunit.assertTrue(res);

    m_CallLog = [];

    res = f.deleteSelectedRecords();
    jsunit.assertTrue(res);

    jsunit.assertEquals(10, m_CallLog.length);

    jsunit.assertEquals('confirmDelete', m_CallLog[0].name);
    jsunit.assertEquals(1, m_CallLog[0].args.length);
    jsunit.assertEquals(1, m_CallLog[0].args[0].length);
    jsunit.assertSame(rec, m_CallLog[0].args[0][0]);

    jsunit.assertEquals('lockRecords', m_CallLog[1].name);
    jsunit.assertEquals(1, m_CallLog[1].args.length);
    jsunit.assertEquals(1, m_CallLog[1].args[0].length);
    jsunit.assertSame(rec, m_CallLog[1].args[0][0]);

    jsunit.assertEquals('beforeDelete', m_CallLog[2].name);
    jsunit.assertEquals(1, m_CallLog[2].args.length);
    jsunit.assertEquals(1, m_CallLog[2].args[0].length);
    jsunit.assertSame(rec, m_CallLog[2].args[0][0]);

    jsunit.assertEquals('canDelete', m_CallLog[3].name);
    jsunit.assertEquals(1, m_CallLog[3].args.length);
    jsunit.assertEquals(1, m_CallLog[3].args[0].length);
    jsunit.assertSame(rec, m_CallLog[3].args[0][0]);

    jsunit.assertEquals('deleteValidatedRecords', m_CallLog[4].name);
    jsunit.assertEquals(1, m_CallLog[4].args.length);
    jsunit.assertEquals(1, m_CallLog[4].args[0].length);
    jsunit.assertSame(rec, m_CallLog[4].args[0][0]);

    jsunit.assertEquals('releaseAllLocks', m_CallLog[5].name);
    jsunit.assertEquals(0, m_CallLog[5].args.length);

    jsunit.assertEquals('clearValidationMarkers', m_CallLog[6].name);
    jsunit.assertEquals(0, m_CallLog[6].args.length);

    jsunit.assertEquals('untrack', m_CallLog[7].name);
    jsunit.assertEquals(1, m_CallLog[7].args.length);
    jsunit.assertEquals(1, m_CallLog[7].args[0].length);
    jsunit.assertSame(rec, m_CallLog[7].args[0][0]);

    jsunit.assertEquals('afterDelete', m_CallLog[8].name);
    jsunit.assertEquals(0, m_CallLog[8].args.length);

    jsunit.assertEquals('updatingUI', m_CallLog[9].name);
    jsunit.assertEquals(0, m_CallLog[9].args.length);
}

/**
 * @properties={typeid:24,uuid:"9019F778-F859-49C4-9F28-3ADEC5295FAF"}
 */
function testNavigation(){
    var f = forms.utFormBaseCRUDExt;
    f.registerCallLogCallback(logCall);
    f.foundset.clear();
    
    var res = f.newRecord();
    jsunit.assertTrue(res);
    var rec = f.foundset.getSelectedRecord();
    rec.categoryname = 'Record-1';
    res = f.save();
    jsunit.assertTrue(res);
    
    res = f.newRecord();
    jsunit.assertTrue(res);
    rec = f.foundset.getSelectedRecord();
    rec.categoryname = 'Record-2';
    res = f.save();
    jsunit.assertTrue(res);
    
    res = f.newRecord();
    jsunit.assertTrue(res);
    rec = f.foundset.getSelectedRecord();
    rec.categoryname = 'Record-3';
    res = f.save();
    jsunit.assertTrue(res);

    f.foundset.setSelectedIndex(1);
    m_CallLog = [];
    
    res = f.selectFirstRecord();
    jsunit.assertFalse(res);
    jsunit.assertEquals(1,f.foundset.getSelectedIndex());
    
    res = f.selectPreviousRecord();
    jsunit.assertFalse(res);
    jsunit.assertEquals(1,f.foundset.getSelectedIndex());
    
    res = f.selectNextRecord();
    jsunit.assertTrue(res);
    jsunit.assertEquals(2,f.foundset.getSelectedIndex());
    
    res = f.selectFirstRecord();
    jsunit.assertTrue(res);
    jsunit.assertEquals(1,f.foundset.getSelectedIndex());
        
    res = f.selectLastRecord();
    jsunit.assertTrue(res);
    jsunit.assertEquals(3,f.foundset.getSelectedIndex());    
        
    res = f.selectLastRecord();
    jsunit.assertFalse(res);
    jsunit.assertEquals(3,f.foundset.getSelectedIndex());    
        
    res = f.selectNextRecord();
    jsunit.assertFalse(res);
    jsunit.assertEquals(3,f.foundset.getSelectedIndex());    
    
    res = f.selectPreviousRecord();
    jsunit.assertTrue(res);
    jsunit.assertEquals(2,f.foundset.getSelectedIndex());    
}

/**
 * @properties={typeid:24,uuid:"5547872D-2041-47E3-9CE6-6033558D588F"}
 */
function testNavigation_recordSelectionAllowedWhenEditing(){
    var f = forms.utFormBaseCRUDExt;
    f.registerCallLogCallback(logCall);
    f.getCrudPolicies().setRecordSelectionPolicy(scopes.svyCRUDManager.RECORD_SELECTION_POLICY.ALLOW_WHEN_EDITING).setBatchScopePolicy(scopes.svyCRUDManager.BATCH_SCOPE_POLICY.FOUNDSET);
    f.foundset.clear();
    
    var res = f.newRecord();
    jsunit.assertTrue(res);
    var rec = f.foundset.getSelectedRecord();
    rec.categoryname = 'Record-1';
    res = f.save();
    jsunit.assertTrue(res);
    
    res = f.newRecord();
    jsunit.assertTrue(res);
    rec = f.foundset.getSelectedRecord();
    rec.categoryname = 'Record-2';
    res = f.save();
    jsunit.assertTrue(res);
    
    res = f.newRecord();
    jsunit.assertTrue(res);
    rec = f.foundset.getSelectedRecord();
    rec.categoryname = 'Record-3';
    res = f.save();
    jsunit.assertTrue(res);

    f.foundset.setSelectedIndex(1);
    rec.categoryname = 'SomeNewValue';
    f.onElementDataChange('Record-1', 'SomeNewValue', f.getFakeEvent());
    m_CallLog = [];
    
    res = f.selectFirstRecord();
    jsunit.assertFalse(res);
    jsunit.assertEquals(1,f.foundset.getSelectedIndex());
    
    res = f.selectPreviousRecord();
    jsunit.assertFalse(res);
    jsunit.assertEquals(1,f.foundset.getSelectedIndex());
    
    res = f.selectNextRecord();
    jsunit.assertTrue(res);
    jsunit.assertEquals(2,f.foundset.getSelectedIndex());
    
    res = f.selectFirstRecord();
    jsunit.assertTrue(res);
    jsunit.assertEquals(1,f.foundset.getSelectedIndex());
        
    res = f.selectLastRecord();
    jsunit.assertTrue(res);
    jsunit.assertEquals(3,f.foundset.getSelectedIndex());    
        
    res = f.selectLastRecord();
    jsunit.assertFalse(res);
    jsunit.assertEquals(3,f.foundset.getSelectedIndex());    
        
    res = f.selectNextRecord();
    jsunit.assertFalse(res);
    jsunit.assertEquals(3,f.foundset.getSelectedIndex());    
    
    res = f.selectPreviousRecord();
    jsunit.assertTrue(res);
    jsunit.assertEquals(2,f.foundset.getSelectedIndex());    
}

/**
 * @properties={typeid:24,uuid:"E2A269AC-7A41-44BF-8CD6-26579B3FC5E2"}
 */
function testNavigation_recordSelectionPreventWhenEditing(){
    var f = forms.utFormBaseCRUDExt;
    f.registerCallLogCallback(logCall);
    f.getCrudPolicies().setRecordSelectionPolicy(scopes.svyCRUDManager.RECORD_SELECTION_POLICY.PREVENT_WHEN_EDITING).setBatchScopePolicy(scopes.svyCRUDManager.BATCH_SCOPE_POLICY.FOUNDSET);
    f.foundset.clear();
    
    var res = f.newRecord();
    jsunit.assertTrue(res);
    var rec = f.foundset.getSelectedRecord();
    rec.categoryname = 'Record-1';
    res = f.save();
    jsunit.assertTrue(res);
    
    res = f.newRecord();
    jsunit.assertTrue(res);
    rec = f.foundset.getSelectedRecord();
    rec.categoryname = 'Record-2';
    res = f.save();
    jsunit.assertTrue(res);
    
    res = f.newRecord();
    jsunit.assertTrue(res);
    rec = f.foundset.getSelectedRecord();
    rec.categoryname = 'Record-3';
    res = f.save();
    jsunit.assertTrue(res);

    f.foundset.setSelectedIndex(1);
    rec.categoryname = 'SomeNewValue';
    f.onElementDataChange('Record-1', 'SomeNewValue', f.getFakeEvent());
    m_CallLog = [];
    
    res = f.selectFirstRecord();
    jsunit.assertFalse(res);
    jsunit.assertEquals(1,f.foundset.getSelectedIndex());
    
    res = f.selectPreviousRecord();
    jsunit.assertFalse(res);
    jsunit.assertEquals(1,f.foundset.getSelectedIndex());
    
    res = f.selectNextRecord();
    jsunit.assertFalse(res);
    jsunit.assertEquals(1,f.foundset.getSelectedIndex());
    
    res = f.selectLastRecord();
    jsunit.assertFalse(res);
    jsunit.assertEquals(1,f.foundset.getSelectedIndex());    
    
    res = f.save();
    jsunit.assertTrue(res);
    
    res = f.selectLastRecord();
    jsunit.assertTrue(res);
    jsunit.assertEquals(3,f.foundset.getSelectedIndex());    
        
    res = f.selectPreviousRecord();
    jsunit.assertTrue(res);
    jsunit.assertEquals(2,f.foundset.getSelectedIndex());    
    
    res = f.selectFirstRecord();
    jsunit.assertTrue(res);
    jsunit.assertEquals(1,f.foundset.getSelectedIndex());
    
    res = f.selectNextRecord();
    jsunit.assertTrue(res);
    jsunit.assertEquals(2,f.foundset.getSelectedIndex());        
}

/**
 * @properties={typeid:24,uuid:"54371702-4CDA-4D09-B343-8EFEBC53D191"}
 */
function testStandardActions_allowSelectionWhenEditing(){
    var f = forms.utFormBaseCRUDExt;
    
    var actionNames = f.getActionNames();
    jsunit.assertEquals(8, actionNames.length);
    
    f.registerCallLogCallback(logCall);
    f.getCrudPolicies().setRecordSelectionPolicy(scopes.svyCRUDManager.RECORD_SELECTION_POLICY.ALLOW_WHEN_EDITING).setBatchScopePolicy(scopes.svyCRUDManager.BATCH_SCOPE_POLICY.FOUNDSET);
    f.foundset.clear();
    f.updateStandardFormActionsState();
    
    //when no record is selected only the NEW action should be enabled
    var action = f.getAction(f.FORM_ACTION_NAMES.FIRST);
    jsunit.assertNotNull(action);
    jsunit.assertFalse(action.isEnabled());
    jsunit.assertTrue(action.isVisible());
    jsunit.assertFalse(action.isToggleAction());
    jsunit.assertFalse(action.isSelected());
    
    action = f.getAction(f.FORM_ACTION_NAMES.PREVIOUS);
    jsunit.assertNotNull(action);
    jsunit.assertFalse(action.isEnabled());
    jsunit.assertTrue(action.isVisible());
    jsunit.assertFalse(action.isToggleAction());
    jsunit.assertFalse(action.isSelected());
    
    action = f.getAction(f.FORM_ACTION_NAMES.NEXT);
    jsunit.assertNotNull(action);
    jsunit.assertFalse(action.isEnabled());
    jsunit.assertTrue(action.isVisible());
    jsunit.assertFalse(action.isToggleAction());
    jsunit.assertFalse(action.isSelected());
    
    action = f.getAction(f.FORM_ACTION_NAMES.LAST);
    jsunit.assertNotNull(action);
    jsunit.assertFalse(action.isEnabled());
    jsunit.assertTrue(action.isVisible());
    jsunit.assertFalse(action.isToggleAction());
    jsunit.assertFalse(action.isSelected());
    
    action = f.getAction(f.FORM_ACTION_NAMES.SAVE);
    jsunit.assertNotNull(action);
    jsunit.assertFalse(action.isEnabled());
    jsunit.assertTrue(action.isVisible());
    jsunit.assertFalse(action.isToggleAction());
    jsunit.assertFalse(action.isSelected());
    
    action = f.getAction(f.FORM_ACTION_NAMES.CANCEL);
    jsunit.assertNotNull(action);
    jsunit.assertFalse(action.isEnabled());
    jsunit.assertTrue(action.isVisible());
    jsunit.assertFalse(action.isToggleAction());
    jsunit.assertFalse(action.isSelected());
    
    action = f.getAction(f.FORM_ACTION_NAMES.DELETE);
    jsunit.assertNotNull(action);
    jsunit.assertFalse(action.isEnabled());
    jsunit.assertTrue(action.isVisible());
    jsunit.assertFalse(action.isToggleAction());
    jsunit.assertFalse(action.isSelected());
    
    action = f.getAction(f.FORM_ACTION_NAMES.NEW);
    jsunit.assertNotNull(action);
    jsunit.assertTrue(action.isEnabled());
    jsunit.assertTrue(action.isVisible());
    jsunit.assertFalse(action.isToggleAction());
    jsunit.assertFalse(action.isSelected());
 
    var res = f.newRecord();
    jsunit.assertTrue(res);
    var rec = f.foundset.getSelectedRecord();
    rec.categoryname = 'Record-1';
    res = f.save();
    jsunit.assertTrue(res);
    
    res = f.newRecord();
    jsunit.assertTrue(res);
    rec = f.foundset.getSelectedRecord();
    rec.categoryname = 'Record-2';
    
    //2 records, first is not saved yet and is the selected one (newRecord adds records on top!!)
    action = f.getAction(f.FORM_ACTION_NAMES.FIRST);
    jsunit.assertFalse(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.PREVIOUS);
    jsunit.assertFalse(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.NEXT);
    jsunit.assertTrue(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.LAST);
    jsunit.assertTrue(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.NEW);
    jsunit.assertTrue(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.SAVE);
    jsunit.assertTrue(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.CANCEL);
    jsunit.assertTrue(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.DELETE);
    jsunit.assertFalse(action.isEnabled());
    
    res = f.save();
    jsunit.assertTrue(res);
    
    //2 records, all saved, first record is selected
    action = f.getAction(f.FORM_ACTION_NAMES.FIRST);
    jsunit.assertFalse(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.PREVIOUS);
    jsunit.assertFalse(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.NEXT);
    jsunit.assertTrue(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.LAST);
    jsunit.assertTrue(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.NEW);
    jsunit.assertTrue(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.SAVE);
    jsunit.assertFalse(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.CANCEL);
    jsunit.assertFalse(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.DELETE);
    jsunit.assertTrue(action.isEnabled());
    
    res = f.selectLastRecord();
    //for some reason the above does not fire the onRecordSelection in unit test context
    f.updateStandardFormActionsState();
    jsunit.assertTrue(res);
    
    //2 records, all saved, last record is selected
    action = f.getAction(f.FORM_ACTION_NAMES.FIRST);
    jsunit.assertTrue(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.PREVIOUS);
    jsunit.assertTrue(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.NEXT);
    jsunit.assertFalse(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.LAST);
    jsunit.assertFalse(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.NEW);
    jsunit.assertTrue(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.SAVE);
    jsunit.assertFalse(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.CANCEL);
    jsunit.assertFalse(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.DELETE);
    jsunit.assertTrue(action.isEnabled());
}

/**
 * @properties={typeid:24,uuid:"03DCF979-A9B2-45F3-8692-41C30C86D731"}
 */
function testStandardActions_preventSelectionWhenEditing(){
    var f = forms.utFormBaseCRUDExt;
    
    var actionNames = f.getActionNames();
    jsunit.assertEquals(8, actionNames.length);
    
    f.registerCallLogCallback(logCall);
    f.getCrudPolicies().setRecordSelectionPolicy(scopes.svyCRUDManager.RECORD_SELECTION_POLICY.PREVENT_WHEN_EDITING).setBatchScopePolicy(scopes.svyCRUDManager.BATCH_SCOPE_POLICY.FOUNDSET);
    f.foundset.clear();
    f.updateStandardFormActionsState();
    
    //when no record is selected only the NEW action should be enabled
    var action = f.getAction(f.FORM_ACTION_NAMES.FIRST);
    jsunit.assertNotNull(action);
    jsunit.assertFalse(action.isEnabled());
    jsunit.assertTrue(action.isVisible());
    jsunit.assertFalse(action.isToggleAction());
    jsunit.assertFalse(action.isSelected());
    
    action = f.getAction(f.FORM_ACTION_NAMES.PREVIOUS);
    jsunit.assertNotNull(action);
    jsunit.assertFalse(action.isEnabled());
    jsunit.assertTrue(action.isVisible());
    jsunit.assertFalse(action.isToggleAction());
    jsunit.assertFalse(action.isSelected());
    
    action = f.getAction(f.FORM_ACTION_NAMES.NEXT);
    jsunit.assertNotNull(action);
    jsunit.assertFalse(action.isEnabled());
    jsunit.assertTrue(action.isVisible());
    jsunit.assertFalse(action.isToggleAction());
    jsunit.assertFalse(action.isSelected());
    
    action = f.getAction(f.FORM_ACTION_NAMES.LAST);
    jsunit.assertNotNull(action);
    jsunit.assertFalse(action.isEnabled());
    jsunit.assertTrue(action.isVisible());
    jsunit.assertFalse(action.isToggleAction());
    jsunit.assertFalse(action.isSelected());
    
    action = f.getAction(f.FORM_ACTION_NAMES.SAVE);
    jsunit.assertNotNull(action);
    jsunit.assertFalse(action.isEnabled());
    jsunit.assertTrue(action.isVisible());
    jsunit.assertFalse(action.isToggleAction());
    jsunit.assertFalse(action.isSelected());
    
    action = f.getAction(f.FORM_ACTION_NAMES.CANCEL);
    jsunit.assertNotNull(action);
    jsunit.assertFalse(action.isEnabled());
    jsunit.assertTrue(action.isVisible());
    jsunit.assertFalse(action.isToggleAction());
    jsunit.assertFalse(action.isSelected());
    
    action = f.getAction(f.FORM_ACTION_NAMES.DELETE);
    jsunit.assertNotNull(action);
    jsunit.assertFalse(action.isEnabled());
    jsunit.assertTrue(action.isVisible());
    jsunit.assertFalse(action.isToggleAction());
    jsunit.assertFalse(action.isSelected());
    
    action = f.getAction(f.FORM_ACTION_NAMES.NEW);
    jsunit.assertNotNull(action);
    jsunit.assertTrue(action.isEnabled());
    jsunit.assertTrue(action.isVisible());
    jsunit.assertFalse(action.isToggleAction());
    jsunit.assertFalse(action.isSelected());
 
    var res = f.newRecord();
    jsunit.assertTrue(res);
    var rec = f.foundset.getSelectedRecord();
    rec.categoryname = 'Record-1';
    res = f.save();
    jsunit.assertTrue(res);
    
    res = f.newRecord();
    jsunit.assertTrue(res);
    rec = f.foundset.getSelectedRecord();
    rec.categoryname = 'Record-2';
    
    //2 records, first is not saved yet and is the selected one (newRecord adds records on top!!)
    action = f.getAction(f.FORM_ACTION_NAMES.FIRST);
    jsunit.assertFalse(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.PREVIOUS);
    jsunit.assertFalse(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.NEXT);
    jsunit.assertFalse(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.LAST);
    jsunit.assertFalse(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.NEW);
    jsunit.assertFalse(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.SAVE);
    jsunit.assertTrue(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.CANCEL);
    jsunit.assertTrue(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.DELETE);
    jsunit.assertFalse(action.isEnabled());
    
    res = f.save();
    jsunit.assertTrue(res);
    
    //2 records, all saved, first record is selected
    action = f.getAction(f.FORM_ACTION_NAMES.FIRST);
    jsunit.assertFalse(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.PREVIOUS);
    jsunit.assertFalse(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.NEXT);
    jsunit.assertTrue(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.LAST);
    jsunit.assertTrue(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.NEW);
    jsunit.assertTrue(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.SAVE);
    jsunit.assertFalse(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.CANCEL);
    jsunit.assertFalse(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.DELETE);
    jsunit.assertTrue(action.isEnabled());
    
    res = f.selectLastRecord();
    //for some reason the above does not fire the onRecordSelection in unit test context
    f.updateStandardFormActionsState();
    jsunit.assertTrue(res);
    
    //2 records, all saved, last record is selected
    action = f.getAction(f.FORM_ACTION_NAMES.FIRST);
    jsunit.assertTrue(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.PREVIOUS);
    jsunit.assertTrue(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.NEXT);
    jsunit.assertFalse(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.LAST);
    jsunit.assertFalse(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.NEW);
    jsunit.assertTrue(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.SAVE);
    jsunit.assertFalse(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.CANCEL);
    jsunit.assertFalse(action.isEnabled());
    action = f.getAction(f.FORM_ACTION_NAMES.DELETE);
    jsunit.assertTrue(action.isEnabled());
}
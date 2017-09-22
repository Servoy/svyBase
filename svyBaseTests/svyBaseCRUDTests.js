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
    jsunit.assertEquals(7, m_CallLog.length);
    
    jsunit.assertEquals('onUserLeave', m_CallLog[0].name);
    jsunit.assertEquals(0, m_CallLog[0].args.length);
    
    jsunit.assertEquals('updatingUI', m_CallLog[1].name);
    jsunit.assertEquals(0, m_CallLog[1].args.length);
    
    jsunit.assertEquals('beforeNewRecord', m_CallLog[2].name);
    jsunit.assertEquals(0, m_CallLog[2].args.length);
    
    jsunit.assertEquals('createNewRecord', m_CallLog[3].name);
    jsunit.assertEquals(0, m_CallLog[3].args.length);
    
    jsunit.assertEquals('track', m_CallLog[4].name);
    jsunit.assertEquals(1, m_CallLog[4].args.length);
    
    jsunit.assertEquals('afterNewRecord', m_CallLog[5].name);
    jsunit.assertEquals(1, m_CallLog[5].args.length);
    
    jsunit.assertEquals('updatingUI', m_CallLog[6].name);
    jsunit.assertEquals(0, m_CallLog[6].args.length);
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
    
    jsunit.assertEquals('afterCacnel', m_CallLog[4].name);
    jsunit.assertEquals(0, m_CallLog[4].args.length);
    
    jsunit.assertEquals('updatingUI', m_CallLog[5].name);
    jsunit.assertEquals(0, m_CallLog[5].args.length); 
}
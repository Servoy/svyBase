/**
 * @type {Array<{name: String, args: Array}>}
 * @properties={typeid:35,uuid:"3D22CFE3-E71E-4056-B60B-30337CFFE5B8",variableType:-4}
 */
var m_CallLog = [];

/**
 * @properties={typeid:24,uuid:"CAF5C536-CE73-4B3E-A1CC-E512CFFF0045"}
 */
function setUp() {
    databaseManager.startTransaction();
    m_CallLog = [];
}

/**
 * @properties={typeid:24,uuid:"8EB91554-1519-4D84-BE54-E141A8DF5CEF"}
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
 * @properties={typeid:24,uuid:"4C120663-3CCB-420C-893E-F629C1D681D7"}
 */
function logCall(name, args) {
    m_CallLog.push({ name: name, args: args });
}

/**
 * @properties={typeid:24,uuid:"D3141B25-C99A-4D37-872F-BF9FF6D70C0B"}
 */
function testLoad() {
    var f = forms.utFormBaseExt;
    f.registerCallLogCallback(logCall);
    var fakeEvent = f.getFakeEvent();

    f.onLoad(fakeEvent);

    jsunit.assertEquals(2, m_CallLog.length);
    
    jsunit.assertEquals('initializingForm', m_CallLog[0].name);
    jsunit.assertEquals(0, m_CallLog[0].args.length);
    
    jsunit.assertEquals('bubble', m_CallLog[1].name);
    jsunit.assertEquals(2, m_CallLog[1].args.length);
    jsunit.assertSame(fakeEvent, m_CallLog[1].args[0]);
    jsunit.assertSame(f.BUBBLE_EVENT_TYPES.FORM_LOAD, m_CallLog[1].args[1]);
}

/**
 * @properties={typeid:24,uuid:"559F2140-4361-4A1E-A720-1710AB0E16C8"}
 */
function testUnload() {
    var f = forms.utFormBaseExt;
    f.registerCallLogCallback(logCall);
    var fakeEvent = f.getFakeEvent();

    f.onUnload(fakeEvent);

    
    jsunit.assertEquals(2, m_CallLog.length);
    
    jsunit.assertEquals('uninitializingForm', m_CallLog[0].name);
    jsunit.assertEquals(0, m_CallLog[0].args.length);
    
    jsunit.assertEquals('bubble', m_CallLog[1].name);
    jsunit.assertEquals(2, m_CallLog[1].args.length);
    jsunit.assertSame(fakeEvent, m_CallLog[1].args[0]);
    jsunit.assertSame(f.BUBBLE_EVENT_TYPES.FORM_UNLOAD, m_CallLog[1].args[1]);
}

/**
 * @properties={typeid:24,uuid:"A09E8E1C-0945-49E3-BC31-6D4689D280D5"}
 */
function testShow(){
    var f = forms.utFormBaseExt;
    f.registerCallLogCallback(logCall);
    var fakeEvent = f.getFakeEvent();

    f.onShow(true, fakeEvent);
    
    jsunit.assertEquals(3, m_CallLog.length);
    
    jsunit.assertEquals('displayingForm', m_CallLog[0].name);
    jsunit.assertEquals(1, m_CallLog[0].args.length);
    jsunit.assertEquals(true, m_CallLog[0].args[0]);
    
    jsunit.assertEquals('updatingUI', m_CallLog[1].name);
    jsunit.assertEquals(0, m_CallLog[1].args.length);
    
    jsunit.assertEquals('bubble', m_CallLog[2].name);
    jsunit.assertEquals(2, m_CallLog[2].args.length);
    jsunit.assertSame(fakeEvent, m_CallLog[2].args[0]);
    jsunit.assertSame(f.BUBBLE_EVENT_TYPES.FORM_SHOW, m_CallLog[2].args[1]);
}

/**
 * @properties={typeid:24,uuid:"FFDEC2E0-A3AA-4796-8D62-2B6B721F2868"}
 */
function testHide(){
    var f = forms.utFormBaseExt;
    f.registerCallLogCallback(logCall);
    var fakeEvent = f.getFakeEvent();

    var res = f.onHide(fakeEvent);
    
    jsunit.assertEquals(2, m_CallLog.length);
    
    jsunit.assertEquals('hidingForm', m_CallLog[0].name);
    jsunit.assertEquals(0, m_CallLog[0].args.length);
    
    jsunit.assertEquals('bubble', m_CallLog[1].name);
    jsunit.assertEquals(2, m_CallLog[1].args.length);
    jsunit.assertSame(fakeEvent, m_CallLog[1].args[0]);
    jsunit.assertSame(f.BUBBLE_EVENT_TYPES.FORM_HIDE, m_CallLog[1].args[1]);
    
    jsunit.assertTrue(res);
    
    m_CallLog = [];
    f.m_HidingFormResult = false; //simulate that hidingForm returns false
    f.m_UseMockupBubbleResult = false;
    
    res = f.onHide(fakeEvent);
    jsunit.assertFalse(res);
    
    jsunit.assertEquals(1, m_CallLog.length);
    
    jsunit.assertEquals('hidingForm', m_CallLog[0].name);
    jsunit.assertEquals(0, m_CallLog[0].args.length);
    
    m_CallLog = [];
    f.m_HidingFormResult = true;
    f.m_UseMockupBubbleResult = true; //simulate that bubble returns false
    f.m_MockupBubbleResult = false
    
    res = f.onHide(fakeEvent);
    jsunit.assertFalse(res);
    
    jsunit.assertEquals(2, m_CallLog.length);
    
    jsunit.assertEquals('hidingForm', m_CallLog[0].name);
    jsunit.assertEquals(0, m_CallLog[0].args.length);
    
    jsunit.assertEquals('bubble', m_CallLog[1].name);
    jsunit.assertEquals(2, m_CallLog[1].args.length);
    jsunit.assertSame(fakeEvent, m_CallLog[1].args[0]);
    jsunit.assertSame(f.BUBBLE_EVENT_TYPES.FORM_HIDE, m_CallLog[1].args[1]);
}

/**
 * @properties={typeid:24,uuid:"BB21DCE7-5227-4666-B9D8-F0A5B14902F0"}
 */
function testResize(){
    var f = forms.utFormBaseExt;
    f.registerCallLogCallback(logCall);
    var fakeEvent = f.getFakeEvent();

    f.onResize(fakeEvent);
    
    jsunit.assertEquals(2, m_CallLog.length);
    
    jsunit.assertEquals('updatingUI', m_CallLog[0].name);
    jsunit.assertEquals(0, m_CallLog[0].args.length);
    
    jsunit.assertEquals('bubble', m_CallLog[1].name);
    jsunit.assertEquals(2, m_CallLog[1].args.length);
    jsunit.assertSame(fakeEvent, m_CallLog[1].args[0]);
    jsunit.assertSame(f.BUBBLE_EVENT_TYPES.FORM_RESIZE, m_CallLog[1].args[1]);    
}

/**
 * @properties={typeid:24,uuid:"B2A04C68-86BB-4DC8-AA89-12401EA14154"}
 */
function testElementDataChange(){
    var f = forms.utFormBaseExt;
    f.registerCallLogCallback(logCall);
    var fakeEvent = f.getFakeEvent();
    var oldValue = 'old';
    var newValue = 'new';
    
    f.onElementDataChange(oldValue,newValue,fakeEvent);
    
    jsunit.assertEquals(3, m_CallLog.length);
    
    jsunit.assertEquals('fieldValueChanged', m_CallLog[0].name);
    jsunit.assertEquals(4, m_CallLog[0].args.length);
    jsunit.assertEquals(f.elements.fldTest.getDataProviderID(), m_CallLog[0].args[0]);
    jsunit.assertEquals(oldValue, m_CallLog[0].args[1]);
    jsunit.assertEquals(newValue, m_CallLog[0].args[2]);
    jsunit.assertSame(fakeEvent, m_CallLog[0].args[3]);
    
    jsunit.assertEquals('updatingUI', m_CallLog[1].name);
    jsunit.assertEquals(0, m_CallLog[1].args.length);
    
    jsunit.assertEquals('bubble', m_CallLog[2].name);
    jsunit.assertEquals(2, m_CallLog[2].args.length);
    jsunit.assertSame(fakeEvent, m_CallLog[2].args[0]);
    jsunit.assertSame(f.BUBBLE_EVENT_TYPES.ELEMENT_DATA_CHANGE, m_CallLog[2].args[1]);
    
    m_CallLog = [];
    f.m_FieldValueChangeResult = false;
    
    f.onElementDataChange(oldValue,newValue,fakeEvent);
    
    jsunit.assertEquals(2, m_CallLog.length);
    
    jsunit.assertEquals('fieldValueChanged', m_CallLog[0].name);
    jsunit.assertEquals(4, m_CallLog[0].args.length);
    jsunit.assertEquals(f.elements.fldTest.getDataProviderID(), m_CallLog[0].args[0]);
    jsunit.assertEquals(oldValue, m_CallLog[0].args[1]);
    jsunit.assertEquals(newValue, m_CallLog[0].args[2]);
    jsunit.assertSame(fakeEvent, m_CallLog[0].args[3]);
    
    jsunit.assertEquals('updatingUI', m_CallLog[1].name);
    jsunit.assertEquals(0, m_CallLog[1].args.length);
}

/**
 * @properties={typeid:24,uuid:"FCAD5016-74F8-4348-B5D2-03A1324C4C92"}
 */
function testElementFocusGained(){
    var f = forms.utFormBaseExt;
    f.registerCallLogCallback(logCall);
    var fakeEvent = f.getFakeEvent();

    f.onElementFocusGained(fakeEvent);
    
    jsunit.assertEquals(1, m_CallLog.length);
        
    jsunit.assertEquals('bubble', m_CallLog[0].name);
    jsunit.assertEquals(2, m_CallLog[0].args.length);
    jsunit.assertSame(fakeEvent, m_CallLog[0].args[0]);
    jsunit.assertSame(f.BUBBLE_EVENT_TYPES.ELEMENT_FOCUS_GAINED, m_CallLog[0].args[1]);    
}

/**
 * @properties={typeid:24,uuid:"78F44B45-3C65-4B1E-BA04-F30DAA69E306"}
 */
function testElementFocusLost(){
    var f = forms.utFormBaseExt;
    f.registerCallLogCallback(logCall);
    var fakeEvent = f.getFakeEvent();

    f.onElementFocusLost(fakeEvent);
    
    jsunit.assertEquals(1, m_CallLog.length);
        
    jsunit.assertEquals('bubble', m_CallLog[0].name);
    jsunit.assertEquals(2, m_CallLog[0].args.length);
    jsunit.assertSame(fakeEvent, m_CallLog[0].args[0]);
    jsunit.assertSame(f.BUBBLE_EVENT_TYPES.ELEMENT_FOCUS_LOST, m_CallLog[0].args[1]);    
}

/**
 * @properties={typeid:24,uuid:"9A01FD3F-16FB-42A6-8A26-E2C1E04EB735"}
 */
function testRecordEditStart(){
    var f = forms.utFormBaseExt;
    f.registerCallLogCallback(logCall);
    var fakeEvent = f.getFakeEvent();

    f.onRecordEditStart(fakeEvent);
    
    jsunit.assertEquals(2, m_CallLog.length);
    
    jsunit.assertEquals('updatingUI', m_CallLog[0].name);
    jsunit.assertEquals(0, m_CallLog[0].args.length);
    
    jsunit.assertEquals('bubble', m_CallLog[1].name);
    jsunit.assertEquals(2, m_CallLog[1].args.length);
    jsunit.assertSame(fakeEvent, m_CallLog[1].args[0]);
    jsunit.assertSame(f.BUBBLE_EVENT_TYPES.RECORD_EDIT_START, m_CallLog[1].args[1]);    
}

/**
 * @properties={typeid:24,uuid:"30EDA41C-04B9-4D32-8C4F-4E02A73F0E2B"}
 */
function testRecordEditStop(){
    var f = forms.utFormBaseExt;
    var fakeEvent = f.getFakeEvent();
    var fakeRec = f.foundset.getRecord(f.foundset.newRecord());
    f.registerCallLogCallback(logCall);

    f.onRecordEditStop(fakeRec, fakeEvent);
    
    jsunit.assertEquals(2, m_CallLog.length);
    
    jsunit.assertEquals('updatingUI', m_CallLog[0].name);
    jsunit.assertEquals(0, m_CallLog[0].args.length);
    
    jsunit.assertEquals('bubble', m_CallLog[1].name);
    jsunit.assertEquals(2, m_CallLog[1].args.length);
    jsunit.assertSame(fakeEvent, m_CallLog[1].args[0]);
    jsunit.assertSame(f.BUBBLE_EVENT_TYPES.RECORD_EDIT_STOP, m_CallLog[1].args[1]);    
}

/**
 * @properties={typeid:24,uuid:"C89F2E29-24A3-4A4A-950A-DEA5B1338BE5"}
 */
function testRecordSelection(){
    var f = forms.utFormBaseExt;
    f.registerCallLogCallback(logCall);
    var fakeEvent = f.getFakeEvent();

    f.onRecordSelection(fakeEvent);
    
    jsunit.assertEquals(3, m_CallLog.length);
    
    jsunit.assertEquals('dataContextChanged', m_CallLog[0].name);
    jsunit.assertEquals(0, m_CallLog[0].args.length);
    
    jsunit.assertEquals('updatingUI', m_CallLog[1].name);
    jsunit.assertEquals(0, m_CallLog[1].args.length);
    
    jsunit.assertEquals('bubble', m_CallLog[2].name);
    jsunit.assertEquals(2, m_CallLog[2].args.length);
    jsunit.assertSame(fakeEvent, m_CallLog[2].args[0]);
    jsunit.assertSame(f.BUBBLE_EVENT_TYPES.RECORD_SELECT, m_CallLog[2].args[1]);    
}

/**
 * @properties={typeid:24,uuid:"BB4063C0-19E4-4A28-AA34-F6434AC16FAF"}
 */
function testAction(){
    var f = forms.utFormBaseExt;
    
    var testAct = f.getAction(actionName);
    jsunit.assertNull(testAct);
    
    var actNames = f.getActionNames();
    jsunit.assertEquals(0,actNames.length);
    
    var actionName = 'testAction';
    var funcName = 'testFuncName';
    var isToggle = true;
    
    var res = f.addAction(actionName,funcName,isToggle);
    jsunit.assertNotNull(res);
    
    jsunit.assertEquals(actionName, res.getActionName());
    jsunit.assertEquals('forms.'+ f.controller.getName() + '.' + funcName, res.getHandler());
    jsunit.assertEquals(isToggle, res.isToggleAction());
    
    testAct = f.getAction(actionName);
    jsunit.assertSame(res,testAct);
    
    actNames = f.getActionNames();
    jsunit.assertEquals(1,actNames.length);
    jsunit.assertEquals(actionName,actNames[0]);
}
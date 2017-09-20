/**
 * @type {Array<{propertyName: String, oldValue, newValue, source: scopes.svyActionManager.FormAction}>}
 * @properties={typeid:35,uuid:"E40656C3-A2B3-482B-9793-038D88F55DC1",variableType:-4}
 */
var m_TestLogAllProps = [];
/**
 * @type {Array<{propertyName: String, oldValue, newValue, source: scopes.svyActionManager.FormAction}>}
 * @properties={typeid:35,uuid:"4CE7203E-C008-4E22-9567-51BA45C10B03",variableType:-4}
 */
var m_TestLogVisibleProps = [];

/**
 * @param {{propertyName: String, oldValue, newValue, source: scopes.svyActionManager.FormAction}} arg
 * @properties={typeid:24,uuid:"F3998675-98CA-41EE-AA9A-28846D6DDE55"}
 */
function propertyChangeHandler_all(arg) {
    m_TestLogAllProps.push(arg);
}

/**
 * @param {{propertyName: String, oldValue, newValue, source: scopes.svyActionManager.FormAction}} arg
 *
 * @properties={typeid:24,uuid:"3AB485B4-C9C4-47B3-8F48-993F5E701693"}
 */
function propertyChangeHandler_visible(arg) {
    m_TestLogVisibleProps.push(arg);
}

/**
 * @properties={typeid:24,uuid:"D97EB776-CFF0-41B4-8392-A71BD83C3461"}
 */
function test_PropertyChangeNotification() {
    forms.utFormA.resetForTest();
    var actionName = 'testAction';
    var action = new scopes.svyActionManager.FormAction(actionName, forms.utFormA, forms.utFormA.customAction);
    try {
        action.addPropertyChangeListener(propertyChangeHandler_all);
        action.addPropertyChangeListener(propertyChangeHandler_visible, action.PROPERTIES.VISIBLE);

        jsunit.assertEquals(0, m_TestLogAllProps.length);
        jsunit.assertEquals(0, m_TestLogVisibleProps.length);

        action.setEnabled(true);
        jsunit.assertEquals(1, m_TestLogAllProps.length);
        jsunit.assertEquals(action.PROPERTIES.ENABLED, m_TestLogAllProps[m_TestLogAllProps.length - 1].propertyName);
        jsunit.assertSame(action, m_TestLogAllProps[m_TestLogAllProps.length - 1].source);
        jsunit.assertEquals(0, m_TestLogVisibleProps.length);

        action.setVisible(true);
        jsunit.assertEquals(2, m_TestLogAllProps.length);
        jsunit.assertEquals(action.PROPERTIES.VISIBLE, m_TestLogAllProps[m_TestLogAllProps.length - 1].propertyName);
        jsunit.assertEquals(1, m_TestLogVisibleProps.length);
        jsunit.assertEquals(action.PROPERTIES.VISIBLE, m_TestLogVisibleProps[0].propertyName);

        action.setSelected(true);
        jsunit.assertEquals(3, m_TestLogAllProps.length);
        jsunit.assertEquals(action.PROPERTIES.SELECTED, m_TestLogAllProps[m_TestLogAllProps.length - 1].propertyName);
        jsunit.assertEquals(1, m_TestLogVisibleProps.length);

        var t = 'Some sample text';
        action.setText(t);
        jsunit.assertEquals(4, m_TestLogAllProps.length);
        jsunit.assertEquals(action.PROPERTIES.TEXT, m_TestLogAllProps[m_TestLogAllProps.length - 1].propertyName);
        jsunit.assertEquals(t, m_TestLogAllProps[m_TestLogAllProps.length - 1].newValue);
        jsunit.assertEquals(1, m_TestLogVisibleProps.length);

        t = 'Some sample tooltip text';
        action.setTooltipText(t);
        jsunit.assertEquals(5, m_TestLogAllProps.length);
        jsunit.assertEquals(action.PROPERTIES.TOOLTIP_TEXT, m_TestLogAllProps[m_TestLogAllProps.length - 1].propertyName);
        jsunit.assertEquals(t, m_TestLogAllProps[m_TestLogAllProps.length - 1].newValue);
        jsunit.assertEquals(1, m_TestLogVisibleProps.length);
    } finally {
        action.removePropertyChangeListener(propertyChangeHandler_all);
        action.removePropertyChangeListener(propertyChangeHandler_visible, action.PROPERTIES.VISIBLE);
    }
}

/**
 * @properties={typeid:24,uuid:"BDDCB5B1-DE89-4CCD-8F67-1060E8CCC209"}
 */
function test_ActionToggle() {
    forms.utFormA.resetForTest();
    var actionName = 'testAction';
    var action = new scopes.svyActionManager.FormAction(actionName, forms.utFormA, forms.utFormA.customAction, true);
    jsunit.assertTrue(action.isToggleAction());

    action.setEnabled(false);

    action.setSelected(false);
    jsunit.assertFalse(action.isSelected());

    action.invoke();
    jsunit.assertFalse('Disabled actions should not invoke their handlers and change their "selected" state', action.isSelected());

    action.setEnabled(true);
    action.invoke();
    jsunit.assertTrue(action.isSelected());
    action.invoke();
    jsunit.assertFalse(action.isSelected());
}

/**
 * @properties={typeid:24,uuid:"E9D61D37-2F72-405F-A625-A43A90517420"}
 */
function test_Properties() {
    var actionName = 'testAction';
    var action = new scopes.svyActionManager.FormAction(actionName, forms.utFormA, forms.utFormA.customAction, true);
    jsunit.assertEquals(actionName, action.getActionName());
    jsunit.assertSame(forms.utFormA, action.getTarget());
    jsunit.assertEquals(actionName, action.getText());
    jsunit.assertNull(action.getTooltipText());
    jsunit.assertFalse(action.isEnabled());
    jsunit.assertFalse(action.isVisible());
    jsunit.assertFalse(action.isSelected());
    jsunit.assertEquals('forms.utFormA.customAction', action.getHandler());
}

/**
 * @properties={typeid:24,uuid:"A4A6A53D-2745-4A60-BA08-AAA37339D2D0"}
 */
function test_Invoke(){
    forms.utFormA.resetForTest();
    var actionName = 'testAction';
    jsunit.assertNull(forms.utFormA.getInvokedArg());
    var action = new scopes.svyActionManager.FormAction(actionName, forms.utFormA, forms.utFormA.customAction);
    
    jsunit.assertFalse(action.isEnabled());
    /** @type {JSEvent} */
    var event = {foo: 'bar'};
    action.invoke(event);
    jsunit.assertNull('Disabled actions should not invoke their handlers', forms.utFormA.getInvokedArg());
    
    action.setEnabled(true);
    action.invoke(event);
    jsunit.assertNotNull(forms.utFormA.getInvokedArg());
    jsunit.assertEquals(event, forms.utFormA.getInvokedArg().getSourceEvent());
    jsunit.assertSame(forms.utFormA, forms.utFormA.getInvokedArg().getSource());
    jsunit.assertEquals('action-event', forms.utFormA.getInvokedArg().getType());
    jsunit.assertEquals(actionName, forms.utFormA.getInvokedArg().getActionName());
}
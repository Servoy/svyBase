/**
 * @private
 * @type {scopes.svyActionManager.ActionEvent} 
 * @properties={typeid:35,uuid:"FF82F134-B87B-4040-862C-01DF9ABF7872",variableType:-4}
 */
var m_InvokedArg = null;

/**
 * @public 
 * @param {scopes.svyActionManager.ActionEvent} arg
 * @properties={typeid:24,uuid:"7041E57D-835E-47DD-B657-1BF38D3318FF"}
 */
function customAction(arg){
    application.output(arg.getActionName());
    m_InvokedArg = arg;
}

/**
 * @public 
 * @return {scopes.svyActionManager.ActionEvent}
 * @properties={typeid:24,uuid:"A87F0BFA-586D-433A-AE58-DE5748139253"}
 */
function getInvokedArg(){
    return m_InvokedArg;
}

/**
 * @public 
 * @properties={typeid:24,uuid:"7893ECCC-2142-4E59-AA2D-07D2C3F01297"}
 */
function resetForTest(){
    m_InvokedArg = null;
}
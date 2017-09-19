/**
 * @private 
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"C8BCB9C0-28CB-4DA4-B7F7-4831EAA89417",variableType:4}
 */
var m_SelectedProduct = 0;

/**
 * @private
 * @type {Boolean} 
 * @properties={typeid:35,uuid:"C57C0963-97F9-45E2-A9E9-FA2AC94A9906",variableType:-4}
 */
var m_IsCanceled = true;

/**
 * Perform the element default action.
 * @private 
 * @param {JSEvent} event the event that triggered the action
 *
 * @properties={typeid:24,uuid:"DD84C7DC-5E96-45F1-A56D-26CFE6B1ABA3"}
 */
function onActionSelect(event) {
    if (m_SelectedProduct == null){
        return;
    }
    m_IsCanceled = false;
    controller.getWindow().hide();
}

/**
 * Perform the element default action.
 *
 * @private
 * @param {JSEvent} event the event that triggered the action
 *
 *
 * @properties={typeid:24,uuid:"9676CB2B-A561-4E53-BE33-3E05CBA6A6A4"}
 */
function onActionCancel(event) {
    m_IsCanceled = true;
    controller.getWindow().hide();
}

/**
 * @public 
 * @return {Number} The selected product PK
 * @properties={typeid:24,uuid:"6823ABDD-DD68-4CB7-A0E2-96455D7B1084"}
 */
function showProductSelectionDialog(){
    m_SelectedProduct = null;
    m_IsCanceled = true;
    var win = application.createWindow('productSelection',JSWindow.MODAL_DIALOG);    
    controller.show(win);
    win.destroy();
    if (m_IsCanceled){
        return null;
    }
    return m_SelectedProduct;
}
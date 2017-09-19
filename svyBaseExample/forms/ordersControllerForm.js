/**
 * This is a 2-dimensional array which will store the composite PKs of the order detail records selected for deletion.
 * @private 
 * @type {Array<Array>}
 * @properties={typeid:35,uuid:"BFA71F7B-7FD0-46EE-B5D9-82DDC23075D2",variableType:-4}
 */
var m_DetailsSelectedForDeletion = [];

/**
 * @override 
 * @protected 
 * @properties={typeid:24,uuid:"716F884C-3F7E-45FD-8411-AB3B55548480"}
 */
function setFormPolicies(){
    var poli = getCrudPolicies();
    poli.setBatchScopePolicy(scopes.svyCRUDManager.BATCH_SCOPE_POLICY.AUTO);
    poli.setRecordLockingPolicy(scopes.svyCRUDManager.RECORD_LOCKING_POLICY.AUTO);
    poli.setRecordSelectionPolicy(scopes.svyCRUDManager.RECORD_SELECTION_POLICY.PREVENT_WHEN_EDITING);
    poli.setValidationPolicy(scopes.svyCRUDManager.VALIDATION_POLICY.DEFERRED);
    poli.setFormHidePolicy(scopes.svyCRUDManager.FORM_HIDE_POLICY.PREVENT_WHEN_EDITING);  
}

/**
 * @override 
 * @protected 
 * @return {String} the name of the label element which is used as a "placeholder" where the toolbar should be created
 * @properties={typeid:24,uuid:"442BAEE1-F756-4075-88AA-F561A481A6D7"}
 */
function getToolbarPlaceholderLabelName(){
    return elements.lblToolbarPlaceholder.getName();
}

/**
 * @override 
 * @public
 * @return {Boolean}
 * @properties={typeid:24,uuid:"6829D055-112F-47A6-822C-019E468826A1"}
 */
function hasEdits() {
    //overriding this method to consider as "edits" any details marked for deletion
    //this will ensure that the Save & Cancel standard actions are enabled correctly 
    var res = _super.hasEdits();
    res = res || (m_DetailsSelectedForDeletion.length != 0);
    return res;
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"01EF1AB4-1A24-4CB2-B464-A3D880EB3054"}
 */
function onActionAddDetail(event) {
    addOrderDetail();
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"4DB906D9-30D0-4D1E-8282-04C86A1ED833"}
 */
function onActionRemoveDetail(event) {
    markSelectedOrderDetailForDeletion();
}

/**
 * @private 
 * @properties={typeid:24,uuid:"623F10EB-2035-458B-8E52-9046C6EE1D39"}
 */
function addOrderDetail(){
    var orderRec = foundset.getSelectedRecord();
    if (orderRec){
        var selectedProductKey = forms.productSelectionDialog.showProductSelectionDialog();
        if (selectedProductKey == null){
            return;
        }
        
        var dtlFS = orderRec.orders_to_order_details;
        for (var index = 1; index <= dtlFS.getSize(); index++) {
            if (dtlFS.getRecord(index).productid == selectedProductKey) {
                plugins.dialogs.showInfoDialog('Duplicate Product','An order detail with the selected product already exists.');
                return;
            }            
        }
        
        var detailRec = dtlFS.getRecord(dtlFS.newRecord(false,true));
        
        
        //TODO: work around the Servoy bug https://support.servoy.com/browse/SVY-11581
        detailRec.productid = selectedProductKey;
        detailRec.quantity = 0;
        detailRec.unitprice = 0;
        detailRec.discount = 0;
        
        //we need to track the detail records as part of the "work batch scope"
        track(detailRec);
        updateActionsState();
        updateUI();
    }
}

/**
 * Order details are not deleted immediately. They are only "marked" for deletion and removed from the UI 
 * and will be deleted later when the user invokes the "Save" action.
 * If the user "Cancels" the order changes then the marked order details will "reappear".
 * See saveValidatedRecords for additional information. 
 * 
 * @private 
 * @properties={typeid:24,uuid:"EB9087F3-D686-4C36-83E7-085DD086E0EB"}
 */
function markSelectedOrderDetailForDeletion(){
    var orderRec = foundset.getSelectedRecord();
    if (orderRec && databaseManager.hasRecords(orderRec.orders_to_order_details)){        
        var selectedDetailRec = orderRec.orders_to_order_details.getSelectedRecord();
        if (selectedDetailRec.isNew()){
            //new (unsaved yet) order detail can simply be "reverted" and they will disappear from the related details foundset
            selectedDetailRec.revertChanges();           
        } else {
            //before adding the record to the list of details marked for deletion we need to revert any changes made to it
            //because the user may have changed for example the original productid which is part of the composite PK for the order_details table
            selectedDetailRec.revertChanges();            
            m_DetailsSelectedForDeletion.push(selectedDetailRec.getPKs());
            //this will ensure that the detail selected for deletion is removed from the UI
            orderRec.orders_to_order_details.omitRecord();
            //need to have at least one record in the "tracked" batch of work in order to be able to proceed with the save operation
            //in this case we simply add the header order record even if it does not have any changes (the save will then just skip it)
            track(orderRec);
        }
        
        //"untrack" the detail rec from the edited records as it will be deleted
        untrack(selectedDetailRec);
                
        updateActionsState();
    }
}

/**
 * @override 
 * @protected 
 * @properties={typeid:24,uuid:"E65A928F-9824-4DA0-9757-73B828E05196"}
 */
function afterSave(){
    clearDeletionSeletion();    
}


/**
 * @override 
 * @protected 
 * @properties={typeid:24,uuid:"88AFD8AB-45F6-4423-B5D9-3751ED3D2C27"}
 */
function afterCancel(){
    clearDeletionSeletion();
}


/**
 * @override 
 * @protected 
 * @properties={typeid:24,uuid:"427A12C9-C049-4B10-BA8E-2E9859B5AD94"}
 */
function afterDelete(){
    clearDeletionSeletion();
}
   
/**
 * @override 
 * @protected 
 * @properties={typeid:24,uuid:"18509A90-B9D1-4180-9370-390E0BE8731B"}
 */
function dataContextChanged(){
    //need to clear any details marked for deletion also when a different order is selected in the header
    clearDeletionSeletion();
}

/**
 * @override 
 * @protected
 * @param {JSEvent} event
 * @param {String} bubbleEventType one of the BUBBLE_EVENT_TYPES enum values
 * @return {Boolean}
 *
 * @properties={typeid:24,uuid:"D5750A4B-9813-48CC-ABA4-0BFDBF3C2C76"}
 */
function onEventBubble(event, bubbleEventType) {
    if (bubbleEventType == BUBBLE_EVENT_TYPES.ELEMENT_DATA_CHANGE){
        var orderRec = foundset.getSelectedRecord();
        if (orderRec && orderRec.orders_to_order_details) {
            var selectedDetailRec = orderRec.orders_to_order_details.getSelectedRecord();
            if (selectedDetailRec){
                track(selectedDetailRec);                
            }            
        }
    }
    return _super.onEventBubble(event, bubbleEventType);
}

/**
 * This override will ensure that any order detail records marked for deletion will be deleted before 
 * saving any other changes made to the order or its details.
 * The whole operation will be performed in the "Save" database transaction so changes will be rolled back correctly, if necessary.
 * 
 * @override 
 * @protected 
 * @param {Array<JSRecord>} records The validated records which must be saved
 * @throws {Error} If any record could not be saved and the database transaction needs to be rolled back.
 * @properties={typeid:24,uuid:"3BCC3663-E8C6-4719-B338-8229AD0DDD91"}
 */
function saveValidatedRecords(records){
    //first we must delete any details marked for deletion
    if (m_DetailsSelectedForDeletion.length > 0)
    {
        var dsPKs = databaseManager.createEmptyDataSet(0, 2);
        for (var i in m_DetailsSelectedForDeletion){
            var dtlPKs = m_DetailsSelectedForDeletion[i];
            dsPKs.addRow(dtlPKs);
        }
        //IMPORTANT: we must load and delete these details using a separate foundset!
        var fsForDeletes = datasources.db.example_data.order_details.getFoundSet();
        fsForDeletes.loadRecords(dsPKs);
        
        //for a detailed error handling records could be deleted one-by-one but for the purpose of this example we delete them in-bulk
        var deleted = fsForDeletes.deleteAllRecords();
        if (!deleted){
            //an error must be thrown to notify that the DB transaction must be rolled back
            throw new scopes.svyDataUtils.DeleteRecordFailedException('Could not delete the specified order details.', fsForDeletes);
        }
    }
    
    //now do the standard saving
    _super.saveValidatedRecords(records);
}

/**
 * @private
 * @properties={typeid:24,uuid:"670842E4-C020-49EB-B818-4AF5551ABD62"}
 */
function clearDeletionSeletion(){
    m_DetailsSelectedForDeletion = [];
    var orderRec = foundset.getSelectedRecord();
    if (orderRec && orderRec.orders_to_order_details) {
        orderRec.orders_to_order_details.loadAllRecords();
    }
}
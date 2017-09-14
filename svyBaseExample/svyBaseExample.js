/**
 * @properties={typeid:24,uuid:"01B1CB4D-B505-4A91-94E2-3CBB8C2DA704"}
 */
function fillValueLists() {
    var hidePoli = scopes.svyCRUDManager.FORM_HIDE_POLICY;
    application.setValueListItems('vls_svyBaseExample_FormHidePolicy',
        [hidePoli.ALLOW_WHEN_EDITING, hidePoli.PREVENT_WHEN_EDITING]);
    
    var selPoli = scopes.svyCRUDManager.RECORD_SELECTION_POLICY;
    application.setValueListItems('vls_svyBaseExample_RecordSelectionPolicy',
        [selPoli.ALLOW_WHEN_EDITING, selPoli.PREVENT_WHEN_EDITING]);
    
    var lockPoli = scopes.svyCRUDManager.RECORD_LOCKING_POLICY;
    application.setValueListItems('vls_svyBaseExample_RecordLockingPolicy',
        [lockPoli.AUTO, lockPoli.NONE]);
    
    var batchPoli = scopes.svyCRUDManager.BATCH_SCOPE_POLICY;
    application.setValueListItems('vls_svyBaseExample_BatchScopePolicy',
        [batchPoli.ALL, batchPoli.FOUNDSET, batchPoli.CURRENT_RECORD, batchPoli.AUTO]);
    
    var valPoli = scopes.svyCRUDManager.VALIDATION_POLICY;
    application.setValueListItems('vls_svyBaseExample_ValidationPolicy',
        [valPoli.CONTINUOUS, valPoli.DEFERRED, valPoli.NONE]);
}

/**
 * Callback method for when solution is opened.
 * When deeplinking into solutions, the argument part of the deeplink url will be passed in as the first argument
 * All query parameters + the argument of the deeplink url will be passed in as the second argument
 * For more information on deeplinking, see the chapters on the different Clients in the Deployment Guide.
 *
 * @param {String} arg startup argument part of the deeplink url with which the Client was started
 * @param {Object<Array<String>>} queryParams all query parameters of the deeplink url with which the Client was started
 *
 * @properties={typeid:24,uuid:"EC82CCF0-7F90-400D-9B50-BC560F0EA935"}
 */
function onSolutionOpen(arg, queryParams) {
    fillValueLists();
    databaseManager.setAutoSave(false);
}

/**
 * Callback method for when an error occurred (the error can be a JavaScript or Servoy Java error).
 * @public
 * @param ex exception to handle
 * @return {Boolean}
 *
 * @properties={typeid:24,uuid:"59E18FFB-88E1-48C2-9CC7-D069111AFC8A"}
 */
function onError(ex) {
    var errorInfo = [scopes.svyBaseExampleUtils.getExceptionText(ex)];
    if (ex instanceof ServoyException) {
        /** @type {ServoyException} */
        var servoyException = ex;

        errorInfo.push('');
        errorInfo.push('The error is ServoyException');
        errorInfo.push('Error Code: ' + servoyException.getErrorCode());

        //NOTE: the stack trace shown is for demo purposes only - production code should not expose this to users
        if (servoyException.getStackTrace) {
            scopes.svyBaseExampleUtils.logError(servoyException.getStackTrace());
        }

        var failedRecordsErrors = scopes.svyBaseExampleUtils.getFailedRecordsErrors();
        if (failedRecordsErrors) {
            errorInfo.push('');
            errorInfo.push('Additional error information:');
            errorInfo.push(failedRecordsErrors);
        }
    }

    var msg = errorInfo.join('<br>');
    scopes.svyBaseExampleUtils.logError(msg);
    plugins.dialogs.showErrorDialog('Error', utils.stringFormat('The following error was encountered:<br>%1$s', [msg]), 'OK');
    return true;
}

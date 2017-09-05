/**
 * @override 
 * @public
 * @return {scopes.svyCRUDManager.CRUDPolicies}
 * @properties={typeid:24,uuid:"137403BD-C769-42BE-8B9A-E2992CCBE7AA"}
 */
function getCrudPolicies() {
    return _super.getCrudPolicies();
}

/**
 * @public 
 * @param {JSFoundSet} fs
 *
 * @properties={typeid:24,uuid:"D1CF5A09-A526-46D0-913A-22D0512102BB"}
 */
function setFoundSet(fs) {
    controller.loadRecords(fs);
    dataContextChanged();
    updateUI();
}


/**
 * @properties={typeid:24,uuid:"AA14C3E5-0B25-43A5-8573-E2170E215B55"}
 */
function testValidationMarker() {
    var dataSrc = 'fake-data-source';
    /** @type {JSRecord} */
    var rec = {
        getDataSource: function() {
            return dataSrc
        }
    };
    var msg = 'Test message';
    var level = scopes.svyValidationManager.VALIDATION_LEVEL.WARN;
    var dataProvider = 'test-data-provider';

    var marker = new scopes.svyValidationManager.ValidationMarker(rec, msg);
    jsunit.assertNotNull(marker);
    jsunit.assertSame(rec, marker.getRecord());
    jsunit.assertEquals(msg, marker.getMessage());
    jsunit.assertEquals(dataSrc, marker.getDataSource());
    jsunit.assertEquals(scopes.svyValidationManager.VALIDATION_LEVEL.ERROR, marker.getLevel());
    jsunit.assertNull(marker.getDataProvider());

    marker = new scopes.svyValidationManager.ValidationMarker(rec, msg, level);
    jsunit.assertEquals(level, marker.getLevel());

    marker = new scopes.svyValidationManager.ValidationMarker(rec, msg, level, dataProvider);
    jsunit.assertEquals(dataProvider, marker.getDataProvider());

    scopes.svyBaseTestUtils.assertThrows(function() {
        new scopes.svyValidationManager.ValidationMarker()
    });
    scopes.svyBaseTestUtils.assertThrows(function() {
        new scopes.svyValidationManager.ValidationMarker(rec)
    });
}

/**
 * @properties={typeid:24,uuid:"DFB2A81E-0614-4A95-B1ED-7B195FCFD287"}
 */
function testGetValidationProviders() {

    var providers = scopes.svyValidationManager.getValidationProviders(forms.utValidationProviderA.controller.getDataSource());
    jsunit.assertEquals(2, providers.length);

    providers = scopes.svyValidationManager.getValidationProviders(forms.utFormA);
    jsunit.assertEquals(2, providers.length);

    var fs = datasources.db.example_data.categories.getFoundSet();

    providers = scopes.svyValidationManager.getValidationProviders(fs);
    jsunit.assertEquals(2, providers.length);

    fs = datasources.db.example_data.products.getFoundSet();
    providers = scopes.svyValidationManager.getValidationProviders(fs);
    jsunit.assertEquals(1, providers.length);
    jsunit.assertSame(forms.utValidationProviderC, providers[0]);
}

/**
 * @properties={typeid:24,uuid:"79971EEB-F949-47D8-A95B-3CE3EA2CDAF4"}
 */
function testValidate() {
    var fs = datasources.db.example_data.categories.getFoundSet();
    var testRec = fs.getRecord(fs.newRecord());
    try {
        var expected = new scopes.svyValidationManager.ValidationMarker(testRec, 'test message');
        forms.utValidationProviderA.setValidationResult([expected]);
        forms.utValidationProviderB.setValidationResult([expected]);
        
        var res = scopes.svyValidationManager.validate(testRec);
        jsunit.assertEquals(2,res.length);
        jsunit.assertSame(expected,res[0]);
        jsunit.assertSame(expected,res[1]);
        
    } finally {
        databaseManager.revertEditedRecords();
    }
}

/**
 * @properties={typeid:24,uuid:"7A2D6F1C-0F3B-491D-AC6D-96B9A91E38AC"}
 */
function testCanDelete() {
    var fs = datasources.db.example_data.categories.getFoundSet();
    var testRec = fs.getRecord(fs.newRecord());
    try {
        var expected = new scopes.svyValidationManager.ValidationMarker(testRec, 'test message');
        forms.utValidationProviderA.setValidationResult([expected]);
        forms.utValidationProviderB.setValidationResult([expected]);
        
        var res = scopes.svyValidationManager.canDelete(testRec);
        jsunit.assertEquals(2,res.length);
        jsunit.assertSame(expected,res[0]);
        jsunit.assertSame(expected,res[1]);
        
    } finally {
        databaseManager.revertEditedRecords();
    }
}

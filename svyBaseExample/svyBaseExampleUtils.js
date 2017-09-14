/**
 * @public 
 * @param {String} str the string to check
 * @return {Boolean} true if the specified string to check is null, undefined, empty string or a string which contains only whitespace characters (space, tab, new line, etc.)
 *
 * @properties={typeid:24,uuid:"FF7E8AC0-30B1-477C-AA46-B0206514A0A7"}
 */
function stringIsNullOrEmpty(str) {
    
    if (str && (((typeof str === 'string') && str.match(/\S/g)) || (typeof str !== 'string'))) {
        return false;
    }
    return true;
}

/*
 * This scope contains helper/utility methods for various tasks.
 */

/**
 * @public
 * @param {String} message
 * @properties={typeid:24,uuid:"4BAA0E41-EFFA-4FCA-ABD4-56404ECA2518"}
 */
function logDebug(message) {
    log(message, LOGGINGLEVEL.DEBUG);
}

/**
 * @public
 * @param {String} message
 * @properties={typeid:24,uuid:"E0C177EB-BFF6-4FFD-8421-D4C26D6626D4"}
 */
function logInfo(message) {
    log(message, LOGGINGLEVEL.INFO);
}

/**
 * @public
 * @param {String} message
 * @properties={typeid:24,uuid:"9B8A15D7-D3D3-4888-932F-42B99642AB13"}
 */
function logWarning(message) {
    log(message, LOGGINGLEVEL.WARNING);
}

/**
 * @public
 * @param {String} message
 * @properties={typeid:24,uuid:"A230C879-4B1A-48CE-A65E-7DD3D4029ED2"}
 */
function logError(message) {
    log(message, LOGGINGLEVEL.ERROR);
}

/**
 * @private
 * @param {String} message
 * @param {Number} level - one of the LOGGINGLEVEL constants
 *
 * @properties={typeid:24,uuid:"A89E3844-E9E0-477F-93CE-E97FB6D82B8B"}
 */
function log(message, level) {
    //override this to provide custom logging
    application.output(message, level);
}

/**
 * Servoy Security Groups and svySecurity Permissions must match
 * this will create any missing Servoy Groups
 * NOTE: this must be executed from administrator security context
 * @public
 * @param {Object} permissionsEnum - enumeration object with the permissions info
 * @properties={typeid:24,uuid:"C909D3B2-F721-492A-9033-F237DA724632"}
 */
function createServoyScurityGroups(permissionsEnum) {
    var secGrps = security.getGroups().getColumnAsArray(2);
    for (var prop in permissionsEnum) {
        if (permissionsEnum.hasOwnProperty(prop)) {
            var perm = permissionsEnum[prop];
            if (secGrps.indexOf(perm) == -1) {
                security.createGroup(perm);
            }
        }
    }
}

/**
 * @public
 * @param {Error|ServoyException|String} exception the error/exception object containing the error text
 * @return {String} the exception error text
 *
 * @properties={typeid:24,uuid:"B3FE1D82-7087-44A8-AEA0-4D0F33B56C29"}
 */
function getExceptionText(exception) {
    var msg = '';

    if (typeof (exception) === 'string') {
        msg = '' + exception;
    } else if (exception instanceof Error) {
        msg = exception.message;
    } else if (exception instanceof ServoyException) {
        msg = exception.getMessage();
    } else {
        msg = '' + exception;
    }
    return msg;
}

/**
 * This function uses databaseManager.getFailedRecords() to get all failed records and returns
 * the collected errors info
 * @public
 * @return {String} the collected errors from all failed records or null if no errors were found
 *
 * @properties={typeid:24,uuid:"FB6A224A-F51C-4317-8DD3-BD81A451C575"}
 */
function getFailedRecordsErrors() {
    var failedRecords = databaseManager.getFailedRecords();
    if (failedRecords && failedRecords.length > 0) {
        var errors = '';
        for (var indx = 0; indx < failedRecords.length; indx++) {
            var rec = failedRecords[indx];
            var tableName = databaseManager.getTable(rec).getSQLName();
            var ex = rec.exception;
            if (!ex) {
                continue;
            }

            var validationError = null;
            if (ex instanceof DataException) {
                /** @type {DataException} */
                var dataEx = ex;
                validationError = dataEx.getValue();
            }

            if (validationError) {
                errors = utils.stringFormat('%1$s - [%2$s] %3$s', [errors, tableName, '' + validationError]);
            } else if (ex.getMessage && ex.getMessage()) {
                errors = utils.stringFormat('%1$s - [%2$s] %3$s', [errors, tableName, ex.getMessage()]);
            } else {
                errors = utils.stringFormat('%1$s - [%2$s] %3$s', [errors, tableName, ex]);
            }
        }
        return errors;
    }
    return null;
}

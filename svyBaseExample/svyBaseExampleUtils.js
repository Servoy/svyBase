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
/**
 * @public
 * @constructor
 * @param {Object} object
 * @properties={typeid:24,uuid:"6BA8068F-DF21-40F5-9539-DA514E21F26B"}
 */
function PropertyChangeSupport(object) {

    /**
     * Map of property change listeners (for removals)
     */
    var map = { };

    /**
     * @protected
     */
    this.source = object;

    /**
     * @type {java.beans.PropertyChangeSupport}
     * @protected
     */
    this.propChangeSupport = new java.beans.PropertyChangeSupport(this);

    /**
     * @public
     * @param {Function} listener
     * @param {String} [propertyName]
     */
    this.addListener = function(listener, propertyName) {
        var method = scopes.svySystem.convertServoyMethodToQualifiedName(listener);
        var propertyChangeListener = map[method];
        if (!propertyChangeListener) {
            propertyChangeListener = new java.beans.PropertyChangeListener({
                propertyChange: function(e) {
                    scopes.svySystem.callMethod(method, [{
                            propertyName: e.getPropertyName(),
                            oldValue: e.getOldValue(),
                            newValue: e.getNewValue(),
                            source: object
                        }]);
                }
            });
            map[method] = propertyChangeListener;
        }
        if (propertyName) {
            this.propChangeSupport.addPropertyChangeListener(propertyName, propertyChangeListener);
        } else {
            this.propChangeSupport.addPropertyChangeListener(propertyChangeListener);

        }
    }

    /**
     * @public
     * @param {Function} listener
     * @param {String} [propertyName]
     */
    this.removeListener = function(listener, propertyName) {
        var method = scopes.svySystem.convertServoyMethodToQualifiedName(listener);
        var propertyChangeListener = map[method];
        if (propertyChangeListener) {
            if (propertyName) {
                this.propChangeSupport.removePropertyChangeListener(propertyName, propertyChangeListener);
            } else {
                this.propChangeSupport.removePropertyChangeListener(propertyChangeListener);
            }
        }
    }

    /**
     * @public
     *
     */
    this.fireEvent = function(propertyName, oldValue, newValue) {
        this.propChangeSupport.firePropertyChange(propertyName, oldValue, newValue);
    }
}

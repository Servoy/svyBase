/**
 * Create a new instance of the PropertyChangeSupport class.
 * @classdesc This class is a Servoy "wrapper" for the java.beans.PropertyChangeSupport and provides functionality for monitoring and broadcasting property change events to registered listeners.
 * @public
 * @constructor
 * @param {Object} object The source object whose property changes are being monitored.
 * @properties={typeid:24,uuid:"6BA8068F-DF21-40F5-9539-DA514E21F26B"}
 */
function PropertyChangeSupport(object) {

    /**
     * Map of property change listeners (for removals)
     * @ignore
     */
    var map = { };

    /**
     * @protected
     * @ignore
     */
    this.source = object;

    /**
     * @protected
     * @type {java.beans.PropertyChangeSupport}
     * @ignore
     */
    this.propChangeSupport = new java.beans.PropertyChangeSupport(this);

    /**
     * Adds a listener which should be notified whenever the value of a property in the source object is changed.
     * All registered listeners must be removed using the method {@link PropertyChangeSupport#removeListener}. 
     * @public
     * @param {Function} listener The callback function to call whenever a property change event is fired. The callback function will receive an input argument object with the following properties: {propertyName: String, oldValue, newValue, source}
     * @param {String} [propertyName] Optional property name if the listener should be notified only if this specific property is changed. If not specified the listener will be notified when any property in the source object is changed.
     */
    this.addListener = function(listener, propertyName) {
        var method = scopes.svySystem.convertServoyMethodToQualifiedName(listener);
        var propertyChangeListener = map[method];
        if (!propertyChangeListener) {
            propertyChangeListener = new java.beans.PropertyChangeListener({
                propertyChange: function(e) {
                    scopes.svySystem.callMethod(method, {
                            propertyName: e.getPropertyName(),
                            oldValue: e.getOldValue(),
                            newValue: e.getNewValue(),
                            source: object
                        });
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
     * Removes a property change listener registered by the {@link PropertyChangeSupport#addListener}.
     * @public
     * @param {Function} listener The listener callback function to unregister.
     * @param {String} [propertyName] Optional property name used when the listener function was registered by {@link PropertyChangeSupport#addListener}.
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
     * Use this method to fire a property change event. The event notification will be broadcasted to all applicable registered listeners.
     * @public
     * @param {String} propertyName The name of the property which was changed.
     * @param oldValue The property old value.
     * @param newValue The property new value.
     */
    this.fireEvent = function(propertyName, oldValue, newValue) {
        this.propChangeSupport.firePropertyChange(propertyName, oldValue, newValue);
    }
}

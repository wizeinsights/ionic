const HapticEngine = {
  getEngine() {
    const win = (window as any);
    return win.TapticEngine || (win.Capacitor && win.Capacitor.Plugins.Haptics);
  },
  available() {
    return !!this.getEngine();
  },
  isCordova() {
    return !!(window as any).TapticEngine;
  },
  isCapacitor() {
    const win = (window as any);
    return !!win.Capacitor;
  },
  impact(options) {
    if (this.isCapacitor()) {
      getEngine().impact()
    }
  },
  notification() {
  },
  selectionChanged() {
  },
  selectionEnd() {
  },
  selectionStart() {
  }
}

/**
 * Check to see if the Haptic Plugin is available
 * @return Returns `true` or false if the plugin is available
 */
export const hapticAvailable = (): boolean => {
  return HapticEngine.available();
};

/**
 * Trigger a selection changed haptic event. Good for one-time events
 * (not for gestures)
 */
export const hapticSelection = () => {
  HapticEngine.selectionStart();
};

/**
 * Tell the haptic engine that a gesture for a selection change is starting.
 */
export const hapticSelectionStart = () => {
  HapticEngine.selectionStart();
};

/**
 * Tell the haptic engine that a selection changed during a gesture.
 */
export const hapticSelectionChanged = () => {
  HapticEngine.selectionChanged();
};

/**
 * Tell the haptic engine we are done with a gesture. This needs to be
 * called lest resources are not properly recycled.
 */
export const hapticSelectionEnd = () => {
  HapticEngine.selectionEnd();
};

/**
 * Use this to indicate success/failure/warning to the user.
 * options should be of the type `{ type: 'success' }` (or `warning`/`error`)
 */
export const hapticNotification = (options: { type: 'success' | 'warning' | 'error' }) => {
  HapticEngine.notification(options);
};

/**
 * Use this to indicate success/failure/warning to the user.
 * options should be of the type `{ style: 'light' }` (or `medium`/`heavy`)
 */
export const hapticImpact = (options: { style: 'light' | 'medium' | 'heavy' }) => {
  HapticEngine.impact(options);
};

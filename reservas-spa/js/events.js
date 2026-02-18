// events.js — Bus de eventos centralizado
const AppEvents = {
  BOOKINGS_UPDATED: 'app:bookings:updated',
  USER_CHANGED:     'app:user:changed',
  VIEW_CHANGE:      'app:view:change',

  dispatch(eventName, detail = {}) {
    document.dispatchEvent(new CustomEvent(eventName, { detail }));
  },

  on(eventName, callback) {
    document.addEventListener(eventName, callback);
  },

  off(eventName, callback) {
    document.removeEventListener(eventName, callback);
  }
};

export default AppEvents;
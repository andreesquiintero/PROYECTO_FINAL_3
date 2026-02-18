// store.js — Estado global con persistencia reactiva
import AppEvents from './events.js';

const Store = {
  // Escribe en localStorage y notifica a todos los listeners
  setBookings(bookings) {
    localStorage.setItem('bookings', JSON.stringify(bookings));
    AppEvents.dispatch(AppEvents.BOOKINGS_UPDATED, { bookings });
  },

  getBookings() {
    return JSON.parse(localStorage.getItem('bookings') || '[]');
  },

  setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    AppEvents.dispatch(AppEvents.USER_CHANGED, { user });
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
  },

  getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
  },

  setUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
  }
};

export default Store;
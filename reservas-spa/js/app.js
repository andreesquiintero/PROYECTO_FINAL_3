// app.js
import AppEvents from './events.js';
import { initRouter, navigateTo } from './router.js';
import { renderAuthView } from './auth/auth.view.js';
import { renderBookingsView } from './bookings/booking.view.js';
import { renderManageView } from './bookings/manage.view.js';
import { calcularMetricas } from './dashboard/dashboard.service.js';
import { renderDashboard } from './dashboard/dashboard.view.js';

const vistas = {
  login:     () => renderAuthView('login'),
  register:  () => renderAuthView('register'),
  bookings:  () => renderBookingsView(),
  manage:    () => renderManageView(),
  usuarios:  () => renderUsuariosView(),
  dashboard: () => renderDashboardView()
};

function renderDashboardView() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="max-w-5xl mx-auto px-4 py-8 vista">

      <div class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-bold text-gray-800">Panel Estadístico</h2>
        <div class="flex gap-2">
          <button id="btn-gestionar"
            class="text-sm text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1.5 rounded-lg">
            Gestionar Reservas
          </button>
          <button id="btn-usuarios-dash"
            class="text-sm text-purple-600 hover:text-purple-800 border border-purple-200 px-3 py-1.5 rounded-lg">
            Gestionar Usuarios
          </button>
          <button id="btn-logout-dash"
            class="text-sm text-gray-400 hover:text-red-500 border border-gray-200 px-3 py-1.5 rounded-lg">
            Cerrar sesión
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-2xl shadow-sm p-5">
          <p class="text-sm text-gray-400 mb-1">Total Reservas</p>
          <p id="stat-total" class="text-3xl font-bold text-blue-600">0</p>
        </div>
        <div class="bg-white rounded-2xl shadow-sm p-5">
          <p class="text-sm text-gray-400 mb-1">Pendientes</p>
          <p id="stat-pendientes" class="text-3xl font-bold text-yellow-500">0</p>
        </div>
        <div class="bg-white rounded-2xl shadow-sm p-5">
          <p class="text-sm text-gray-400 mb-1">Confirmadas</p>
          <p id="stat-confirmadas" class="text-3xl font-bold text-green-500">0</p>
        </div>
        <div class="bg-white rounded-2xl shadow-sm p-5">
          <p class="text-sm text-gray-400 mb-1">Canceladas</p>
          <p id="stat-canceladas" class="text-3xl font-bold text-red-500">0</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Usuarios más activos</h3>
        <ul id="lista-usuarios-activos" class="divide-y divide-gray-50"></ul>
      </div>

    </div>
  `;

  document.getElementById('btn-logout-dash').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    navigateTo('login');
  });

  document.getElementById('btn-gestionar').addEventListener('click', () => {
    navigateTo('bookings');
  });

  document.getElementById('btn-usuarios-dash').addEventListener('click', () => {
    navigateTo('usuarios');
  });

  renderDashboard(calcularMetricas());
}

function renderUsuariosView() {
  const main = document.getElementById('main-content');
  const usuarios = JSON.parse(localStorage.getItem('users') || '[]');

  const coloresRol = {
    admin:    'bg-purple-100 text-purple-700',
    operador: 'bg-blue-100 text-blue-700',
    cliente:  'bg-gray-100 text-gray-600'
  };

  main.innerHTML = `
    <div class="max-w-5xl mx-auto px-4 py-8 vista">

      <div class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
          <p class="text-gray-400 text-sm mt-1">${usuarios.length} usuarios registrados</p>
        </div>
        <div class="flex gap-2">
          <button id="btn-volver-dashboard"
            class="text-sm text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:text-blue-800">
            ← Dashboard
          </button>
          <button id="btn-logout-usuarios"
            class="text-sm text-gray-400 hover:text-red-500 border border-gray-200 px-3 py-1.5 rounded-lg">
            Cerrar sesión
          </button>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="text-left px-4 py-3 font-medium text-gray-500">Nombre</th>
              <th class="text-left px-4 py-3 font-medium text-gray-500">Email</th>
              <th class="text-left px-4 py-3 font-medium text-gray-500">Rol</th>
              <th class="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
              <th class="text-left px-4 py-3 font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody id="tabla-usuarios">
            ${usuarios.map(u => `
              <tr class="border-b border-gray-50 hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-800">${u.nombre}</td>
                <td class="px-4 py-3 text-gray-500">${u.email}</td>
                <td class="px-4 py-3">
                  <select onchange="cambiarRolUsuario('${u.uid}', this.value)"
                    class="text-xs border border-gray-200 rounded-lg px-2 py-1 ${coloresRol[u.rol]}">
                    <option value="cliente"   ${u.rol === 'cliente'   ? 'selected' : ''}>cliente</option>
                    <option value="operador"  ${u.rol === 'operador'  ? 'selected' : ''}>operador</option>
                    <option value="admin"     ${u.rol === 'admin'     ? 'selected' : ''}>admin</option>
                  </select>
                </td>
                <td class="px-4 py-3">
                  <span class="text-xs px-2 py-0.5 rounded-full ${u.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                    ${u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <button onclick="toggleUsuario('${u.uid}', ${u.activo})"
                    class="text-xs px-3 py-1 rounded-lg border transition-colors
                    ${u.activo
                      ? 'text-red-500 border-red-200 hover:text-red-700'
                      : 'text-green-500 border-green-200 hover:text-green-700'}">
                    ${u.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

    </div>
  `;

  document.getElementById('btn-volver-dashboard').addEventListener('click', () => navigateTo('dashboard'));
  document.getElementById('btn-logout-usuarios').addEventListener('click', () => {
    import('./auth/auth.service.js').then(({ logout }) => {
      logout();
      navigateTo('login');
    });
  });
}

// Funciones globales para gestión de usuarios
window.cambiarRolUsuario = function(uid, nuevoRol) {
  const usuarios = JSON.parse(localStorage.getItem('users') || '[]');
  const index = usuarios.findIndex(u => u.uid === uid);
  if (index === -1) return;

  usuarios[index].rol = nuevoRol;
  localStorage.setItem('users', JSON.stringify(usuarios));
  console.log(`✅ Rol de usuario actualizado a: ${nuevoRol}`);
};

window.toggleUsuario = function(uid, estadoActual) {
  const usuarios = JSON.parse(localStorage.getItem('users') || '[]');
  const index = usuarios.findIndex(u => u.uid === uid);
  if (index === -1) return;

  usuarios[index].activo = !estadoActual;
  localStorage.setItem('users', JSON.stringify(usuarios));
  navigateTo('usuarios');
};

// Escuchar cambios de vista
AppEvents.on(AppEvents.VIEW_CHANGE, (e) => {
  const { vista } = e.detail;
  const renderFn = vistas[vista];

  if (renderFn) {
    renderFn();
  } else {
    console.warn(`Vista no registrada: "${vista}"`);
    navigateTo('login');
  }
});

// Iniciar app
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 ReservasPRO iniciando...');
  initRouter();
});
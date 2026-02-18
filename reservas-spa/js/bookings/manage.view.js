// manage.view.js
import { getAllBookings, updateBookingStatus } from './booking.service.js';
import Store from '../store.js';
import AppEvents from '../events.js';

export function renderManageView() {
  const main = document.getElementById('main-content');
  const usuario = Store.getCurrentUser();

  // Fecha de hoy en formato YYYY-MM-DD
  const hoy = new Date().toISOString().split('T')[0];

  main.innerHTML = `
    <div class="max-w-5xl mx-auto px-4 py-8 vista">

      <div class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Agenda de Reservas</h2>
          <p class="text-gray-400 text-sm mt-1">
            Bienvenido, ${usuario?.nombre}
            <span class="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full ml-1">operador</span>
          </p>
        </div>
        <button id="btn-logout-op"
          class="text-sm text-gray-400 hover:text-red-500 border border-gray-200 px-3 py-1.5 rounded-lg">
          Cerrar sesión
        </button>
      </div>

      <!-- Selector de fecha -->
      <div class="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <label for="filtro-fecha" class="text-sm font-medium text-gray-600 whitespace-nowrap">
          📅 Filtrar por fecha:
        </label>
        <input type="date" id="filtro-fecha" value="${hoy}"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none">
        <button onclick="verAgendaHoy()"
          class="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
          Ver hoy
        </button>
        <button onclick="verTodas()"
          class="text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
          Ver todas
        </button>
      </div>

      <!-- Filtros por estado -->
      <div class="flex gap-2 mb-4 flex-wrap">
        <button onclick="filtrarEstadoOp('todos')" id="op-filtro-todos"
          class="op-filtro-btn bg-gray-800 text-white text-xs px-3 py-1.5 rounded-full transition-colors">
          Todos
        </button>
        <button onclick="filtrarEstadoOp('pendiente')" id="op-filtro-pendiente"
          class="op-filtro-btn bg-white text-gray-600 border text-xs px-3 py-1.5 rounded-full transition-colors">
          Pendientes
        </button>
        <button onclick="filtrarEstadoOp('confirmada')" id="op-filtro-confirmada"
          class="op-filtro-btn bg-white text-gray-600 border text-xs px-3 py-1.5 rounded-full transition-colors">
          Confirmadas
        </button>
        <button onclick="filtrarEstadoOp('cancelada')" id="op-filtro-cancelada"
          class="op-filtro-btn bg-white text-gray-600 border text-xs px-3 py-1.5 rounded-full transition-colors">
          Canceladas
        </button>
        <button onclick="filtrarEstadoOp('reprogramada')" id="op-filtro-reprogramada"
          class="op-filtro-btn bg-white text-gray-600 border text-xs px-3 py-1.5 rounded-full transition-colors">
          Reprogramadas
        </button>
      </div>

      <!-- Resumen del día -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6" id="resumen-dia">
      </div>

      <!-- Lista de reservas -->
      <section>
        <div id="contenedor-reservas-op" aria-live="polite"></div>
      </section>

    </div>

    <!-- Modal cambio de estado -->
    <div id="modal-op" class="hidden fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-800 mb-1">Gestionar Reserva</h3>
        <p id="modal-op-info" class="text-xs text-gray-400 mb-4"></p>

        <div id="alerta-modal-op" class="hidden mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"></div>

        <div class="flex flex-col gap-3 mb-4">
          <label class="text-sm font-medium text-gray-600">Nuevo estado</label>
          <select id="op-select-estado"
            class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none">
          </select>
        </div>

        <!-- Campos reprogramar -->
        <div id="op-campos-reprogramar" class="hidden flex-col gap-3 mb-4">
          <p class="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg">
            Ingresa la nueva fecha y horario para reprogramar
          </p>
          <input type="date" id="op-nueva-fecha"
            class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none">
          <div class="grid grid-cols-2 gap-2">
            <input type="time" id="op-nueva-hora-inicio"
              class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none">
            <input type="time" id="op-nueva-hora-fin"
              class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none">
          </div>
        </div>

        <div class="flex gap-3 justify-end">
          <button onclick="cerrarModalOp()"
            class="text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-lg hover:text-gray-700">
            Cancelar
          </button>
          <button onclick="confirmarCambioOp()"
            class="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('btn-logout-op').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    import('../router.js').then(({ navigateTo }) => navigateTo('login'));
  });

  document.getElementById('filtro-fecha').addEventListener('change', () => {
    renderReservasOp();
  });

  document.getElementById('op-select-estado').addEventListener('change', (e) => {
    const campos = document.getElementById('op-campos-reprogramar');
    if (e.target.value === 'reprogramada') {
      campos.classList.remove('hidden');
      campos.classList.add('flex');
    } else {
      campos.classList.add('hidden');
      campos.classList.remove('flex');
    }
  });

  AppEvents.on(AppEvents.BOOKINGS_UPDATED, () => renderReservasOp());

  // Render inicial con agenda de hoy
  renderReservasOp();
}

function renderResumenDia(reservas) {
  const resumen = document.getElementById('resumen-dia');
  if (!resumen) return;

  const total       = reservas.length;
  const pendientes  = reservas.filter(r => r.estado === 'pendiente').length;
  const confirmadas = reservas.filter(r => r.estado === 'confirmada').length;
  const canceladas  = reservas.filter(r => r.estado === 'cancelada').length;

  resumen.innerHTML = `
    <div class="bg-white rounded-xl shadow-sm p-4 text-center">
      <p class="text-xs text-gray-400 mb-1">Total</p>
      <p class="text-2xl font-bold text-gray-700">${total}</p>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-4 text-center">
      <p class="text-xs text-gray-400 mb-1">Pendientes</p>
      <p class="text-2xl font-bold text-yellow-500">${pendientes}</p>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-4 text-center">
      <p class="text-xs text-gray-400 mb-1">Confirmadas</p>
      <p class="text-2xl font-bold text-green-500">${confirmadas}</p>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-4 text-center">
      <p class="text-xs text-gray-400 mb-1">Canceladas</p>
      <p class="text-2xl font-bold text-red-500">${canceladas}</p>
    </div>
  `;
}

function renderReservasOp() {
  const contenedor = document.getElementById('contenedor-reservas-op');
  if (!contenedor) return;

  const fechaSeleccionada = document.getElementById('filtro-fecha')?.value || '';
  const filtroEstado      = window._filtroEstadoOp || 'todos';
  const usuarios          = Store.getUsers();

  let reservas = getAllBookings();

  // Filtrar por fecha si hay una seleccionada
  if (fechaSeleccionada) {
    reservas = reservas.filter(r => r.fecha === fechaSeleccionada);
  }

  // Actualizar resumen con reservas del día
  renderResumenDia(reservas);

  // Filtrar por estado
  if (filtroEstado !== 'todos') {
    reservas = reservas.filter(r => r.estado === filtroEstado);
  }

  // Actualizar estilos botones filtro
  document.querySelectorAll('.op-filtro-btn').forEach(btn => {
    btn.className = 'op-filtro-btn bg-white text-gray-600 border text-xs px-3 py-1.5 rounded-full transition-colors';
  });
  const btnActivo = document.getElementById(`op-filtro-${filtroEstado}`);
  if (btnActivo) btnActivo.className = 'op-filtro-btn bg-gray-800 text-white text-xs px-3 py-1.5 rounded-full transition-colors';

  if (reservas.length === 0) {
    contenedor.innerHTML = `
      <div class="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-400">
        <p class="text-4xl mb-3">📋</p>
        <p class="font-medium">No hay reservas para mostrar</p>
        <p class="text-sm mt-1">Prueba cambiando el filtro de fecha o estado</p>
      </div>
    `;
    return;
  }

  const coloresEstado = {
    pendiente:    'bg-yellow-100 text-yellow-700',
    confirmada:   'bg-green-100 text-green-700',
    cancelada:    'bg-red-100 text-red-700',
    reprogramada: 'bg-blue-100 text-blue-700'
  };

  const transicionesPermitidas = {
    pendiente:    ['confirmada', 'cancelada'],
    confirmada:   ['cancelada'],
    cancelada:    ['reprogramada'],
    reprogramada: ['confirmada', 'cancelada']
  };

  contenedor.innerHTML = reservas.map(reserva => {
    const propietario = usuarios.find(u => u.uid === reserva.uid);
    const nombre      = propietario?.nombre || 'Usuario eliminado';
    const transiciones = transicionesPermitidas[reserva.estado] || [];

    return `
      <div class="bg-white rounded-xl shadow-sm p-4 mb-3">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <span class="font-medium text-gray-800">${reserva.recurso}</span>
              <span class="text-xs px-2 py-0.5 rounded-full ${coloresEstado[reserva.estado]}">
                ${reserva.estado}
              </span>
            </div>
            <p class="text-sm text-gray-500">
              📅 ${reserva.fecha} &nbsp; ⏰ ${reserva.horaInicio} - ${reserva.horaFin}
            </p>
            <p class="text-xs text-gray-400 mt-1">👤 ${nombre}</p>
            ${reserva.descripcion ? `<p class="text-xs text-gray-400 mt-1">💬 ${reserva.descripcion}</p>` : ''}
          </div>

          <div class="flex gap-2">
            ${transiciones.length > 0 ? `
              <button onclick="abrirModalOp('${reserva.id}', '${reserva.estado}', '${reserva.recurso}', '${reserva.fecha}')"
                class="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors">
                Gestionar
              </button>
            ` : `
              <span class="text-xs text-gray-300 px-3 py-1.5">Sin acciones</span>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ── Funciones globales ─────────────────────────────────────────────────────

window.filtrarEstadoOp = function(estado) {
  window._filtroEstadoOp = estado;
  renderReservasOp();
};

window.verAgendaHoy = function() {
  const hoy = new Date().toISOString().split('T')[0];
  document.getElementById('filtro-fecha').value = hoy;
  renderReservasOp();
};

window.verTodas = function() {
  document.getElementById('filtro-fecha').value = '';
  renderReservasOp();
};

window.abrirModalOp = function(reservaId, estadoActual, recurso, fecha) {
  const transicionesPermitidas = {
    pendiente:    ['confirmada', 'cancelada'],
    confirmada:   ['cancelada'],
    cancelada:    ['reprogramada'],
    reprogramada: ['confirmada', 'cancelada']
  };

  const opciones = transicionesPermitidas[estadoActual] || [];
  const select   = document.getElementById('op-select-estado');
  select.innerHTML = opciones.map(op => `<option value="${op}">${op}</option>`).join('');

  document.getElementById('modal-op-info').textContent =
    `${recurso} — ${fecha} — Estado actual: ${estadoActual}`;
  document.getElementById('op-campos-reprogramar').classList.add('hidden');
  document.getElementById('alerta-modal-op').classList.add('hidden');
  document.getElementById('modal-op').classList.remove('hidden');
  window._reservaOpEnEdicion = reservaId;
};

window.cerrarModalOp = function() {
  document.getElementById('modal-op').classList.add('hidden');
  window._reservaOpEnEdicion = null;
};

window.confirmarCambioOp = function() {
  const nuevoEstado     = document.getElementById('op-select-estado').value;
  const nuevaFecha      = document.getElementById('op-nueva-fecha').value;
  const nuevaHoraInicio = document.getElementById('op-nueva-hora-inicio').value;
  const nuevaHoraFin    = document.getElementById('op-nueva-hora-fin').value;
  const alerta          = document.getElementById('alerta-modal-op');

  const resultado = updateBookingStatus({
    reservaId: window._reservaOpEnEdicion,
    nuevoEstado,
    nuevaFecha,
    nuevaHoraInicio,
    nuevaHoraFin
  });

  if (!resultado.exito) {
    alerta.textContent = resultado.error;
    alerta.classList.remove('hidden');
    return;
  }

  cerrarModalOp();
};
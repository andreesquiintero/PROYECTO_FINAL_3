// booking.view.js
import { createBooking, getMyBookings, getAllBookings, deleteBooking, updateBookingStatus } from './booking.service.js';
import Store from '../store.js';
import AppEvents from '../events.js';

export function renderBookingsView() {
  const main = document.getElementById('main-content');
  const usuario = Store.getCurrentUser();
  const esAdmin = usuario?.rol === 'admin';
  const esOperador = usuario?.rol === 'operador';

  main.innerHTML = `
    <div class="max-w-5xl mx-auto px-4 py-8 vista">

      <div class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">
            ${esAdmin ? 'Gestión de Reservas' : esOperador ? 'Agenda de Reservas' : 'Mis Reservas'}
          </h2>
          <p class="text-gray-400 text-sm mt-1">Bienvenido, ${usuario?.nombre} 
            <span class="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full ml-1">${usuario?.rol}</span>
          </p>
        </div>
        <div class="flex gap-2">
          ${esAdmin ? `
            <button id="btn-dashboard"
              class="text-sm text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1.5 rounded-lg">
              Ver Dashboard
            </button>
            <button id="btn-usuarios"
              class="text-sm text-purple-600 hover:text-purple-800 border border-purple-200 px-3 py-1.5 rounded-lg">
              Gestionar Usuarios
            </button>
          ` : ''}
          <button id="btn-logout"
            class="text-sm text-gray-400 hover:text-red-500 border border-gray-200 px-3 py-1.5 rounded-lg">
            Cerrar sesión
          </button>
        </div>
      </div>

      <!-- Formulario nueva reserva (solo clientes) -->
      ${!esAdmin && !esOperador ? `
      <section aria-labelledby="form-title" class="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <h3 id="form-title" class="text-lg font-semibold text-gray-700 mb-5">Nueva Reserva</h3>

        <div id="alerta-booking" role="alert" aria-live="polite"
          class="hidden mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"></div>
        <div id="exito-booking" role="status" aria-live="polite"
          class="hidden mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"></div>

        <form id="form-reserva" novalidate class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label for="input-fecha" class="text-sm font-medium text-gray-600">Fecha *</label>
            <input type="date" id="input-fecha"
              class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              aria-required="true">
          </div>
          <div class="flex flex-col gap-1">
            <label for="input-recurso" class="text-sm font-medium text-gray-600">Recurso *</label>
            <select id="input-recurso"
              class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none">
              <option value="">Selecciona un recurso</option>
              <option value="Sala A">Sala A</option>
              <option value="Sala B">Sala B</option>
              <option value="Auditorio">Auditorio</option>
            </select>
          </div>
          <div class="flex flex-col gap-1">
            <label for="input-hora-inicio" class="text-sm font-medium text-gray-600">Hora inicio *</label>
            <input type="time" id="input-hora-inicio"
              class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none">
          </div>
          <div class="flex flex-col gap-1">
            <label for="input-hora-fin" class="text-sm font-medium text-gray-600">Hora fin *</label>
            <input type="time" id="input-hora-fin"
              class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none">
          </div>
          <div class="flex flex-col gap-1 md:col-span-2">
            <label for="input-descripcion" class="text-sm font-medium text-gray-600">Descripción</label>
            <textarea id="input-descripcion" rows="2"
              class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
              placeholder="Motivo de la reserva..."></textarea>
          </div>
          <div class="md:col-span-2">
            <button type="submit"
              class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm">
              Crear Reserva
            </button>
          </div>
        </form>
      </section>
      ` : ''}

      <!-- Filtro por estado (admin y operador) -->
      ${esAdmin || esOperador ? `
      <div class="flex gap-2 mb-4 flex-wrap">
        <button onclick="filtrarPorEstado('todos')" id="filtro-todos"
          class="filtro-btn bg-gray-800 text-white text-xs px-3 py-1.5 rounded-full transition-colors">
          Todos
        </button>
        <button onclick="filtrarPorEstado('pendiente')" id="filtro-pendiente"
          class="filtro-btn bg-white text-gray-600 border text-xs px-3 py-1.5 rounded-full transition-colors">
          Pendientes
        </button>
        <button onclick="filtrarPorEstado('confirmada')" id="filtro-confirmada"
          class="filtro-btn bg-white text-gray-600 border text-xs px-3 py-1.5 rounded-full transition-colors">
          Confirmadas
        </button>
        <button onclick="filtrarPorEstado('cancelada')" id="filtro-cancelada"
          class="filtro-btn bg-white text-gray-600 border text-xs px-3 py-1.5 rounded-full transition-colors">
          Canceladas
        </button>
        <button onclick="filtrarPorEstado('reprogramada')" id="filtro-reprogramada"
          class="filtro-btn bg-white text-gray-600 border text-xs px-3 py-1.5 rounded-full transition-colors">
          Reprogramadas
        </button>
      </div>
      ` : ''}

      <!-- Lista de reservas -->
      <section aria-labelledby="lista-title">
        <h3 id="lista-title" class="text-lg font-semibold text-gray-700 mb-4">
          ${esAdmin ? 'Todas las Reservas' : esOperador ? 'Agenda' : 'Mi Historial'}
        </h3>
        <div id="contenedor-reservas" aria-live="polite"></div>
      </section>

    </div>

    <!-- Modal cambio de estado -->
    <div id="modal-estado" class="hidden fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Cambiar Estado de Reserva</h3>

        <div id="alerta-modal" class="hidden mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"></div>

        <p class="text-sm text-gray-500 mb-4">Reserva: <span id="modal-reserva-id" class="font-medium text-gray-700"></span></p>
        <p class="text-sm text-gray-500 mb-4">Estado actual: <span id="modal-estado-actual" class="font-medium text-gray-700"></span></p>

        <div class="flex flex-col gap-3 mb-4">
          <label class="text-sm font-medium text-gray-600">Nuevo estado</label>
          <select id="select-nuevo-estado"
            class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none">
          </select>
        </div>

        <!-- Campos para reprogramar -->
        <div id="campos-reprogramar" class="hidden flex flex-col gap-3 mb-4">
          <p class="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg">Para reprogramar debes ingresar nueva fecha y horario</p>
          <input type="date" id="nueva-fecha"
            class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none">
          <div class="grid grid-cols-2 gap-2">
            <input type="time" id="nueva-hora-inicio"
              class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none">
            <input type="time" id="nueva-hora-fin"
              class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none">
          </div>
        </div>

        <div class="flex gap-3 justify-end">
          <button onclick="cerrarModal()"
            class="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-4 py-2 rounded-lg">
            Cancelar
          </button>
          <button onclick="confirmarCambioEstado()"
            class="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            Confirmar cambio
          </button>
        </div>
      </div>
    </div>
  `;

  renderListaReservas('todos');
  agregarListeners();
}

function agregarListeners() {
  const usuario = Store.getCurrentUser();

  document.getElementById('btn-logout')?.addEventListener('click', () => {
    import('../auth/auth.service.js').then(({ logout }) => {
      logout();
      import('../router.js').then(({ navigateTo }) => navigateTo('login'));
    });
  });

  document.getElementById('btn-dashboard')?.addEventListener('click', () => {
    import('../router.js').then(({ navigateTo }) => navigateTo('dashboard'));
  });

  document.getElementById('btn-usuarios')?.addEventListener('click', () => {
    import('../router.js').then(({ navigateTo }) => navigateTo('usuarios'));
  });

  document.getElementById('form-reserva')?.addEventListener('submit', (e) => {
    e.preventDefault();
    manejarCrearReserva();
  });

  document.getElementById('select-nuevo-estado')?.addEventListener('change', (e) => {
    const camposReprogramar = document.getElementById('campos-reprogramar');
    if (e.target.value === 'reprogramada') {
      camposReprogramar.classList.remove('hidden');
    } else {
      camposReprogramar.classList.add('hidden');
    }
  });

  AppEvents.on(AppEvents.BOOKINGS_UPDATED, () => renderListaReservas(window._filtroActual || 'todos'));
}

function renderListaReservas(filtro = 'todos') {
  window._filtroActual = filtro;
  const contenedor = document.getElementById('contenedor-reservas');
  if (!contenedor) return;

  const usuario    = Store.getCurrentUser();
  const esAdmin    = usuario?.rol === 'admin';
  const esOperador = usuario?.rol === 'operador';
  const usuarios   = Store.getUsers();

  let reservas = esAdmin || esOperador ? getAllBookings() : getMyBookings();

  if (filtro !== 'todos') {
    reservas = reservas.filter(r => r.estado === filtro);
  }

  // Actualizar estilos de botones de filtro
  document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.className = 'filtro-btn bg-white text-gray-600 border text-xs px-3 py-1.5 rounded-full transition-colors';
  });
  const btnActivo = document.getElementById(`filtro-${filtro}`);
  if (btnActivo) btnActivo.className = 'filtro-btn bg-gray-800 text-white text-xs px-3 py-1.5 rounded-full transition-colors';

  if (reservas.length === 0) {
    contenedor.innerHTML = `
      <div class="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-400">
        <p class="text-4xl mb-3">📋</p>
        <p class="font-medium">No hay reservas ${filtro !== 'todos' ? `con estado "${filtro}"` : 'aún'}</p>
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
    const nombrePropietario = propietario?.nombre || 'Usuario eliminado';
    const puedeGestionar = esAdmin || esOperador;
    const esPropia = reserva.uid === usuario.uid;
    const puedeCancelar = !puedeGestionar && esPropia && reserva.estado !== 'cancelada';
    const transiciones = transicionesPermitidas[reserva.estado] || [];

    return `
      <div class="bg-white rounded-xl shadow-sm p-4 mb-3">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <span class="font-medium text-gray-800">${reserva.recurso}</span>
              <span class="text-xs px-2 py-0.5 rounded-full ${coloresEstado[reserva.estado] || 'bg-gray-100 text-gray-600'}">
                ${reserva.estado}
              </span>
              ${puedeGestionar ? `<span class="text-xs text-gray-400">— ${nombrePropietario}</span>` : ''}
            </div>
            <p class="text-sm text-gray-500">📅 ${reserva.fecha} &nbsp; ⏰ ${reserva.horaInicio} - ${reserva.horaFin}</p>
            ${reserva.descripcion ? `<p class="text-xs text-gray-400 mt-1">${reserva.descripcion}</p>` : ''}
          </div>

          <div class="flex gap-2 flex-wrap">
            ${puedeGestionar && transiciones.length > 0 ? `
              <button onclick="abrirModalEstado('${reserva.id}', '${reserva.estado}')"
                class="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors">
                Cambiar estado
              </button>
            ` : ''}
            ${puedeCancelar ? `
              <button onclick="cancelarReservaCliente('${reserva.id}')"
                class="text-xs text-orange-500 hover:text-orange-700 border border-orange-200 px-3 py-1.5 rounded-lg transition-colors">
                Cancelar
              </button>
            ` : ''}
            ${esAdmin ? `
              <button onclick="eliminarReserva('${reserva.id}')"
                class="text-xs text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg transition-colors">
                Eliminar
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function manejarCrearReserva() {
  const alerta = document.getElementById('alerta-booking');
  const exito  = document.getElementById('exito-booking');

  const datos = {
    fecha:       document.getElementById('input-fecha').value,
    horaInicio:  document.getElementById('input-hora-inicio').value,
    horaFin:     document.getElementById('input-hora-fin').value,
    recurso:     document.getElementById('input-recurso').value,
    descripcion: document.getElementById('input-descripcion').value
  };

  const resultado = createBooking(datos);

  if (!resultado.exito) {
    exito.classList.add('hidden');
    alerta.textContent = resultado.error;
    alerta.classList.remove('hidden');
    return;
  }

  alerta.classList.add('hidden');
  exito.textContent = '✅ Reserva creada exitosamente.';
  exito.classList.remove('hidden');
  document.getElementById('form-reserva').reset();
  setTimeout(() => exito.classList.add('hidden'), 3000);
}

// ── Funciones globales para botones dinámicos ──────────────────────────────

window.filtrarPorEstado = function(estado) {
  renderListaReservas(estado);
};

window.abrirModalEstado = function(reservaId, estadoActual) {
  const transicionesPermitidas = {
    pendiente:    ['confirmada', 'cancelada'],
    confirmada:   ['cancelada'],
    cancelada:    ['reprogramada'],
    reprogramada: ['confirmada', 'cancelada']
  };

  const opciones = transicionesPermitidas[estadoActual] || [];
  const select = document.getElementById('select-nuevo-estado');
  select.innerHTML = opciones.map(op => `<option value="${op}">${op}</option>`).join('');

  document.getElementById('modal-reserva-id').textContent  = reservaId;
  document.getElementById('modal-estado-actual').textContent = estadoActual;
  document.getElementById('campos-reprogramar').classList.add('hidden');
  document.getElementById('alerta-modal').classList.add('hidden');
  document.getElementById('modal-estado').classList.remove('hidden');
  window._reservaEnEdicion = reservaId;
};

window.cerrarModal = function() {
  document.getElementById('modal-estado').classList.add('hidden');
  window._reservaEnEdicion = null;
};

window.confirmarCambioEstado = function() {
  const nuevoEstado    = document.getElementById('select-nuevo-estado').value;
  const nuevaFecha     = document.getElementById('nueva-fecha').value;
  const nuevaHoraInicio = document.getElementById('nueva-hora-inicio').value;
  const nuevaHoraFin   = document.getElementById('nueva-hora-fin').value;
  const alerta         = document.getElementById('alerta-modal');

  const resultado = updateBookingStatus({
    reservaId: window._reservaEnEdicion,
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

  cerrarModal();
};

window.cancelarReservaCliente = function(reservaId) {
  const confirmado = confirm('¿Deseas cancelar esta reserva?');
  if (!confirmado) return;

  const resultado = updateBookingStatus({
    reservaId,
    nuevoEstado: 'cancelada'
  });

  if (!resultado.exito) alert(resultado.error);
};

window.eliminarReserva = function(reservaId) {
  const confirmado = confirm('¿Estás seguro de que deseas eliminar esta reserva?');
  if (!confirmado) return;

  const resultado = deleteBooking(reservaId);
  if (!resultado.exito) alert(resultado.error);
};
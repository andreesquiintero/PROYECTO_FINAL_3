// auth.view.js
import { login, register } from './auth.service.js';
import { navigateTo } from '../router.js';

export function renderAuthView(modo = 'login') {
  const main = document.getElementById('main-content');

  main.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div class="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md vista">

        <h1 class="text-2xl font-bold text-blue-700 mb-1 text-center">ReservasPRO</h1>
        <p class="text-gray-400 text-sm text-center mb-6">
          ${modo === 'login' ? 'Selecciona tu tipo de cuenta e inicia sesión' : 'Crea tu cuenta'}
        </p>

        <!-- Alerta error -->
        <div id="alerta-auth" role="alert" aria-live="polite"
          class="hidden mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        </div>

        <!-- Alerta éxito -->
        <div id="exito-auth" role="status" aria-live="polite"
          class="hidden mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
        </div>

        <form id="form-auth" novalidate class="flex flex-col gap-4">

          <!-- Selector de tipo de cuenta (login y registro) -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-600">
              ${modo === 'login' ? 'Iniciar sesión como' : 'Tipo de cuenta'}
            </label>
            <div class="grid grid-cols-3 gap-2">

              <label class="cursor-pointer">
                <input type="radio" name="rol" value="cliente" class="hidden peer" checked>
                <div class="peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600
                            border border-gray-200 rounded-xl p-3 text-center transition-all hover:border-blue-300">
                  <p class="text-xl mb-1">👤</p>
                  <p class="text-xs font-medium">Cliente</p>
                  <p class="text-xs text-gray-400 peer-checked:text-blue-100 mt-0.5">Mis reservas</p>
                </div>
              </label>

              <label class="cursor-pointer">
                <input type="radio" name="rol" value="operador" class="hidden peer">
                <div class="peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600
                            border border-gray-200 rounded-xl p-3 text-center transition-all hover:border-blue-300">
                  <p class="text-xl mb-1">🛠️</p>
                  <p class="text-xs font-medium">Operador</p>
                  <p class="text-xs text-gray-400 peer-checked:text-blue-100 mt-0.5">Gestionar agenda</p>
                </div>
              </label>

              <label class="cursor-pointer">
                <input type="radio" name="rol" value="admin" class="hidden peer">
                <div class="peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600
                            border border-gray-200 rounded-xl p-3 text-center transition-all hover:border-blue-300">
                  <p class="text-xl mb-1">⚙️</p>
                  <p class="text-xs font-medium">Admin</p>
                  <p class="text-xs text-gray-400 peer-checked:text-blue-100 mt-0.5">Acceso total</p>
                </div>
              </label>

            </div>
          </div>

          ${modo === 'register' ? `
          <!-- Nombre solo en registro -->
          <div class="flex flex-col gap-1">
            <label for="input-nombre" class="text-sm font-medium text-gray-600">Nombre completo</label>
            <input type="text" id="input-nombre" placeholder="Tu nombre completo"
              class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              aria-required="true">
          </div>
          ` : ''}

          <!-- Email -->
          <div class="flex flex-col gap-1">
            <label for="input-email" class="text-sm font-medium text-gray-600">Email</label>
            <input type="email" id="input-email" placeholder="tu@email.com"
              class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              aria-required="true">
          </div>

          <!-- Contraseña -->
          <div class="flex flex-col gap-1">
            <label for="input-password" class="text-sm font-medium text-gray-600">Contraseña</label>
            <input type="password" id="input-password"
              placeholder="${modo === 'login' ? 'Tu contraseña' : 'Mínimo 8 caracteres'}"
              class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              aria-required="true">
          </div>

          <!-- Botón submit -->
          <button type="submit"
            class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm mt-1">
            ${modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>

        </form>

        <!-- Cambiar entre login y registro -->
        <p class="text-center text-sm text-gray-400 mt-6">
          ${modo === 'login'
            ? `¿No tienes cuenta? <button id="btn-cambiar-modo" class="text-blue-600 hover:underline font-medium">Regístrate</button>`
            : `¿Ya tienes cuenta? <button id="btn-cambiar-modo" class="text-blue-600 hover:underline font-medium">Inicia sesión</button>`
          }
        </p>

      </div>
    </div>
  `;

  document.getElementById('form-auth').addEventListener('submit', (e) => {
    e.preventDefault();
    manejarSubmitAuth(modo);
  });

  document.getElementById('btn-cambiar-modo').addEventListener('click', () => {
    renderAuthView(modo === 'login' ? 'register' : 'login');
  });
}

function manejarSubmitAuth(modo) {
  const alerta  = document.getElementById('alerta-auth');
  const exito   = document.getElementById('exito-auth');
  const email    = document.getElementById('input-email')?.value;
  const password = document.getElementById('input-password')?.value;
  const nombre   = document.getElementById('input-nombre')?.value;
  const rolSeleccionado = document.querySelector('input[name="rol"]:checked')?.value || 'cliente';

  let resultado;

  if (modo === 'login') {
    resultado = login({ email, password, rolEsperado: rolSeleccionado });
  } else {
    resultado = register({ nombre, email, password, rol: rolSeleccionado });
  }

  if (!resultado.exito) {
    exito.classList.add('hidden');
    alerta.textContent = resultado.error;
    alerta.classList.remove('hidden');
    return;
  }

  alerta.classList.add('hidden');

  if (modo === 'register') {
    exito.textContent = `✅ Cuenta creada como ${rolSeleccionado}. Ahora inicia sesión.`;
    exito.classList.remove('hidden');
    setTimeout(() => renderAuthView('login'), 1500);
    return;
  }

  const vistaDefaultPorRol = {
    admin:    'dashboard',
    operador: 'manage',
    cliente:  'bookings'
  };
  const vistaDestino = vistaDefaultPorRol[resultado.usuario.rol] || 'bookings';
  navigateTo(vistaDestino);
}
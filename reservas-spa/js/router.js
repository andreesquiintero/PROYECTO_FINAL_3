// router.js
import Store from './store.js';

const routeConfig = {
  'login':     { rolesPermitidos: ['*'],                            redireccionSinAcceso: null },
  'register':  { rolesPermitidos: ['*'],                            redireccionSinAcceso: null },
  'bookings':  { rolesPermitidos: ['cliente', 'operador', 'admin'], redireccionSinAcceso: 'login' },
  'manage':    { rolesPermitidos: ['operador', 'admin'],            redireccionSinAcceso: 'bookings' },
  'dashboard': { rolesPermitidos: ['admin'],                        redireccionSinAcceso: 'bookings' },
  'usuarios':  { rolesPermitidos: ['admin'],                        redireccionSinAcceso: 'bookings' },
};

const vistaDefaultPorRol = {
  admin:    'dashboard',
  operador: 'manage',
  cliente:  'bookings',
  guest:    'login'
};

export function navigateTo(vista) {
  const config = routeConfig[vista];

  if (!config) {
    console.warn(`Ruta "${vista}" no definida.`);
    return renderView('login');
  }

  const usuario          = Store.getCurrentUser();
  const rolActual        = usuario?.rol || 'guest';
  const esTodosPermitidos = config.rolesPermitidos.includes('*');
  const tieneAcceso      = esTodosPermitidos || config.rolesPermitidos.includes(rolActual);

  if (!esTodosPermitidos && !usuario) {
    return renderView('login');
  }

  if (!tieneAcceso) {
    const vistaFallback = vistaDefaultPorRol[rolActual];
    console.warn(`Acceso denegado a "${vista}" para rol "${rolActual}". Redirigiendo a "${vistaFallback}".`);
    return renderView(vistaFallback);
  }

  renderView(vista);
}

function renderView(vista) {
  window.location.hash = vista;
  document.dispatchEvent(new CustomEvent('app:view:change', { detail: { vista } }));
}

window.addEventListener('hashchange', () => {
  const vistaActual = window.location.hash.replace('#', '') || 'login';
  navigateTo(vistaActual);
});

export function initRouter() {
  const usuario   = Store.getCurrentUser();
  const rolActual = usuario?.rol || 'guest';

  // Siempre redirigir según el rol, ignorando el hash guardado
  const vistaInicial = usuario
    ? vistaDefaultPorRol[rolActual]
    : 'login';

  console.log(`🔀 Iniciando como "${rolActual}" → vista: "${vistaInicial}"`);
  
  // Limpiar el hash antes de navegar para evitar conflictos
  window.location.hash = '';
  navigateTo(vistaInicial);
}
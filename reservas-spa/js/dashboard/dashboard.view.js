// dashboard.view.js
export function renderDashboard(metricas) {
  const { totalReservas, conteoPorEstado, usuariosMasActivos } = metricas;

  const elTotal        = document.getElementById('stat-total');
  const elPendientes   = document.getElementById('stat-pendientes');
  const elConfirmadas  = document.getElementById('stat-confirmadas');
  const elCanceladas   = document.getElementById('stat-canceladas');
  const elLista        = document.getElementById('lista-usuarios-activos');

  if (elTotal)       elTotal.textContent       = totalReservas;
  if (elPendientes)  elPendientes.textContent  = conteoPorEstado.pendiente   || 0;
  if (elConfirmadas) elConfirmadas.textContent = conteoPorEstado.confirmada  || 0;
  if (elCanceladas)  elCanceladas.textContent  = conteoPorEstado.cancelada   || 0;

  if (elLista) {
    if (usuariosMasActivos.length === 0) {
      elLista.innerHTML = `<li class="text-gray-400 text-sm py-3">No hay datos aún.</li>`;
      return;
    }
    elLista.innerHTML = usuariosMasActivos.map(({ nombre, cantidad }) => `
      <li class="flex justify-between items-center py-3">
        <span class="text-gray-700 font-medium">${nombre}</span>
        <span class="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full">
          ${cantidad} reserva${cantidad !== 1 ? 's' : ''}
        </span>
      </li>
    `).join('');
  }
}
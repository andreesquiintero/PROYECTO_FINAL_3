// dashboard.service.js
import Store from '../store.js';

export function calcularMetricas() {
  const reservas = Store.getBookings();
  const usuarios = Store.getUsers();

  const totalReservas = reservas.length;

  const conteoPorEstado = reservas.reduce((acumulador, reserva) => {
    acumulador[reserva.estado] = (acumulador[reserva.estado] || 0) + 1;
    return acumulador;
  }, {});

  const reservasPorUsuario = reservas.reduce((acumulador, reserva) => {
    acumulador[reserva.uid] = (acumulador[reserva.uid] || 0) + 1;
    return acumulador;
  }, {});

  const usuariosMasActivos = Object.entries(reservasPorUsuario)
    .sort(([, cantA], [, cantB]) => cantB - cantA)
    .slice(0, 5)
    .map(([uid, cantidad]) => {
      const datosUsuario = usuarios.find(u => u.uid === uid);
      return { uid, nombre: datosUsuario?.nombre || 'Usuario eliminado', cantidad };
    });

  return { totalReservas, conteoPorEstado, usuariosMasActivos };
}
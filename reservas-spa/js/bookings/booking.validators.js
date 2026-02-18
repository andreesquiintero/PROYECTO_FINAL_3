// booking.validators.js
export function esFechaFutura(fecha, hora) {
  const fechaHoraReserva = new Date(`${fecha}T${hora}:00`);
  return fechaHoraReserva > new Date();
}

export function hayConflictoDeHorario(reservasExistentes, fecha, horaInicio, horaFin, recurso) {
  return reservasExistentes.some(reserva => {
    const mismoRecurso = reserva.recurso === recurso;
    const mismaFecha   = reserva.fecha === fecha;
    const estadoActivo = ['pendiente', 'confirmada'].includes(reserva.estado);

    if (!mismoRecurso || !mismaFecha || !estadoActivo) return false;

    // Detectar solapamiento: dos rangos se solapan si uno no termina antes de que el otro empiece
    const iniciaNueva = horaInicio < reserva.horaFin;
    const terminaNueva = horaFin > reserva.horaInicio;
    return iniciaNueva && terminaNueva;
  });
}
// booking.service.js — createBooking
import Store from '../store.js';
import { esFechaFutura, hayConflictoDeHorario } from './booking.validators.js';

export function createBooking({ fecha, horaInicio, horaFin, descripcion, recurso }) {
  const usuario = Store.getCurrentUser();

  // Early Return: sin sesión
  if (!usuario) return { exito: false, error: 'Debes iniciar sesión para reservar.' };

  // Early Return: campos obligatorios
  const camposCompletos = fecha && horaInicio && horaFin && recurso;
  if (!camposCompletos) return { exito: false, error: 'Completa todos los campos requeridos.' };

  // Early Return: hora fin debe ser posterior a hora inicio
  const horaFinEsPosterior = horaFin > horaInicio;
  if (!horaFinEsPosterior) return { exito: false, error: 'La hora de fin debe ser posterior a la de inicio.' };

  // Early Return: no fechas pasadas
  const reservaEsFutura = esFechaFutura(fecha, horaInicio);
  if (!reservaEsFutura) return { exito: false, error: 'No puedes reservar en una fecha u hora pasada.' };

  const reservasExistentes = Store.getBookings();

  // Early Return: conflicto de horario
  const existeConflicto = hayConflictoDeHorario(reservasExistentes, fecha, horaInicio, horaFin, recurso);
  if (existeConflicto) return { exito: false, error: `El recurso "${recurso}" ya está reservado en ese horario.` };

  const nuevaReserva = {
    id: `res_${Date.now()}`,
    uid: usuario.uid,
    fecha,
    horaInicio,
    horaFin,
    estado: 'pendiente',
    descripcion: descripcion?.trim() || '',
    recurso,
    historialEstados: [
      { estado: 'pendiente', fecha: new Date().toISOString(), modificadoPor: usuario.uid }
    ],
    creadaEn: new Date().toISOString(),
    actualizadaEn: new Date().toISOString()
  };

  Store.setBookings([...reservasExistentes, nuevaReserva]);
  return { exito: true, reserva: nuevaReserva };
}

// booking.service.js — updateBookingStatus
export function updateBookingStatus({ reservaId, nuevoEstado, nuevaFecha, nuevaHoraInicio, nuevaHoraFin }) {
  const usuario = Store.getCurrentUser();

  // Early Return: permisos insuficientes
  const tienePermisoDeGestion = ['operador', 'admin'].includes(usuario?.rol);
  if (!tienePermisoDeGestion) return { exito: false, error: 'No tienes permisos para cambiar estados.' };

  const reservas = Store.getBookings();
  const reservaActual = reservas.find(r => r.id === reservaId);

  // Early Return: reserva no encontrada
  if (!reservaActual) return { exito: false, error: 'Reserva no encontrada.' };

  // Mapa de transiciones válidas
  const transicionesPermitidas = {
    pendiente:    ['confirmada', 'cancelada'],
    confirmada:   ['cancelada'],
    cancelada:    ['reprogramada'],  // Requiere nueva fecha
    reprogramada: ['confirmada', 'cancelada']
  };

  const estadoActual = reservaActual.estado;
  const transicionEsValida = transicionesPermitidas[estadoActual]?.includes(nuevoEstado);

  // Early Return: transición inválida
  if (!transicionEsValida) {
    return {
      exito: false,
      error: `No se puede pasar de "${estadoActual}" a "${nuevoEstado}". Transiciones válidas: ${transicionesPermitidas[estadoActual]?.join(', ')}`
    };
  }

  // Early Return: reprogramar requiere nueva fecha
  const requiereNuevaFecha = nuevoEstado === 'reprogramada';
  const seProporcionoNuevaFecha = nuevaFecha && nuevaHoraInicio && nuevaHoraFin;
  if (requiereNuevaFecha && !seProporcionoNuevaFecha) {
    return { exito: false, error: 'Para reprogramar debes proporcionar nueva fecha y horario.' };
  }

  const reservaActualizada = {
    ...reservaActual,
    estado: nuevoEstado,
    ...(requiereNuevaFecha && { fecha: nuevaFecha, horaInicio: nuevaHoraInicio, horaFin: nuevaHoraFin }),
    actualizadaEn: new Date().toISOString(),
    historialEstados: [
      ...reservaActual.historialEstados,
      { estado: nuevoEstado, fecha: new Date().toISOString(), modificadoPor: usuario.uid }
    ]
  };

  const reservasActualizadas = reservas.map(r => r.id === reservaId ? reservaActualizada : r);
  Store.setBookings(reservasActualizadas);

  return { exito: true, reserva: reservaActualizada };
}

// booking.service.js — deleteBooking (Solo Admin)
export function deleteBooking(reservaId) {
  const usuario = Store.getCurrentUser();

  // Early Return: solo admin puede eliminar
  const esAdmin = usuario?.rol === 'admin';
  if (!esAdmin) return { exito: false, error: 'Solo el administrador puede eliminar reservas.' };

  const reservas = Store.getBookings();
  const reservaExiste = reservas.some(r => r.id === reservaId);
  if (!reservaExiste) return { exito: false, error: 'La reserva no existe.' };

  // .filter() devuelve un NUEVO array sin mutar el original
  const reservasFiltradas = reservas.filter(r => r.id !== reservaId);

  // setBookings notifica via Custom Event para re-renderizar el DOM automáticamente
  Store.setBookings(reservasFiltradas);

  return { exito: true, mensaje: `Reserva ${reservaId} eliminada correctamente.` };
}

// booking.service.js — getMyBookings (Solo el propio cliente)
export function getMyBookings() {
  const usuario = Store.getCurrentUser();
  if (!usuario) return [];

  const todasLasReservas = Store.getBookings();

  // .filter() garantiza aislamiento: el cliente solo ve sus propios datos
  const misReservas = todasLasReservas.filter(r => r.uid === usuario.uid);

  // Ordenar por fecha descendente (más reciente primero)
  return misReservas.sort((a, b) => new Date(b.creadaEn) - new Date(a.creadaEn));
}

// Obtener TODAS las reservas (admin y operador)
export function getAllBookings() {
  const reservas = Store.getBookings();
  return reservas.sort((a, b) => new Date(b.creadaEn) - new Date(a.creadaEn));
}
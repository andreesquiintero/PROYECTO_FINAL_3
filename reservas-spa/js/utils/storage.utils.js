// ✅ DESPUÉS: storage.utils.js — Centralizado, robusto y con gestión de quota
const LIMITE_STORAGE_BYTES = 4.5 * 1024 * 1024; // 4.5MB (margen de seguridad sobre el límite de 5MB)
const ANTIGUEDAD_MAXIMA_MS = 365 * 24 * 60 * 60 * 1000; // 1 año en milisegundos

export function calcularUsoActualBytes() {
  let totalBytes = 0;
  for (const clave in localStorage) {
    if (localStorage.hasOwnProperty(clave)) {
      // Cada carácter UTF-16 ocupa 2 bytes en memoria
      totalBytes += (localStorage.getItem(clave).length + clave.length) * 2;
    }
  }
  return totalBytes;
}

export function hayEspacioSuficiente(datosNuevos) {
  const bytesActuales = calcularUsoActualBytes();
  const bytesNuevos = JSON.stringify(datosNuevos).length * 2;
  return (bytesActuales + bytesNuevos) < LIMITE_STORAGE_BYTES;
}

export function limpiarReservasAntiguas() {
  const reservas = JSON.parse(localStorage.getItem('bookings') || '[]');
  const ahora = Date.now();

  const reservasFiltradas = reservas.filter(reserva => {
    const fechaCreacion = new Date(reserva.creadaEn).getTime();
    const esReciente = (ahora - fechaCreacion) < ANTIGUEDAD_MAXIMA_MS;
    const estaActiva = ['pendiente', 'confirmada'].includes(reserva.estado);
    // Conservar: reservas recientes O reservas activas (independiente de su antigüedad)
    return esReciente || estaActiva;
  });

  const seEliminaronRegistros = reservasFiltradas.length < reservas.length;
  if (seEliminaronRegistros) {
    localStorage.setItem('bookings', JSON.stringify(reservasFiltradas));
    console.info(`Limpieza: ${reservas.length - reservasFiltradas.length} reservas antiguas eliminadas.`);
  }

  return reservasFiltradas.length;
}

// Wrapper seguro para escribir en storage
export function setItemSeguro(clave, valor) {
  const hayEspacio = hayEspacioSuficiente(valor);

  if (!hayEspacio) {
    // Intento de limpieza automática antes de fallar
    limpiarReservasAntiguas();

    const hayEspacioTrasCleaning = hayEspacioSuficiente(valor);
    if (!hayEspacioTrasCleaning) {
      console.error('Storage lleno. No se pudo guardar:', clave);
      return { exito: false, error: 'Almacenamiento local lleno. Contacta al administrador.' };
    }
  }

  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return { exito: true };
  } catch (error) {
    // Captura QuotaExceededError nativo del navegador
    console.error('Error al escribir en localStorage:', error);
    return { exito: false, error: 'Error de almacenamiento: ' + error.message };
  }
}
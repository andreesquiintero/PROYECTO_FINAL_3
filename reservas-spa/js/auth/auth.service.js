// auth.service.js
import Store from '../store.js';
import AppEvents from '../events.js';

// ⚠️ ADVERTENCIA DE SEGURIDAD:
// localStorage NO es un almacenamiento seguro. En producción usar bcrypt
// en el servidor y JWT con HttpOnly cookies. Aquí simulamos un hash simple
// solo con fines educativos.

function simularHash(texto) {
  return btoa(texto + '_salt_empresa_2024');
}

export function register({ nombre, email, password, rol = 'cliente' }) {
  const camposRequeridos = [nombre, email, password];
  const hayCamposVacios = camposRequeridos.some(campo => !campo || campo.trim() === '');
  if (hayCamposVacios) {
    return { exito: false, error: 'Todos los campos son obligatorios.' };
  }

  const formatoEmailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!formatoEmailValido) {
    return { exito: false, error: 'El formato del email no es válido.' };
  }

  const longitudPasswordSuficiente = password.length >= 8;
  if (!longitudPasswordSuficiente) {
    return { exito: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
  }

  const usuarios = Store.getUsers();

  const emailYaRegistrado = usuarios.some(u => u.email === email.toLowerCase());
  if (emailYaRegistrado) {
    return { exito: false, error: 'Este email ya está registrado.' };
  }

  const nuevoUsuario = {
    uid: `usr_${Date.now()}`,
    nombre: nombre.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: simularHash(password),
    rol,
    fechaRegistro: new Date().toISOString(),
    activo: true
  };

  Store.setUsers([...usuarios, nuevoUsuario]);
  return { exito: true, usuario: { ...nuevoUsuario, passwordHash: undefined } };
}

export function login({ email, password, rolEsperado }) {
  const hayCredencialesVacias = !email || !password;
  if (hayCredencialesVacias) {
    return { exito: false, error: 'Email y contraseña son requeridos.' };
  }

  const usuarios = Store.getUsers();

  const usuarioEncontrado = usuarios.find(u => u.email === email.toLowerCase());
  if (!usuarioEncontrado) {
    return { exito: false, error: 'Credenciales inválidas.' };
  }

  const cuentaEstaActiva = usuarioEncontrado.activo === true;
  if (!cuentaEstaActiva) {
    return { exito: false, error: 'Esta cuenta ha sido desactivada. Contacta al administrador.' };
  }

  const rolCoincide = usuarioEncontrado.rol === rolEsperado;
  if (!rolCoincide) {
    return { exito: false, error: `Esta cuenta no es de tipo "${rolEsperado}". Selecciona el tipo correcto.` };
  }

  const hashIngresado = simularHash(password);
  const esPasswordValido = hashIngresado === usuarioEncontrado.passwordHash;
  if (!esPasswordValido) {
    return { exito: false, error: 'Credenciales inválidas.' };
  }

  const sesionUsuario = {
    uid:    usuarioEncontrado.uid,
    nombre: usuarioEncontrado.nombre,
    email:  usuarioEncontrado.email,
    rol:    usuarioEncontrado.rol
  };

  Store.setCurrentUser(sesionUsuario);
  return { exito: true, usuario: sesionUsuario };
}

export function logout() {
  localStorage.removeItem('currentUser');
  AppEvents.dispatch(AppEvents.USER_CHANGED, { user: null });
}
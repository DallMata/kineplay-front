// src/lib/api.ts
export const API_BASE_URL =
  (document.getElementById('cfg') as HTMLElement)?.dataset.apiBaseUrl || '';

async function req(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    // ❌ sin credentials: 'include'
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  const text = await res.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { /* respuesta no-JSON */ }

  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}: ${text?.slice(0,200)}`);
  }
  return data;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    req(`/usuarios.php?login=1`, { method: 'POST', body: JSON.stringify({ email, password }) }),

  // Pacientes del médico
  pacientesDeMedico: (idMedico: number) =>
    req(`/usuarios.php?pacientes_de_medico=${idMedico}&activas=1`),

  // Eliminar usuario con fallbacks (por si el backend no acepta DELETE)
  eliminarUsuario: async (idUsuario: number) => {
    try {
      // 1) DELETE real
      return await req(`/usuarios.php?id_usuario=${idUsuario}`, { method: 'DELETE' });
    } catch (e1) {
      try {
        // 2) POST x-www-form-urlencoded
        return await req(`/usuarios.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ action: 'delete', id_usuario: String(idUsuario) }) as any,
        });
      } catch (e2) {
        // 3) POST JSON override
        return req(`/usuarios.php`, {
          method: 'POST',
          body: JSON.stringify({ _method: 'DELETE', id_usuario: idUsuario }),
        });
      }
    }
  },

  // Asignaciones del paciente
  asignacionesPorPaciente: (idUsuarioPaciente: number) =>
    req(`/asignaciones.php?id_usuario_paciente=${idUsuarioPaciente}`),

  // Tipos (observaciones)
  tipoById: (id_tipo: number) =>
    req(`/tipoDatoJuegos.php?id_tipo=${id_tipo}`),

  // Crear asignación
  crearAsign: (payload: {
    id_aplicacion:number; id_usuario_medico:number; id_usuario_paciente:number;
    fecha_inicio:string; fecha_fin:string; tiempo_minimo_seg:number;
  }) => req(`/asignaciones.php`, { method:'POST', body: JSON.stringify(payload) }),

  // Crear juego
  crearJuego: (payload: {
    id_usuario_paciente:number; id_aplicacion:number; tiempo_jugado:number; puntaje?:number; fecha?:string;
  }) => req(`/juegos.php`, { method:'POST', body: JSON.stringify(payload) }),

  // Guardar puntos
  guardarPuntos: (
    puntos: Array<{id_juego:number; tiempo:number; angulo:number; id_tipo:number}>,
    upsert=false
  ) => req(`/juego_datos.php${upsert ? '?upsert=1':''}`, { method:'POST', body: JSON.stringify(puntos) }),
};

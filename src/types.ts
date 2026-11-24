export interface UsuarioAutenticado {
  id: string
  nombre: string
  correo: string | null
  rol: string
  proveedores: string[]
}

export interface Servidor {
  idServidor: string
  nombre: string
  estadoActual: string
  fechaCreacion: string
  nombreMundo: string
  tamanoMundo: string
  dificultad: string
  maxJugadores: number
  puertoHost: number
  protocolo: string
  versionJuego: string
}
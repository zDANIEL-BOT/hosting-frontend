export interface UsuarioAutenticado {
  id: string
  nombre: string
  correo: string | null
  rol: string
  proveedores: string[]
}
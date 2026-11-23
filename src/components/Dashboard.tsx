import { useState } from 'react'
import type { UsuarioAutenticado } from '../types'
import { proveedorInfo } from '../providers'
import { ProviderIcon } from './ProviderIcon'

interface Props {
  usuario: UsuarioAutenticado
  onLogout: () => Promise<void>
}

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return 'U'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[1][0]).toUpperCase()
}

export function Dashboard({ usuario, onLogout }: Props) {
  const [saliendo, setSaliendo] = useState(false)

  async function cerrar() {
    setSaliendo(true)
    try {
      await onLogout()
    } finally {
      setSaliendo(false)
    }
  }

  return (
    <main className="dashboard">
      <div className="card account-card">
        <div className="account-top">
          <div className="avatar">{iniciales(usuario.nombre)}</div>
          <div className="account-ids">
            <h1 className="account-name">{usuario.nombre}</h1>
            <p className="account-email">{usuario.correo ?? 'Sin correo vinculado'}</p>
          </div>
          <span className="rol-pill">{usuario.rol}</span>
        </div>

        <div className="status-row">
          <span className="status-dot" />
          Sesión iniciada
        </div>

        <div className="section">
          <h2 className="section-title">Cuentas vinculadas</h2>
          <div className="linked-providers">
            {usuario.proveedores.length === 0 && (
              <p className="muted">Aún no hay proveedores vinculados.</p>
            )}
            {usuario.proveedores.map((provider) => {
              const info = proveedorInfo(provider)
              return (
                <span key={provider} className="linked-badge">
                  <ProviderIcon provider={provider} size={14} />
                  {info.label}
                </span>
              )
            })}
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">Identificador</h2>
          <code className="account-id">{usuario.id}</code>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={cerrar}
          disabled={saliendo}
        >
          {saliendo ? (
            <>
              <span className="spinner dark" /> Cerrando sesión…
            </>
          ) : (
            'Cerrar sesión'
          )}
        </button>
      </div>
    </main>
  )
}
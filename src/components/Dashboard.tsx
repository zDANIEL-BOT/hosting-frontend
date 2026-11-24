import { useEffect, useState } from "react";
import type { Servidor, UsuarioAutenticado } from "../types";
import { fetchServidores } from "../api";

interface Props {
  usuario: UsuarioAutenticado;
  onLogout: () => Promise<void>;
}

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "U";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

function fechaFormato(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function Dashboard({ usuario, onLogout }: Props) {
  const [saliendo, setSaliendo] = useState(false);
  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [cargandoServidores, setCargandoServidores] = useState(true);
  const [errorServidores, setErrorServidores] = useState<string | null>(null);

  async function cargarServidores() {
    setCargandoServidores(true);
    setErrorServidores(null);

    try {
      const datos = await fetchServidores();
      setServidores(datos);
    } catch (error) {
      setErrorServidores(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al cargar los servidores",
      );
    } finally {
      setCargandoServidores(false);
    }
  }

  useEffect(() => {
    void cargarServidores();
  }, []);

  async function cerrar() {
    setSaliendo(true);
    try {
      await onLogout();
    } finally {
      setSaliendo(false);
    }
  }

  return (
    <main className="dashboard">
      <header className="card account-header">
        <div className="account-top">
          <div className="avatar">{iniciales(usuario.nombre)}</div>

          <div className="account-ids">
            <h1 className="account-name">{usuario.nombre}</h1>
            <p className="account-email">
              {usuario.correo ?? "Sin correo vinculado"}
            </p>
          </div>
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
            "Cerrar sesión"
          )}
        </button>
      </header>

      <section className="servers-section">
        <div className="servers-heading">
          <div>
            <h2 className="section-title">Mis servidores</h2>
            <p className="muted">
              Administra y consulta tus servidores de Terraria.
            </p>
          </div>

          <span className="servers-count">
            {servidores.length}{" "}
            {servidores.length === 1 ? "servidor" : "servidores"}
          </span>
        </div>

        {cargandoServidores && (
          <div className="servers-message">
            <span className="spinner" />
            Cargando servidores...
          </div>
        )}

        {!cargandoServidores && errorServidores && (
          <div className="servers-message">
            <p>{errorServidores}</p>
            <button
              type="button"
              className="retry-button"
              onClick={() => void cargarServidores()}
            >
              Reintentar
            </button>
          </div>
        )}

        {!cargandoServidores && !errorServidores && servidores.length === 0 && (
          <div className="servers-message">
            Todavía no tienes servidores creados.
          </div>
        )}

        {!cargandoServidores && !errorServidores && servidores.length > 0 && (
          <div className="servers-grid">
            {servidores.map((servidor) => (
              <article className="server-card" key={servidor.idServidor}>
                <div className="server-card-heading">
                  <h3>{servidor.nombre}</h3>
                  <span
                    className={`server-status ${servidor.estadoActual.toLowerCase()}`}
                  >
                    {servidor.estadoActual}
                  </span>
                </div>

                <p className="server-world">{servidor.nombreMundo}</p>

                <div className="server-details">
                  <div>
                    <span>Tamaño del mundo</span>
                    <strong>{servidor.tamanoMundo}</strong>
                  </div>
                  <div>
                    <span>Dificultad</span>
                    <strong>{servidor.dificultad}</strong>
                  </div>
                  <div>
                    <span>Máximo de jugadores</span>
                    <strong>{servidor.maxJugadores}</strong>
                  </div>
                  <div>
                    <span>Puerto</span>
                    <strong>
                      {servidor.puertoHost}/{servidor.protocolo}
                    </strong>
                  </div>
                  <div>
                    <span>Versión de Terraria</span>
                    <strong>{servidor.versionJuego}</strong>
                  </div>
                  <div>
                    <span>Creado el</span>
                    <strong>{fechaFormato(servidor.fechaCreacion)}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

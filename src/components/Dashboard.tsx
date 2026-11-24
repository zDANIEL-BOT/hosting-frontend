import { useEffect, useState } from "react";
import type { Servidor, UsuarioAutenticado } from "../types";
import {
  fetchServidores,
  controlarServidor,
  eliminarServidor,
  obtenerEstadoServidor,
} from "../api";
import { CrearServidorForm } from "./CrearServidorForm";

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

function estadoVisual(estado: string): string {
  const estados: Record<string, string> = {
    RUNNING: "ENCENDIDO",
    EXITED: "DETENIDO",
    CREATED: "DETENIDO",
    RESTARTING: "REINICIANDO",
    PAUSED: "PAUSADO",
    DEAD: "ERROR",
    NO_CREADO: "NO CREADO",
  };

  return estados[estado] ?? estado;
}

export function Dashboard({ usuario, onLogout }: Props) {
  const [saliendo, setSaliendo] = useState(false);
  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [cargandoServidores, setCargandoServidores] = useState(true);
  const [errorServidores, setErrorServidores] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [servidorOcupado, setServidorOcupado] = useState<string | null>(null);
  const [errorControl, setErrorControl] = useState<string | null>(null);

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

  async function actualizarEstados() {
    const resultados = await Promise.all(
      servidores.map(async (servidor) => {
        try {
          const estado = await obtenerEstadoServidor(servidor.idServidor);
          return { idServidor: servidor.idServidor, estado };
        } catch {
          return null;
        }
      }),
    );

    setServidores((actuales) =>
      actuales.map((servidor) => {
        const resultado = resultados.find(
          (item) => item?.idServidor === servidor.idServidor,
        );

        return resultado
          ? { ...servidor, estadoActual: resultado.estado }
          : servidor;
      }),
    );
  }

  async function servidorCreado() {
    setMostrarFormulario(false);
    await cargarServidores();
  }

  useEffect(() => {
    void cargarServidores();
  }, []);

  useEffect(() => {
    if (servidores.length === 0) return;

    void actualizarEstados();

    const intervalo = window.setInterval(() => {
      void actualizarEstados();
    }, 5000);

    return () => window.clearInterval(intervalo);
  }, [servidores.length]);

  async function ejecutarAccion(
    idServidor: string,
    accion: "iniciar" | "detener" | "reiniciar",
  ) {
    setServidorOcupado(idServidor);
    setErrorControl(null);

    try {
      await controlarServidor(idServidor, accion);
      const estado = await obtenerEstadoServidor(idServidor);

      setServidores((actuales) =>
        actuales.map((servidor) =>
          servidor.idServidor === idServidor
            ? { ...servidor, estadoActual: estado }
            : servidor,
        ),
      );
    } catch (error) {
      setErrorControl(
        error instanceof Error
          ? error.message
          : "No se pudo ejecutar la acción.",
      );
    } finally {
      setServidorOcupado(null);
    }
  }

  async function borrarServidor(idServidor: string) {
    if (!window.confirm("¿Seguro que deseas eliminar este servidor?")) return;

    setServidorOcupado(idServidor);
    setErrorControl(null);

    try {
      await eliminarServidor(idServidor);
      setServidores((actuales) =>
        actuales.filter((servidor) => servidor.idServidor !== idServidor),
      );
    } catch (error) {
      setErrorControl(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el servidor.",
      );
    } finally {
      setServidorOcupado(null);
    }
  }

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
          {saliendo ? "Cerrando sesión…" : "Cerrar sesión"}
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

          <div className="servers-heading-actions">
            <span className="servers-count">
              {servidores.length}{" "}
              {servidores.length === 1 ? "servidor" : "servidores"}
            </span>
            <button
              type="button"
              className="create-button"
              onClick={() => setMostrarFormulario(true)}
            >
              + Crear servidor
            </button>
          </div>
        </div>

        {mostrarFormulario && (
          <CrearServidorForm
            onCreado={servidorCreado}
            onCancelar={() => setMostrarFormulario(false)}
          />
        )}

        {errorControl && <p className="form-error">{errorControl}</p>}

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
            {servidores.map((servidor) => {
              const ocupado = servidorOcupado === servidor.idServidor;
              const encendido = servidor.estadoActual === "RUNNING";

              return (
                <article className="server-card" key={servidor.idServidor}>
                  <div className="server-card-heading">
                    <h3>{servidor.nombre}</h3>
                    <span
                      className={`server-status ${estadoVisual(servidor.estadoActual).toLowerCase()}`}
                    >
                      {estadoVisual(servidor.estadoActual)}
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
                      <span>Puerto de conexión</span>
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

                  <div className="server-actions">
                    {encendido ? (
                      <button
                        type="button"
                        onClick={() =>
                          void ejecutarAccion(servidor.idServidor, "detener")
                        }
                        disabled={ocupado}
                      >
                        Detener
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          void ejecutarAccion(servidor.idServidor, "iniciar")
                        }
                        disabled={ocupado}
                      >
                        Iniciar
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        void ejecutarAccion(servidor.idServidor, "reiniciar")
                      }
                      disabled={ocupado || !encendido}
                    >
                      Reiniciar
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => void borrarServidor(servidor.idServidor)}
                      disabled={ocupado}
                    >
                      Eliminar
                    </button>

                    {ocupado && <span>Procesando...</span>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

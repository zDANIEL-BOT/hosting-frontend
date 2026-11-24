import { useState } from "react";
import type { FormEvent } from "react";
import type { CrearServidorDTO } from "../types";
import { crearServidor } from "../api";

interface Props {
  onCreado: () => Promise<void>;
  onCancelar: () => void;
}

export function CrearServidorForm({ onCreado, onCancelar }: Props) {
  const [nombre, setNombre] = useState("");
  const [nombreMundo, setNombreMundo] = useState("");
  const [tamanoMundo, setTamanoMundo] = useState("pequeño");
  const [dificultad, setDificultad] = useState("clasico");
  const [maxJugadores, setMaxJugadores] = useState(8);
  const [contrasena, setContrasena] = useState("");

  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const datos: CrearServidorDTO = {
      nombre: nombre.trim(),
      nombreMundo: nombreMundo.trim(),
      tamanoMundo,
      dificultad,
      maxJugadores,
      contrasena: contrasena.trim() || null,
    };

    setCreando(true);

    try {
      await crearServidor(datos);
      await onCreado();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al crear el servidor",
      );
    } finally {
      setCreando(false);
    }
  }

  return (
    <section className="create-server-card">
      <div className="create-server-heading">
        <div>
          <h2>Crear servidor</h2>
          <p className="muted">Configura tu nuevo servidor de Terraria.</p>
        </div>
      </div>

      <form onSubmit={enviarFormulario} className="create-server-form">
        <div className="form-field">
          <label htmlFor="nombre">Nombre del servidor</label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            maxLength={100}
            required
            disabled={creando}
            placeholder="Ej. Mi servidor"
          />
        </div>

        <div className="form-field">
          <label htmlFor="nombreMundo">Nombre del mundo</label>
          <input
            id="nombreMundo"
            type="text"
            value={nombreMundo}
            onChange={(e) => setNombreMundo(e.target.value)}
            maxLength={100}
            required
            disabled={creando}
            placeholder="Ej. Mundo de aventuras"
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="tamanoMundo">Tamaño del mundo</label>
            <select
              id="tamanoMundo"
              value={tamanoMundo}
              onChange={(e) => setTamanoMundo(e.target.value)}
              disabled={creando}
            >
              <option value="pequeño">Pequeño</option>
              <option value="mediano">Mediano</option>
              <option value="grande">Grande</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="dificultad">Dificultad</label>
            <select
              id="dificultad"
              value={dificultad}
              onChange={(e) => setDificultad(e.target.value)}
              disabled={creando}
            >
              <option value="clasico">Clásico</option>
              <option value="experto">Experto</option>
              <option value="maestro">Maestro</option>
              <option value="viaje">Viaje</option>
            </select>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="maxJugadores">Máximo de jugadores</label>
          <input
            id="maxJugadores"
            type="number"
            min={1}
            max={255}
            value={maxJugadores}
            onChange={(e) => setMaxJugadores(Number(e.target.value))}
            required
            disabled={creando}
          />
        </div>

        <div className="form-field">
          <label htmlFor="contrasena">
            Contraseña <span className="muted">(opcional)</span>
          </label>
          <input
            id="contrasena"
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            disabled={creando}
            placeholder="Dejar vacío para no utilizar contraseña"
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={onCancelar}
            disabled={creando}
          >
            Cancelar
          </button>

          <button type="submit" className="create-button" disabled={creando}>
            {creando ? "Creando servidor..." : "Crear servidor"}
          </button>
        </div>
      </form>
    </section>
  );
}

import { useState } from "react";
import { loginUrl } from "../api";
import { proveedorInfo } from "../providers";
import { ProviderIcon } from "./ProviderIcon";

interface Props {
  providers: string[];
  onLocalLogin: (correo: string, contrasena: string) => Promise<void>;
}

export function LoginPage({ providers, onLocalLogin }: Props) {
  const [cargando, setCargando] = useState<string | null>(null);
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [cargandoLocal, setCargandoLocal] = useState(false);

  function iniciar(provider: string) {
    setCargando(provider);
    window.location.assign(loginUrl(provider));
  }

  async function iniciarSesionLocal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorLocal(null);
    setCargandoLocal(true);

    try {
      await onLocalLogin(correo, contrasena);
    } catch (error) {
      setErrorLocal(
        error instanceof Error ? error.message : "No se pudo iniciar sesión",
      );
    } finally {
      setCargandoLocal(false);
    }
  }

  return (
    <main className="login">
      <div className="card login-card">
        <div className="brand">
          <div className="brand-mark">
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
              <path
                fill="currentColor"
                d="M7.97 16.03a.75.75 0 0 1-1.06 0l-1.03-1.03a.75.75 0 0 1 0-1.06l1.03-1.03a.75.75 0 0 1 1.06 1.06l-.5.5h8.06l-.5-.5a.75.75 0 0 1 1.06-1.06l1.03 1.03a.75.75 0 0 1 0 1.06l-1.03 1.03a.75.75 0 0 1-1.06-1.06l.5-.5H8.47l.5.5a.75.75 0 0 1 0 1.06z"
              />
              <path
                fill="currentColor"
                d="M12 2a10 10 0 0 0-7.07 2.93l1.06 1.06A8.5 8.5 0 1 1 3.5 12H2a10 10 0 1 0 10-10zm0 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z"
              />
            </svg>
          </div>
          <h1 className="brand-title">GameHost</h1>
          <p className="brand-subtitle">
            Aloja y administra tus servidores de juegos
          </p>
        </div>

        <div className="divider" />

        <form className="local-login-form" onSubmit={iniciarSesionLocal}>
          <p className="login-hint">Iniciar sesión con correo y contraseña</p>

          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            disabled={cargandoLocal}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            disabled={cargandoLocal}
          />

          {errorLocal && <p className="login-error">{errorLocal}</p>}

          <button
            type="submit"
            className="provider-button local-login-button"
            disabled={cargandoLocal || cargando !== null}
          >
            {cargandoLocal ? "Iniciando sesión…" : "Iniciar sesión"}
          </button>
        </form>

        <div className="divider" />

        <p className="login-hint">O continúa con un proveedor externo</p>

        <div className="providers">
          {providers.length === 0 && (
            <p className="providers-empty">
              No hay proveedores configurados en el backend. Revisa el archivo{" "}
              <code>.env</code>.
            </p>
          )}

          {providers.map((provider) => {
            const info = proveedorInfo(provider);
            const loading = cargando === provider;
            return (
              <button
                key={provider}
                type="button"
                className="provider-button"
                style={
                  {
                    "--provider-bg": info.color,
                    "--provider-fg": info.foreground,
                  } as React.CSSProperties
                }
                onClick={() => iniciar(provider)}
                disabled={cargando !== null}
              >
                <span className="provider-icon">
                  <ProviderIcon provider={provider} />
                </span>
                <span className="provider-label">
                  {loading ? "Redirigiendo…" : `Continuar con ${info.label}`}
                </span>
                {loading && <span className="spinner" />}
              </button>
            );
          })}
        </div>

        <p className="legal">
          Al continuar aceptas nuestros términos. Nunca compartimos tu
          contraseña con terceros.
        </p>
      </div>
    </main>
  );
}

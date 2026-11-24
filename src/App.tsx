import { useCallback, useEffect, useState } from "react";
import { fetchMe, fetchProviders, logout, loginLocal } from "./api";
import type { UsuarioAutenticado } from "./types";
import { LoginPage } from "./components/LoginPage";
import { Dashboard } from "./components/Dashboard";
import "./App.css";

type Estado = "cargando" | "autenticado" | "anonimo" | "error";

function App() {
  const [estado, setEstado] = useState<Estado>("cargando");
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [providers, setProviders] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const [sesion, proveedores] = await Promise.all([
          fetchMe(),
          fetchProviders(),
        ]);
        if (!activo) return;
        setProviders(proveedores);
        setUsuario(sesion);
        setEstado(sesion ? "autenticado" : "anonimo");
      } catch (e) {
        if (!activo) return;
        setError(e instanceof Error ? e.message : "Error inesperado");
        setEstado("error");
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, []);

  const handleLocalLogin = useCallback(
    async (correo: string, contrasena: string) => {
      await loginLocal(correo, contrasena);

      const sesion = await fetchMe();

      if (!sesion) {
        throw new Error(
          "No se pudo recuperar la sesión después del inicio de sesión",
        );
      }

      setUsuario(sesion);
      setEstado("autenticado");
    },
    [],
  );

  const handleLogout = useCallback(async () => {
    await logout();
    setUsuario(null);
    setEstado("anonimo");
  }, []);

  if (estado === "cargando") {
    return (
      <main className="screen-center">
        <div className="spinner big" />
        <p className="muted">Verificando sesión…</p>
      </main>
    );
  }

  if (estado === "error") {
    return (
      <main className="screen-center">
        <div className="card error-card">
          <h1>Algo salió mal</h1>
          <p className="muted">{error}</p>
          <button
            type="button"
            className="logout-button"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  if (estado === "autenticado" && usuario) {
    return <Dashboard usuario={usuario} onLogout={handleLogout} />;
  }

  return <LoginPage providers={providers} onLocalLogin={handleLocalLogin} />;
}

export default App;

import type { UsuarioAutenticado, Servidor, CrearServidorDTO } from "./types";

const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:5157";

export function apiUrl(): string {
  return API_URL;
}

export function loginUrl(provider: string): string {
  const returnUrl = encodeURIComponent(window.location.origin);
  return `${API_URL}/api/auth/login/${provider}?returnUrl=${returnUrl}`;
}

export async function loginLocal(
  correo: string,
  contrasena: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ correo, contrasena }),
  });

  if (!res.ok) {
    throw new Error("Correo o contraseña incorrectos");
  }
}

export async function fetchProviders(): Promise<string[]> {
  const res = await fetch(`${API_URL}/api/auth/providers`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(
      "No se pudieron cargar los proveedores de inicio de sesión",
    );
  }

  return (await res.json()) as string[];
}

export async function fetchMe(): Promise<UsuarioAutenticado | null> {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    credentials: "include",
  });

  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) throw new Error("No se pudo verificar la sesión");

  return (await res.json()) as UsuarioAutenticado;
}

export async function fetchServidores(): Promise<Servidor[]> {
  const res = await fetch(`${API_URL}/api/Servidores`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("No se pudieron cargar los servidores");
  }

  return (await res.json()) as Servidor[];
}

export async function crearServidor(datos: CrearServidorDTO): Promise<void> {
  const res = await fetch(`${API_URL}/api/Servidores`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(datos),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.mensaje ?? "No se pudo crear el servidor");
  }
}

export async function logout(): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw new Error("No se pudo cerrar la sesión");
}

export async function controlarServidor(
  idServidor: string,
  accion: "iniciar" | "detener" | "reiniciar",
): Promise<void> {
  const respuesta = await fetch(
    `${API_URL}/api/Servidores/${idServidor}/${accion}`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);
    throw new Error(error?.mensaje ?? "No se pudo controlar el servidor.");
  }
}

export async function eliminarServidor(idServidor: string): Promise<void> {
  const respuesta = await fetch(`${API_URL}/api/Servidores/${idServidor}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);
    throw new Error(error?.mensaje ?? "No se pudo eliminar el servidor.");
  }
}

export async function obtenerEstadoServidor(
  idServidor: string,
): Promise<string> {
  const respuesta = await fetch(
    `${API_URL}/api/Servidores/${idServidor}/estado`,
    {
      credentials: "include",
    },
  );

  if (!respuesta.ok) {
    throw new Error("No se pudo consultar el estado del servidor.");
  }

  const datos = await respuesta.json();
  return datos.estado;
}

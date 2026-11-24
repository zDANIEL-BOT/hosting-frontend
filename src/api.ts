import type { UsuarioAutenticado, Servidor } from "./types";

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
  if (!res.ok)
    throw new Error(
      "No se pudieron cargar los proveedores de inicio de sesión",
    );
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

export async function logout(): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("No se pudo cerrar la sesión");
}

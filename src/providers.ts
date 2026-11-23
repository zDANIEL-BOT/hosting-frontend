export interface ProveedorInfo {
  key: string
  label: string
  color: string
  foreground: string
}

export const PROVEEDORES: Record<string, ProveedorInfo> = {
  Discord: {
    key: 'Discord',
    label: 'Discord',
    color: '#5865F2',
    foreground: '#ffffff',
  },
  GitHub: {
    key: 'GitHub',
    label: 'GitHub',
    color: '#24292f',
    foreground: '#ffffff',
  },
  Google: {
    key: 'Google',
    label: 'Google',
    color: '#ffffff',
    foreground: '#1f1f1f',
  },
  TikTok: {
    key: 'TikTok',
    label: 'TikTok',
    color: '#010101',
    foreground: '#ffffff',
  },
}

export function proveedorInfo(key: string): ProveedorInfo {
  return (
    PROVEEDORES[key] ?? {
      key,
      label: key,
      color: '#2a2f3a',
      foreground: '#ffffff',
    }
  )
}
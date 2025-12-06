/**
 * Interface Usuario - Coincide con Usuario.php jsonSerialize()
 * Soporta ambos formatos: nuevo (id) y legacy (usuarios_id)
 */
export interface Usuario {
  // Formato nuevo
  id: number;
  nombre_completo: string;
  username: string;
  rol_id: number;
  cargo_id: number;
  activo: boolean;
  token: string | null;
  
  // Formato legacy (usado en algunos templates)
  usuarios_id?: number;
  usuarios_nombre?: string;
  usuarios_username?: string;
  usuarios_rol_id?: number;
  usuarios_cargo_id?: number;
  usuarios_activo?: boolean;
}

/**
 * Roles de usuario en el sistema
 */
export enum RolUsuario {
  ADMIN = 1,
  USUARIO_NORMAL = 2
}

/**
 * Helper para verificar si un usuario es administrador
 */
export function esAdmin(usuario: Usuario): boolean {
  return usuario.rol_id === RolUsuario.ADMIN;
}

/**
 * Helper para verificar si un usuario está activo
 */
export function estaActivo(usuario: Usuario): boolean {
  return usuario.activo === true;
}

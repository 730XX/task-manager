import { ApiResponse, TipoRespuesta } from './api-response.interface';
import { Usuario } from './usuario.interface';

/**
 * Request para login
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Respuesta de login - El backend devuelve el Usuario completo con token
 * Usa la estructura estándar ApiResponse<Usuario>
 */
export type LoginResponse = ApiResponse<Usuario>;

/**
 * Usuario autenticado almacenado en el frontend
 * Subconjunto de Usuario con los campos necesarios para auth
 */
export interface AuthUser {
  id: number;
  nombre_completo: string;
  username: string;
  rol_id: number;
  token: string;
}

/**
 * Respuesta de logout
 */
export type LogoutResponse = ApiResponse<null>;

/**
 * Helper para verificar si el login fue exitoso
 */
export function isLoginSuccess(response: LoginResponse): boolean {
  return response.tipo === TipoRespuesta.SUCCESS && !!response.data?.token;
}


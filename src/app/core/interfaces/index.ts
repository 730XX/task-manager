/**
 * Barrel file - Exporta todas las interfaces desde un solo punto
 * Uso: import { Usuario, Tarea, ApiResponse } from '@core/interfaces';
 */

// Respuesta API estándar
export * from './api-response.interface';

// Modelos de dominio
export * from './usuario.interface';
export * from './tarea.interface';
export * from './actividad.interface';
export * from './sucursal.interface';
export * from './categoria.interface';
export * from './cargo.interface';

// Auth (existente) - Re-exportar para compatibilidad
export * from './auth.interface';

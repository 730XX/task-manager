export interface LoginRequest {
  usuario: string;
  password: string;
}

export interface LoginResponse {
  tipo: number; // 1=success, 2=warning, 3=error
  mensajes: string[];
  data?: {
    token: string;
    usuario_id: number;
    rol: string;
  };
}

export interface User {
  usuario_id: number;
  rol: string;
  token: string;
}

export interface LogoutResponse {
  tipo: number; // 1=success, 2=warning, 3=error
  mensajes: string[];
}

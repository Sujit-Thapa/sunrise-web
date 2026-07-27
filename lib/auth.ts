import { api } from './api';
import type {
  AgentResponseDto,
  AuthResponseDto,
  AuthUserDto,
  CreateAgentDto,
  LoginDto,
  RegisterUserDto,
} from '@/types';

const AUTH_TOKEN_KEY = 'sunrise_auth_token';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export const auth = {
  login: (data: LoginDto) => api.post<AuthResponseDto>('/v1/auth/login', data),
  register: (data: RegisterUserDto) => api.post<AuthResponseDto>('/v1/auth/register', data),
  me: (token: string) => api.get<AuthUserDto>('/v1/auth/me', token),
};

// Admin-only agent management
export const authAdmin = {
  createAgent: (data: CreateAgentDto, token: string) =>
    api.post<AgentResponseDto>('/v1/auth/agents', data, token),
  suspendAgent: (id: string, token: string) =>
    api.patch<AgentResponseDto>(`/v1/auth/agents/${id}/suspend`, {}, token),
  reactivateAgent: (id: string, token: string) =>
    api.patch<AgentResponseDto>(`/v1/auth/agents/${id}/reactivate`, {}, token),
};
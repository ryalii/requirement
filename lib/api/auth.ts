import { client, ApiError } from './client';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    realName: string;
  };
}

interface UserInfo {
  id: number;
  email: string;
  realName: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await client.post<LoginResponse>('/auth/login', { email, password });
  localStorage.setItem('token', data.token);
  return data;
}

export async function getMe(): Promise<UserInfo> {
  return client.get<UserInfo>('/auth/me');
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function changePassword(oldPassword: string, newPassword: string) {
  return client.post<void>('/auth/change-password', { oldPassword, newPassword });
}

export function logout(): void {
  localStorage.removeItem('token');
  window.location.href = '/login';
}

export { ApiError };

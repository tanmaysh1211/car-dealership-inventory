import axios from 'axios';
import type { Filters, User, Vehicle } from './types';

export const TOKEN_KEY = 'cd_token';
export const USER_KEY = 'cd_user';

const http = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api' });

// Attach the JWT to every request.
http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the session expires mid-use, the AuthProvider registers a handler that logs the user out.
let onUnauthorized: () => void = () => {};
export const setUnauthorizedHandler = (fn: () => void) => { onUnauthorized = fn; };

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthCall = String(err.config?.url ?? '').startsWith('/auth/');
    if (err.response?.status === 401 && !isAuthCall) onUnauthorized();
    return Promise.reject(err);
  },
);

/** Turns any thrown error into a message a person can read. */
export function errorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return 'Cannot reach the server. Check that the API is running.';
    const { error, details } = err.response.data ?? {};
    if (Array.isArray(details) && details.length) return details.map((d: { message: string }) => d.message).join('. ');
    return error ?? 'Something went wrong. Try again.';
  }
  return 'Something went wrong. Try again.';
}

export type VehicleInput = Omit<Vehicle, 'id'>;

export const authApi = {
  register: (body: { name: string; email: string; password: string }) => http.post<{ user: User }>('/auth/register', body),
  login: (body: { email: string; password: string }) => http.post<{ token: string; user: User }>('/auth/login', body),
};

export const vehicleApi = {
  list: async () => (await http.get<{ vehicles: Vehicle[] }>('/vehicles')).data.vehicles,
  search: async (filters: Filters) => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v.trim() !== ''));
    return (await http.get<{ vehicles: Vehicle[] }>('/vehicles/search', { params })).data.vehicles;
  },
  create: async (body: VehicleInput) => (await http.post<{ vehicle: Vehicle }>('/vehicles', body)).data.vehicle,
  update: async (id: number, body: Partial<VehicleInput>) => (await http.put<{ vehicle: Vehicle }>(`/vehicles/${id}`, body)).data.vehicle,
  remove: async (id: number) => { await http.delete(`/vehicles/${id}`); },
  purchase: async (id: number) => (await http.post<{ vehicle: Vehicle }>(`/vehicles/${id}/purchase`)).data.vehicle,
  restock: async (id: number, amount: number) => (await http.post<{ vehicle: Vehicle }>(`/vehicles/${id}/restock`, { amount })).data.vehicle,
};

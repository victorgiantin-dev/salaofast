export type UserRole = 'admin' | 'employee' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  specialty?: string; // Only for employees (e.g., 'Cabelereiro Master', 'Colorista')
  avatar?: string;
  createdAt: string;
}

export type ServiceCategory = 'todos' | 'cabelo' | 'barba' | 'coloracao' | 'estetica' | 'unhas';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  price: number;
  durationMinutes: number;
  image: string;
  popular?: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  volume: string;
  image: string;
  inStock: boolean;
}

export type AppointmentStatus =
  | 'confirmed'
  | 'pending'
  | 'cancellation_requested'
  | 'cancelled'
  | 'completed';

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  employeeId: string;
  employeeName: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
}

export interface BlockedSlot {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  reason: string;
  createdAt: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastTested?: string;
}

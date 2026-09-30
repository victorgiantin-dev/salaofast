import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Service,
  Product,
  Appointment,
  BlockedSlot,
  SupabaseConfig,
  AppointmentStatus,
} from '../types';
import {
  INITIAL_SERVICES,
  INITIAL_PRODUCTS,
  INITIAL_USERS,
  INITIAL_APPOINTMENTS,
  INITIAL_BLOCKED_SLOTS,
} from '../data/initialData';
import {
  getSupabaseClient,
  testSupabaseConnection,
} from '../lib/supabase';

interface SalonContextType {
  currentUser: User | null;
  users: User[];
  services: Service[];
  products: Product[];
  appointments: Appointment[];
  blockedSlots: BlockedSlot[];
  supabaseConfig: SupabaseConfig;
  activeView: 'home' | 'my-appointments' | 'staff-dashboard' | 'admin-dashboard';
  setActiveView: (view: 'home' | 'my-appointments' | 'staff-dashboard' | 'admin-dashboard') => void;
  // Auth
  login: (email: string, password?: string) => { success: boolean; message: string };
  logout: () => void;
  registerClient: (name: string, email: string, phone: string, password?: string) => { success: boolean; message: string };
  createEmployee: (data: { name: string; email: string; phone: string; specialty: string; password?: string }) => { success: boolean; message: string };
  resetPassword: (email: string) => { success: boolean; message: string };
  // Appointments
  createAppointment: (data: {
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    employeeId: string;
    serviceId: string;
    date: string;
    time: string;
    notes?: string;
  }) => { success: boolean; appointment?: Appointment; message: string };
  requestCancellation: (appointmentId: string, reason: string) => { success: boolean; message: string };
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => void;
  // Employee Blocks
  addBlockedSlot: (data: {
    employeeId: string;
    date: string;
    startTime: string;
    endTime: string;
    reason: string;
  }) => { success: boolean; message: string };
  removeBlockedSlot: (id: string) => void;
  // Slot Checking
  isSlotAvailable: (employeeId: string, date: string, time: string, durationMinutes: number) => boolean;
  getAvailableTimesForDay: (employeeId: string, date: string, durationMinutes: number) => string[];
  // Supabase
  saveSupabaseConfig: (url: string, anonKey: string) => Promise<{ success: boolean; message: string }>;
  syncWithSupabase: () => Promise<void>;
  // UI helpers
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: () => void;
}

const SalonContext = createContext<SalonContextType | undefined>(undefined);

export const SalonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local persistent state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fast_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('fast_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [services] = useState<Service[]>(INITIAL_SERVICES);
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('fast_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>(() => {
    const saved = localStorage.getItem('fast_blocked_slots');
    return saved ? JSON.parse(saved) : INITIAL_BLOCKED_SLOTS;
  });

  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => {
    const saved = localStorage.getItem('fast_supabase_config');
    return saved
      ? JSON.parse(saved)
      : { url: '', anonKey: '', isConnected: false };
  });

  const [activeView, setActiveView] = useState<'home' | 'my-appointments' | 'staff-dashboard' | 'admin-dashboard'>('home');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const dismissToast = () => {
    setToast(null);
  };

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('fast_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('fast_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('fast_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('fast_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('fast_blocked_slots', JSON.stringify(blockedSlots));
  }, [blockedSlots]);

  useEffect(() => {
    localStorage.setItem('fast_supabase_config', JSON.stringify(supabaseConfig));
  }, [supabaseConfig]);

  // Try initial Supabase sync if config is present
  useEffect(() => {
    if (supabaseConfig.url && supabaseConfig.anonKey && supabaseConfig.isConnected) {
      syncWithSupabase();
    }
  }, []);

  // Supabase sync routine
  const syncWithSupabase = async () => {
    const client = getSupabaseClient(supabaseConfig.url, supabaseConfig.anonKey);
    if (!client) return;

    try {
      // 1. Fetch appointments
      const { data: aptData, error: aptErr } = await client.from('appointments').select('*');
      if (!aptErr && aptData && aptData.length > 0) {
        const mappedApts: Appointment[] = aptData.map((item: any) => ({
          id: item.id,
          clientId: item.client_id,
          clientName: item.client_name,
          clientPhone: item.client_phone || '',
          clientEmail: item.client_email || '',
          employeeId: item.employee_id,
          employeeName: item.employee_name,
          serviceId: item.service_id,
          serviceName: item.service_name,
          servicePrice: Number(item.service_price || 0),
          date: item.date,
          time: item.time,
          durationMinutes: item.duration_minutes || 45,
          status: item.status || 'confirmed',
          notes: item.notes || '',
          cancellationReason: item.cancellation_reason,
          createdAt: item.created_at,
        }));
        setAppointments(prev => {
          // Merge remote with local unique IDs
          const existingIds = new Set(mappedApts.map(a => a.id));
          const localRemaining = prev.filter(p => !existingIds.has(p.id));
          return [...mappedApts, ...localRemaining];
        });
      }

      // 2. Fetch blocked slots
      const { data: blkData, error: blkErr } = await client.from('blocked_slots').select('*');
      if (!blkErr && blkData && blkData.length > 0) {
        const mappedBlocks: BlockedSlot[] = blkData.map((item: any) => ({
          id: item.id,
          employeeId: item.employee_id,
          employeeName: item.employee_name,
          date: item.date,
          startTime: item.start_time,
          endTime: item.end_time,
          reason: item.reason,
          createdAt: item.created_at,
        }));
        setBlockedSlots(prev => {
          const existingIds = new Set(mappedBlocks.map(b => b.id));
          const localRemaining = prev.filter(p => !existingIds.has(p.id));
          return [...mappedBlocks, ...localRemaining];
        });
      }
    } catch (e) {
      console.warn('Supabase sync skipped (tables might not exist yet):', e);
    }
  };

  const saveSupabaseConfig = async (url: string, anonKey: string) => {
    const testResult = await testSupabaseConnection(url, anonKey);
    const updated: SupabaseConfig = {
      url: url.trim(),
      anonKey: anonKey.trim(),
      isConnected: testResult.success,
      lastTested: new Date().toLocaleTimeString('pt-BR'),
    };
    setSupabaseConfig(updated);

    if (testResult.success) {
      showToast('Conexão com o Supabase validada e salva!', 'success');
      syncWithSupabase();
    } else {
      showToast(testResult.message, 'error');
    }

    return testResult;
  };

  // Auth methods
  const login = (email: string, _password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      return { success: false, message: 'Usuário não encontrado com este e-mail. Verifique a digitação ou crie sua conta.' };
    }

    setCurrentUser(found);
    if (found.role === 'admin') {
      setActiveView('admin-dashboard');
      showToast(`Bem-vindo, Administrador(a) ${found.name}!`, 'success');
    } else if (found.role === 'employee') {
      setActiveView('staff-dashboard');
      showToast(`Bem-vindo(a), ${found.name}! Sua agenda está pronta.`, 'success');
    } else {
      setActiveView('my-appointments');
      showToast(`Bem-vindo(a), ${found.name}!`, 'success');
    }

    return { success: true, message: 'Login realizado com sucesso.' };
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveView('home');
    showToast('Você saiu com sucesso.', 'info');
  };

  const registerClient = (name: string, email: string, phone: string, _password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const exists = users.some(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, message: 'Já existe um cadastro com este e-mail.' };
    }

    const newUser: User = {
      id: `usr-cli-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      role: 'client',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setActiveView('my-appointments');
    showToast(`Conta criada com sucesso! Bem-vindo(a), ${newUser.name}.`, 'success');

    // Optionally push to Supabase if connected
    const client = getSupabaseClient(supabaseConfig.url, supabaseConfig.anonKey);
    if (client) {
      client.from('profiles').insert([
        {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone,
        },
      ]).then();
    }

    return { success: true, message: 'Cadastro realizado com sucesso.' };
  };

  // Only Admin can create employee profile
  const createEmployee = (data: { name: string; email: string; phone: string; specialty: string }) => {
    if (currentUser?.role !== 'admin') {
      return { success: false, message: 'Apenas administradores podem cadastrar novos funcionários.' };
    }

    const cleanEmail = data.email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Já existe um usuário cadastrado com este e-mail.' };
    }

    const newEmp: User = {
      id: `usr-emp-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      phone: data.phone.trim(),
      specialty: data.specialty.trim(),
      role: 'employee',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setUsers(prev => [...prev, newEmp]);
    showToast(`Profissional ${newEmp.name} cadastrado(a) com sucesso!`, 'success');

    // Sync to Supabase
    const client = getSupabaseClient(supabaseConfig.url, supabaseConfig.anonKey);
    if (client) {
      client.from('profiles').insert([
        {
          id: newEmp.id,
          name: newEmp.name,
          email: newEmp.email,
          role: newEmp.role,
          phone: newEmp.phone,
          specialty: newEmp.specialty,
        },
      ]).then();
    }

    return { success: true, message: 'Profissional adicionado à equipe.' };
  };

  const resetPassword = (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, message: 'E-mail não localizado na base de dados.' };
    }

    return {
      success: true,
      message: `Link de redefinição de senha enviado para ${email}. Verifique sua caixa de entrada e spam.`,
    };
  };

  // Availability checking
  const timeToMinutes = (t: string): number => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const isSlotAvailable = (
    employeeId: string,
    date: string,
    time: string,
    durationMinutes: number
  ): boolean => {
    const startMins = timeToMinutes(time);
    const endMins = startMins + durationMinutes;

    // Check salon opening hours (09:00 - 20:00)
    if (startMins < 9 * 60 || endMins > 20 * 60) {
      return false;
    }

    // 1. Check employee blocked slots
    const employeeBlocks = blockedSlots.filter(
      b => b.employeeId === employeeId && b.date === date
    );
    for (const b of employeeBlocks) {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      // Overlap condition
      if (startMins < bEnd && endMins > bStart) {
        return false;
      }
    }

    // 2. Check existing active appointments for that employee
    const activeAppointments = appointments.filter(
      a =>
        a.employeeId === employeeId &&
        a.date === date &&
        a.status !== 'cancelled'
    );
    for (const apt of activeAppointments) {
      const aStart = timeToMinutes(apt.time);
      const aEnd = aStart + apt.durationMinutes;
      if (startMins < aEnd && endMins > aStart) {
        return false;
      }
    }

    return true;
  };

  const getAvailableTimesForDay = (
    employeeId: string,
    date: string,
    durationMinutes: number
  ): string[] => {
    const times: string[] = [];
    // From 09:00 to 19:00 in 30 minute steps
    for (let h = 9; h <= 19; h++) {
      for (const m of [0, 30]) {
        if (h === 19 && m > 30) continue;
        const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        if (isSlotAvailable(employeeId, date, timeStr, durationMinutes)) {
          times.push(timeStr);
        }
      }
    }
    return times;
  };

  // Appointment creation
  const createAppointment = (data: {
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    employeeId: string;
    serviceId: string;
    date: string;
    time: string;
    notes?: string;
  }) => {
    const service = services.find(s => s.id === data.serviceId);
    if (!service) {
      return { success: false, message: 'Serviço selecionado inválido.' };
    }

    // Identify employee
    let employee = users.find(u => u.id === data.employeeId && u.role === 'employee');
    if (!employee) {
      // If "any available", find first available employee
      const employees = users.filter(u => u.role === 'employee');
      const found = employees.find(emp =>
        isSlotAvailable(emp.id, data.date, data.time, service.durationMinutes)
      );
      if (found) {
        employee = found;
      } else {
        return {
          success: false,
          message: 'Nenhum profissional disponível para o horário e data escolhidos.',
        };
      }
    } else {
      if (!isSlotAvailable(employee.id, data.date, data.time, service.durationMinutes)) {
        return {
          success: false,
          message: `O horário ${data.time} não está mais disponível para ${employee.name}. Por favor, escolha outro horário.`,
        };
      }
    }

    // Determine client id
    let clientId = currentUser?.id;
    if (!clientId) {
      // Search if user exists by email
      const existingUser = users.find(
        u => u.email.toLowerCase() === data.clientEmail.trim().toLowerCase()
      );
      if (existingUser) {
        clientId = existingUser.id;
      } else {
        // Create quick client record
        const newClient: User = {
          id: `usr-cli-${Date.now()}`,
          name: data.clientName.trim(),
          email: data.clientEmail.trim().toLowerCase(),
          phone: data.clientPhone.trim(),
          role: 'client',
          createdAt: new Date().toISOString().split('T')[0],
        };
        setUsers(prev => [...prev, newClient]);
        clientId = newClient.id;
      }
    }

    const newAppointment: Appointment = {
      id: `apt-${Date.now().toString(36).toUpperCase()}`,
      clientId,
      clientName: data.clientName.trim(),
      clientPhone: data.clientPhone.trim(),
      clientEmail: data.clientEmail.trim().toLowerCase(),
      employeeId: employee.id,
      employeeName: employee.name,
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      date: data.date,
      time: data.time,
      durationMinutes: service.durationMinutes,
      status: 'confirmed',
      notes: data.notes?.trim() || '',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setAppointments(prev => [newAppointment, ...prev]);
    showToast(`Agendamento confirmado para ${data.date} às ${data.time}!`, 'success');

    // Sync to Supabase
    const client = getSupabaseClient(supabaseConfig.url, supabaseConfig.anonKey);
    if (client) {
      client.from('appointments').insert([
        {
          id: newAppointment.id,
          client_id: newAppointment.clientId,
          client_name: newAppointment.clientName,
          client_phone: newAppointment.clientPhone,
          client_email: newAppointment.clientEmail,
          employee_id: newAppointment.employeeId,
          employee_name: newAppointment.employeeName,
          service_id: newAppointment.serviceId,
          service_name: newAppointment.serviceName,
          service_price: newAppointment.servicePrice,
          date: newAppointment.date,
          time: newAppointment.time,
          duration_minutes: newAppointment.durationMinutes,
          status: newAppointment.status,
          notes: newAppointment.notes,
        },
      ]).then();
    }

    return {
      success: true,
      appointment: newAppointment,
      message: 'Agendamento registrado com sucesso!',
    };
  };

  // Client requests cancellation
  const requestCancellation = (appointmentId: string, reason: string) => {
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) {
      return { success: false, message: 'Agendamento não encontrado.' };
    }

    // Security check: if currentUser is client, ensure they own the appointment
    if (currentUser?.role === 'client' && apt.clientId !== currentUser.id && apt.clientEmail.toLowerCase() !== currentUser.email.toLowerCase()) {
      return { success: false, message: 'Acesso negado: você só pode gerenciar seus próprios agendamentos.' };
    }

    setAppointments(prev =>
      prev.map(a =>
        a.id === appointmentId
          ? {
              ...a,
              status: 'cancellation_requested',
              cancellationReason: reason || 'Cancelamento solicitado pelo cliente via portal.',
            }
          : a
      )
    );

    showToast('Solicitação de cancelamento enviada ao Salão Fast.', 'info');

    // Sync to Supabase
    const client = getSupabaseClient(supabaseConfig.url, supabaseConfig.anonKey);
    if (client) {
      client
        .from('appointments')
        .update({
          status: 'cancellation_requested',
          cancellation_reason: reason || 'Cancelamento solicitado pelo cliente.',
        })
        .eq('id', appointmentId)
        .then();
    }

    return { success: true, message: 'Cancelamento solicitado com sucesso.' };
  };

  const updateAppointmentStatus = (appointmentId: string, status: AppointmentStatus) => {
    setAppointments(prev =>
      prev.map(a => (a.id === appointmentId ? { ...a, status } : a))
    );
    showToast(`Status do agendamento atualizado para: ${status}`, 'success');

    const client = getSupabaseClient(supabaseConfig.url, supabaseConfig.anonKey);
    if (client) {
      client.from('appointments').update({ status }).eq('id', appointmentId).then();
    }
  };

  // Blocked slots for employees
  const addBlockedSlot = (data: {
    employeeId: string;
    date: string;
    startTime: string;
    endTime: string;
    reason: string;
  }) => {
    // Permission check: only admin or the employee themselves can block their schedule
    if (
      currentUser?.role !== 'admin' &&
      currentUser?.id !== data.employeeId
    ) {
      return { success: false, message: 'Permissão negada para alterar horários de outro profissional.' };
    }

    const employee = users.find(u => u.id === data.employeeId);
    const newBlock: BlockedSlot = {
      id: `blk-${Date.now()}`,
      employeeId: data.employeeId,
      employeeName: employee?.name || 'Profissional',
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      reason: data.reason.trim() || 'Bloqueio de Agenda',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setBlockedSlots(prev => [newBlock, ...prev]);
    showToast(`Horário bloqueado com sucesso (${data.startTime} às ${data.endTime})!`, 'success');

    // Sync to Supabase
    const client = getSupabaseClient(supabaseConfig.url, supabaseConfig.anonKey);
    if (client) {
      client.from('blocked_slots').insert([
        {
          id: newBlock.id,
          employee_id: newBlock.employeeId,
          employee_name: newBlock.employeeName,
          date: newBlock.date,
          start_time: newBlock.startTime,
          end_time: newBlock.endTime,
          reason: newBlock.reason,
        },
      ]).then();
    }

    return { success: true, message: 'Horário bloqueado com sucesso.' };
  };

  const removeBlockedSlot = (id: string) => {
    const block = blockedSlots.find(b => b.id === id);
    if (
      currentUser?.role !== 'admin' &&
      currentUser?.id !== block?.employeeId
    ) {
      showToast('Permissão negada.', 'error');
      return;
    }

    setBlockedSlots(prev => prev.filter(b => b.id !== id));
    showToast('Bloqueio de horário removido.', 'info');

    const client = getSupabaseClient(supabaseConfig.url, supabaseConfig.anonKey);
    if (client) {
      client.from('blocked_slots').delete().eq('id', id).then();
    }
  };

  return (
    <SalonContext.Provider
      value={{
        currentUser,
        users,
        services,
        products,
        appointments,
        blockedSlots,
        supabaseConfig,
        activeView,
        setActiveView,
        login,
        logout,
        registerClient,
        createEmployee,
        resetPassword,
        createAppointment,
        requestCancellation,
        updateAppointmentStatus,
        addBlockedSlot,
        removeBlockedSlot,
        isSlotAvailable,
        getAvailableTimesForDay,
        saveSupabaseConfig,
        syncWithSupabase,
        toast,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </SalonContext.Provider>
  );
};

export const useSalon = () => {
  const context = useContext(SalonContext);
  if (!context) {
    throw new Error('useSalon must be used within a SalonProvider');
  }
  return context;
};

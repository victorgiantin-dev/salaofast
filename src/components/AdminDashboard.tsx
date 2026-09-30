import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import {
  ShieldCheck,
  Users,
  Calendar,
  UserPlus,
  Database,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { AppointmentStatus } from '../types';
import { SUPABASE_SQL_SCHEMA } from '../lib/supabase';

interface AdminDashboardProps {
  onBackToHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToHome }) => {
  const {
    currentUser,
    users,
    appointments,
    createEmployee,
    updateAppointmentStatus,
    supabaseConfig,
    saveSupabaseConfig,
    syncWithSupabase,
    showToast,
  } = useSalon();

  const [activeTab, setActiveTab] = useState<
    'agendas' | 'usuarios' | 'novo-funcionario' | 'supabase'
  >('agendas');

  // Agenda filter
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // New Employee Form
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empSpecialty, setEmpSpecialty] = useState('Cabeleireiro Master & Visagista');

  // Supabase connection form
  const [sbUrl, setSbUrl] = useState(supabaseConfig.url || '');
  const [sbKey, setSbKey] = useState(supabaseConfig.anonKey || '');
  const [isTestingSb, setIsTestingSb] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Security Check: ONLY ADMIN CAN ACCESS
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-zinc-950">Acesso Restrito ao Administrador</h3>
        <p className="text-zinc-600 text-sm mt-1">
          Apenas administradores autorizados do Salão Fast podem visualizar usuários, agendas de funcionários e configurações do banco de dados Supabase.
        </p>
        <button
          onClick={onBackToHome}
          className="mt-4 px-4 py-2 bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs cursor-pointer"
        >
          Voltar para o Início
        </button>
      </div>
    );
  }

  const employees = users.filter((u) => u.role === 'employee');
  const clients = users.filter((u) => u.role === 'client');

  // Filtered appointments
  const filteredAppointments = appointments.filter((apt) => {
    if (selectedEmployeeFilter !== 'all' && apt.employeeId !== selectedEmployeeFilter) {
      return false;
    }
    if (statusFilter !== 'all' && apt.status !== statusFilter) {
      return false;
    }
    return true;
  });

  // Metrics
  const totalRevenue = appointments
    .filter((a) => a.status === 'confirmed' || a.status === 'completed')
    .reduce((acc, curr) => acc + curr.servicePrice, 0);

  const pendingCancellations = appointments.filter(
    (a) => a.status === 'cancellation_requested'
  ).length;

  const handleCreateEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim() || !empEmail.trim() || !empPhone.trim()) {
      showToast('Preencha todos os campos do funcionário.', 'error');
      return;
    }

    const res = createEmployee({
      name: empName,
      email: empEmail,
      phone: empPhone,
      specialty: empSpecialty,
    });

    if (res.success) {
      setEmpName('');
      setEmpEmail('');
      setEmpPhone('');
      setActiveTab('usuarios');
    }
  };

  const handleSaveSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sbUrl.trim() || !sbKey.trim()) {
      showToast('Preencha a URL e a Chave Anon do Supabase.', 'error');
      return;
    }

    setIsTestingSb(true);
    const result = await saveSupabaseConfig(sbUrl, sbKey);
    setIsTestingSb(false);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    showToast('Script SQL do Supabase copiado para a área de transferência!', 'success');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-200">
        <div>
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-950 mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o Salão Fast
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-zinc-950 font-extrabold text-xl flex items-center justify-center shadow">
              👑
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-zinc-950">
                Painel Administrativo Salão Fast
              </h2>
              <p className="text-zinc-600 text-xs sm:text-sm mt-0.5">
                Gestão central de funcionários, agenda de toda a equipe, clientes e banco de dados Supabase.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-zinc-100 p-1.5 rounded-xl border border-zinc-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('agendas')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'agendas'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>Agenda da Equipe</span>
          </button>

          <button
            onClick={() => setActiveTab('usuarios')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'usuarios'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <Users className="w-4 h-4 text-amber-500" />
            <span>Usuários ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('novo-funcionario')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'novo-funcionario'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <UserPlus className="w-4 h-4 text-amber-500" />
            <span>Criar Funcionário</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'supabase'
                ? 'bg-zinc-950 text-amber-400 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Conexão Supabase</span>
            {supabaseConfig.isConnected && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
          <div className="text-xs font-semibold text-zinc-500 uppercase">Agendamentos Totais</div>
          <div className="text-2xl font-extrabold text-zinc-950 tabular-nums mt-1">
            {appointments.length}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Atualizado em tempo real</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
          <div className="text-xs font-semibold text-zinc-500 uppercase">Receita Estimada</div>
          <div className="text-2xl font-extrabold text-zinc-950 tabular-nums mt-1">
            R$ {totalRevenue.toFixed(2).replace('.', ',')}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Confirmados e concluídos</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
          <div className="text-xs font-semibold text-zinc-500 uppercase">Equipe de Profissionais</div>
          <div className="text-2xl font-extrabold text-zinc-950 tabular-nums mt-1">
            {employees.length}
          </div>
          <div className="text-[11px] text-amber-600 mt-1 font-semibold">Exclusivo Admin</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
          <div className="text-xs font-semibold text-zinc-500 uppercase">Cancelamentos Pendentes</div>
          <div className="text-2xl font-extrabold text-orange-600 tabular-nums mt-1">
            {pendingCancellations}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Requerem confirmação</div>
        </div>
      </div>

      {/* TAB 1: AGENDA DE TODOS OS FUNCIONÁRIOS */}
      {activeTab === 'agendas' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-xs font-bold text-zinc-700 whitespace-nowrap">
                Filtrar Profissional:
              </label>
              <select
                value={selectedEmployeeFilter}
                onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
                className="p-2 text-xs font-medium rounded-lg border border-zinc-300 bg-white focus:border-amber-500"
              >
                <option value="all">Todos os Profissionais ({employees.length})</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.specialty})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-xs font-bold text-zinc-700 whitespace-nowrap">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 text-xs font-medium rounded-lg border border-zinc-300 bg-white focus:border-amber-500"
              >
                <option value="all">Todos os Status</option>
                <option value="confirmed">Confirmados</option>
                <option value="pending">Pendentes</option>
                <option value="cancellation_requested">Cancelamento Solicitado</option>
                <option value="completed">Concluídos</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
          </div>

          {/* Appointments Table / List */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-100 text-zinc-700 font-bold uppercase text-[11px] border-b border-zinc-200">
                    <th className="p-3.5">Código</th>
                    <th className="p-3.5">Cliente</th>
                    <th className="p-3.5">Profissional</th>
                    <th className="p-3.5">Serviço</th>
                    <th className="p-3.5">Data / Hora</th>
                    <th className="p-3.5">Valor</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-zinc-500">
                        Nenhum agendamento encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-zinc-50/75 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-zinc-900">
                          #{apt.id}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-zinc-900">{apt.clientName}</div>
                          <div className="text-[11px] text-zinc-500">{apt.clientPhone}</div>
                        </td>
                        <td className="p-3.5 font-semibold text-zinc-800">
                          {apt.employeeName}
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-zinc-900">{apt.serviceName}</span>
                          <span className="text-[11px] text-zinc-400 block">{apt.durationMinutes} min</span>
                        </td>
                        <td className="p-3.5 font-semibold text-zinc-900 tabular-nums">
                          {apt.date} às {apt.time}
                        </td>
                        <td className="p-3.5 font-extrabold text-zinc-950 tabular-nums">
                          R$ {apt.servicePrice.toFixed(2).replace('.', ',')}
                        </td>
                        <td className="p-3.5">
                          {apt.status === 'confirmed' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              Confirmado
                            </span>
                          )}
                          {apt.status === 'pending' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                              Pendente
                            </span>
                          )}
                          {apt.status === 'cancellation_requested' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-100 text-orange-800">
                              Pediu Cancelar
                            </span>
                          )}
                          {apt.status === 'completed' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
                              Concluído
                            </span>
                          )}
                          {apt.status === 'cancelled' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-100 text-zinc-500">
                              Cancelado
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                          {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                            <button
                              onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                              className="px-2 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 cursor-pointer"
                            >
                              Finalizar
                            </button>
                          )}
                          {apt.status !== 'cancelled' && (
                            <button
                              onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                              className="px-2 py-1 text-[11px] font-bold bg-red-50 text-red-700 hover:bg-red-100 rounded border border-red-200 cursor-pointer"
                            >
                              Cancelar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GERENCIAR USUÁRIOS (Clientes e Funcionários) */}
      {activeTab === 'usuarios' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-zinc-950">
                Base Geral de Usuários do Salão Fast
              </h3>
              <p className="text-xs text-zinc-500">
                Visível unicamente para o perfil Administrador conforme regras de privacidade.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('novo-funcionario')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar Novo Profissional</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-100 text-zinc-700 font-bold uppercase text-[11px] border-b border-zinc-200">
                  <th className="p-3.5">Nome</th>
                  <th className="p-3.5">E-mail</th>
                  <th className="p-3.5">Telefone</th>
                  <th className="p-3.5">Perfil / Função</th>
                  <th className="p-3.5">Data de Criação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="p-3.5 font-bold text-zinc-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-zinc-200 text-zinc-800 flex items-center justify-center text-xs font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="p-3.5 text-zinc-600">{u.email}</td>
                    <td className="p-3.5 text-zinc-600">{u.phone || '—'}</td>
                    <td className="p-3.5">
                      {u.role === 'admin' && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          👑 Administrador
                        </span>
                      )}
                      {u.role === 'employee' && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-900 text-amber-400">
                          ✂️ {u.specialty || 'Funcionário'}
                        </span>
                      )}
                      {u.role === 'client' && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-700">
                          👤 Cliente
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-zinc-500 tabular-nums">{u.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CRIAR NOVO FUNCIONÁRIO (Exclusivo Admin) */}
      {activeTab === 'novo-funcionario' && (
        <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">
            <UserPlus className="w-4 h-4" />
            Exclusivo Administrador
          </div>
          <h3 className="font-display text-2xl font-bold text-zinc-950">
            Cadastrar Novo Perfil de Funcionário
          </h3>
          <p className="text-xs text-zinc-600 mt-1 mb-6">
            Conforme as regras do salão, novos funcionários só podem ser criados pelo Administrador. Ao criar o perfil, o profissional poderá efetuar login com o e-mail cadastrado e gerenciar sua agenda.
          </p>

          <form onSubmit={handleCreateEmployeeSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Nome Completo do Profissional *
              </label>
              <input
                type="text"
                value={empName}
                onChange={(e) => setEmpName(e.target.value)}
                placeholder="Ex: Gabriel Santoro"
                className="w-full p-2.5 text-xs rounded-xl border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                E-mail Profissional para Login *
              </label>
              <input
                type="email"
                value={empEmail}
                onChange={(e) => setEmpEmail(e.target.value)}
                placeholder="Ex: gabriel@saloofast.com.br"
                className="w-full p-2.5 text-xs rounded-xl border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Telefone / Celular de Atendimento *
              </label>
              <input
                type="tel"
                value={empPhone}
                onChange={(e) => setEmpPhone(e.target.value)}
                placeholder="Ex: (11) 99888-7766"
                className="w-full p-2.5 text-xs rounded-xl border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Função / Especialidade *
              </label>
              <select
                value={empSpecialty}
                onChange={(e) => setEmpSpecialty(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              >
                <option value="Cabeleireiro Master & Visagista">Cabeleireiro Master & Visagista</option>
                <option value="Colorista & Mechas">Colorista & Mechas</option>
                <option value="Barbeiro Visagista & Barboterapia">Barbeiro Visagista & Barboterapia</option>
                <option value="Manicure Spa & Nail Designer">Manicure Spa & Nail Designer</option>
                <option value="Terapeuta Capilar & Cronograma">Terapeuta Capilar & Cronograma</option>
                <option value="Esteticista Facial & Sobrancelhas">Esteticista Facial & Sobrancelhas</option>
              </select>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              <span className="font-bold">Nota de Acesso:</span> O funcionário poderá acessar a área restrita do sistema usando este e-mail.
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Criar Perfil do Funcionário
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: CONEXÃO SUPABASE (Exclusivo Admin) */}
      {activeTab === 'supabase' && (
        <div className="space-y-8 max-w-4xl mx-auto">
          {/* Status Box */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl font-bold text-zinc-950">
                  Status da Conexão Supabase
                </h3>
                {supabaseConfig.isConnected ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Conectado ao Supabase
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    Armazenamento Local Ativo (Aguardando Chave Supabase)
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {supabaseConfig.lastTested
                  ? `Último teste efetuado: ${supabaseConfig.lastTested}`
                  : 'Insira suas credenciais do projeto Supabase para habilitar sincronização em nuvem.'}
              </p>
            </div>

            <button
              onClick={syncWithSupabase}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-xl border border-zinc-200 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sincronizar Agora</span>
            </button>
          </div>

          {/* Form */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">
              <Database className="w-4 h-4" />
              Configurações de Banco de Dados
            </div>
            <h3 className="font-display text-lg font-bold text-zinc-950">
              Credenciais do Projeto Supabase
            </h3>
            <p className="text-xs text-zinc-600 mt-1 mb-6">
              Apenas o perfil Administrador tem visibilidade destas configurações. Você encontra estas credenciais no painel do Supabase em <strong>Settings &gt; API</strong>.
            </p>

            <form onSubmit={handleSaveSupabase} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Project URL (SUPABASE_URL) *
                </label>
                <input
                  type="url"
                  value={sbUrl}
                  onChange={(e) => setSbUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full p-2.5 text-xs font-mono rounded-xl border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  API Anon Key (SUPABASE_ANON_KEY) *
                </label>
                <input
                  type="password"
                  value={sbKey}
                  onChange={(e) => setSbKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full p-2.5 text-xs font-mono rounded-xl border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isTestingSb}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isTestingSb ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Testando Conexão com Supabase...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Salvar e Testar Conexão</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* DDL SQL Schema Helper */}
          <div className="bg-zinc-900 text-white p-6 rounded-2xl border border-zinc-800 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-display text-base font-bold text-amber-400">
                  Script SQL para Criação das Tabelas no Supabase
                </h4>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Copie o código abaixo e execute no <strong>SQL Editor</strong> do seu Supabase para criar as tabelas `profiles`, `appointments`, `blocked_slots` e `services`.
                </p>
              </div>

              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar SQL</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-64 scrollbar-thin">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import { Calendar, Clock, Ban, CheckCircle2, ArrowLeft, Plus, Trash2, AlertCircle, PlusCircle } from 'lucide-react';
import { AppointmentStatus } from '../types';
import { StaffBookingModal } from './StaffBookingModal';

interface StaffDashboardProps {
  onBackToHome: () => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ onBackToHome }) => {
  const {
    currentUser,
    appointments,
    blockedSlots,
    updateAppointmentStatus,
    addBlockedSlot,
    removeBlockedSlot,
    showToast,
  } = useSalon();

  const [activeTab, setActiveTab] = useState<'agenda' | 'bloqueios'>('agenda');
  const [dateFilter, setDateFilter] = useState<'today' | 'upcoming' | 'all'>('all');
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);

  // New blocked slot form state
  const [blockDate, setBlockDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [blockStart, setBlockStart] = useState('12:00');
  const [blockEnd, setBlockEnd] = useState('13:30');
  const [blockReason, setBlockReason] = useState('Horário de Almoço');

  if (!currentUser || (currentUser.role !== 'employee' && currentUser.role !== 'admin')) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-zinc-950">Acesso Restrito à Equipe</h3>
        <p className="text-zinc-600 text-sm mt-1">
          Faça login com sua conta de profissional cadastrada pelo administrador do salão.
        </p>
        <button
          onClick={onBackToHome}
          className="mt-4 px-4 py-2 bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs"
        >
          Voltar para o Início
        </button>
      </div>
    );
  }

  // PRIVACY: Employee ONLY sees their OWN appointments!
  const myAppointments = appointments.filter(
    (a) => a.employeeId === currentUser.id
  );

  // Filter by date
  const todayStr = new Date().toISOString().split('T')[0];
  const filteredAppointments = myAppointments.filter((a) => {
    if (dateFilter === 'today') return a.date === todayStr;
    if (dateFilter === 'upcoming') return a.date >= todayStr && a.status !== 'cancelled';
    return true;
  });

  // PRIVACY: Employee ONLY sees their OWN blocked slots!
  const myBlockedSlots = blockedSlots.filter(
    (b) => b.employeeId === currentUser.id
  );

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDate || !blockStart || !blockEnd) {
      showToast('Preencha a data e os horários de início e término.', 'error');
      return;
    }

    if (blockStart >= blockEnd) {
      showToast('O horário de término deve ser após o horário de início.', 'error');
      return;
    }

    const res = addBlockedSlot({
      employeeId: currentUser.id,
      date: blockDate,
      startTime: blockStart,
      endTime: blockEnd,
      reason: blockReason,
    });

    if (res.success) {
      setBlockReason('Horário de Almoço');
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Confirmado</span>;
      case 'pending':
        return <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Pendente</span>;
      case 'cancellation_requested':
        return <span className="text-[11px] font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded">Cancelamento Pedido</span>;
      case 'cancelled':
        return <span className="text-[11px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">Cancelado</span>;
      case 'completed':
        return <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">Atendido</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Top Banner with Employee Specialty */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-200">
        <div>
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-950 mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o Salão
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-amber-400 font-extrabold text-lg flex items-center justify-center shadow">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-zinc-950">
                Painel do Profissional
              </h2>
              <div className="flex items-center gap-2 text-xs text-zinc-600 mt-0.5">
                <span className="font-bold text-zinc-900">{currentUser.name}</span>
                <span>·</span>
                <span className="text-amber-600 font-semibold">{currentUser.specialty || 'Cabeleireiro'}</span>
                <span>·</span>
                <span className="text-zinc-500">{currentUser.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab switchers & Employee New Booking Button */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsNewBookingModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Cadastrar Agendamento</span>
          </button>

          <div className="flex items-center gap-1.5 bg-zinc-100 p-1.5 rounded-xl border border-zinc-200">
            <button
              onClick={() => setActiveTab('agenda')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'agenda'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>Minha Agenda ({myAppointments.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('bloqueios')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'bloqueios'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Ban className="w-4 h-4 text-amber-500" />
              <span>Bloquear Horários ({myBlockedSlots.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: AGENDA */}
      {activeTab === 'agenda' && (
        <div className="space-y-6">
          {/* Subfilter */}
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-zinc-950">
              Próximos Clientes Agendados
            </h3>
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setDateFilter('today')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  dateFilter === 'today' ? 'bg-white font-bold text-zinc-950 shadow-xs' : 'text-zinc-600'
                }`}
              >
                Hoje
              </button>
              <button
                onClick={() => setDateFilter('upcoming')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  dateFilter === 'upcoming' ? 'bg-white font-bold text-zinc-950 shadow-xs' : 'text-zinc-600'
                }`}
              >
                Próximos
              </button>
              <button
                onClick={() => setDateFilter('all')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  dateFilter === 'all' ? 'bg-white font-bold text-zinc-950 shadow-xs' : 'text-zinc-600'
                }`}
              >
                Todos
              </button>
            </div>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-zinc-200">
              <Calendar className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
              <p className="font-bold text-zinc-800 text-sm">Nenhum atendimento na sua agenda para o filtro selecionado.</p>
              <p className="text-xs text-zinc-500 mt-0.5">Use o botão "Cadastrar Agendamento" acima para adicionar clientes manualmente.</p>
              <button
                onClick={() => setIsNewBookingModalOpen(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                <span>Cadastrar Agendamento</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAppointments.map((apt) => {
                return (
                  <div
                    key={apt.id}
                    className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono font-bold text-zinc-500">#{apt.id}</span>
                        {getStatusBadge(apt.status)}
                      </div>

                      <h4 className="font-display text-base font-bold text-zinc-950">
                        {apt.serviceName}
                      </h4>

                      <div className="mt-2 space-y-1 text-xs text-zinc-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <strong className="text-zinc-900">{apt.date}</strong> às <strong className="text-zinc-900">{apt.time}</strong> ({apt.durationMinutes} min)
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400">Cliente:</span>
                          <strong className="text-zinc-900">{apt.clientName}</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400">Contato:</span>
                          <span className="font-semibold text-zinc-800">{apt.clientPhone}</span>
                        </div>
                        {apt.notes && (
                          <div className="mt-2 p-2 bg-zinc-50 rounded-lg text-zinc-700 border border-zinc-100">
                            <strong>Obs do Cliente:</strong> {apt.notes}
                          </div>
                        )}
                        {apt.cancellationReason && (
                          <div className="mt-2 p-2 bg-orange-50 text-orange-800 rounded-lg border border-orange-200">
                            <strong>Cancelamento Solicitado:</strong> {apt.cancellationReason}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                      <span className="text-sm font-extrabold text-zinc-950 tabular-nums">
                        R$ {apt.servicePrice.toFixed(2).replace('.', ',')}
                      </span>

                      <div className="flex items-center gap-2">
                        {apt.status === 'confirmed' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Finalizar Atendimento
                          </button>
                        )}
                        {apt.status === 'cancellation_requested' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                            className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors cursor-pointer"
                          >
                            Aceitar Cancelamento
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BLOQUEIOS DE HORÁRIO */}
      {activeTab === 'bloqueios' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: Add Block */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">
              <Ban className="w-4 h-4" />
              Bloquear Horário
            </div>
            <h3 className="font-display text-lg font-bold text-zinc-950">
              Indisponibilidade de Atendimento
            </h3>
            <p className="text-xs text-zinc-600 mt-1 mb-5">
              Bloqueie horários em que você não poderá atender clientes (almoço, consultas médicas, folgas, cursos técnicos). O sistema impedirá agendamentos nesses horários automaticamente.
            </p>

            <form onSubmit={handleCreateBlock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Data do Bloqueio *
                </label>
                <input
                  type="date"
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-2.5 text-xs font-medium rounded-xl border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Horário Início *
                  </label>
                  <input
                    type="time"
                    value={blockStart}
                    onChange={(e) => setBlockStart(e.target.value)}
                    className="w-full p-2.5 text-xs font-medium rounded-xl border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Horário Fim *
                  </label>
                  <input
                    type="time"
                    value={blockEnd}
                    onChange={(e) => setBlockEnd(e.target.value)}
                    className="w-full p-2.5 text-xs font-medium rounded-xl border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Motivo do Bloqueio *
                </label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full p-2.5 text-xs font-medium rounded-xl border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                >
                  <option value="Horário de Almoço">Horário de Almoço & Descanso</option>
                  <option value="Consulta Médica / Exame">Consulta Médica / Pessoal</option>
                  <option value="Curso de Aperfeiçoamento">Curso / Workshop Técnico</option>
                  <option value="Folga Programada">Folga Programada</option>
                  <option value="Manutenção de Equipamento">Manutenção de Equipamento / Bancada</option>
                  <option value="Outro Motivo">Outro Motivo</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Salvar Bloqueio na Minha Agenda</span>
              </button>
            </form>
          </div>

          {/* Right List: Active Blocks */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-display text-lg font-bold text-zinc-950 mb-2">
              Seus Bloqueios Ativos
            </h3>

            {myBlockedSlots.length === 0 ? (
              <div className="text-center py-12 bg-zinc-50 rounded-2xl border border-zinc-200 p-6">
                <Ban className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                <p className="font-bold text-zinc-800 text-sm">Você não possui nenhum horário bloqueado.</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Sua agenda está totalmente aberta para agendamentos nos horários de funcionamento do salão.
                </p>
              </div>
            ) : (
              myBlockedSlots.map((blk) => (
                <div
                  key={blk.id}
                  className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center justify-between shadow-xs hover:border-amber-400 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-zinc-950 flex items-center gap-2">
                        <span>{blk.date}</span>
                        <span className="text-amber-600 font-mono text-xs">
                          {blk.startTime} às {blk.endTime}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{blk.reason}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => removeBlockedSlot(blk.id)}
                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Remover bloqueio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Staff Booking Modal */}
      <StaffBookingModal
        isOpen={isNewBookingModalOpen}
        onClose={() => setIsNewBookingModalOpen(false)}
      />
    </div>
  );
};

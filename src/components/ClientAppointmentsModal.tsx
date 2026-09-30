import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import { Calendar, Clock, AlertTriangle, CheckCircle, XCircle, Search, ArrowLeft } from 'lucide-react';

interface ClientAppointmentsModalProps {
  onOpenBooking: () => void;
  onOpenAuth: () => void;
  onBackToHome: () => void;
}

export const ClientAppointmentsModal: React.FC<ClientAppointmentsModalProps> = ({
  onOpenBooking,
  onOpenAuth,
  onBackToHome,
}) => {
  const {
    currentUser,
    appointments,
    requestCancellation,
    showToast,
  } = useSalon();

  // Search by email/phone if guest (not logged in)
  const [lookupEmail, setLookupEmail] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Cancellation modal state
  const [cancellingAptId, setCancellingAptId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // FILTER STRICTLY: Client ONLY sees their OWN appointments
  const clientAppointments = currentUser?.role === 'client'
    ? appointments.filter(
        (a) =>
          a.clientId === currentUser.id ||
          a.clientEmail.toLowerCase() === currentUser.email.toLowerCase()
      )
    : hasSearched && lookupEmail.trim()
    ? appointments.filter(
        (a) =>
          a.clientEmail.toLowerCase() === lookupEmail.trim().toLowerCase() ||
          a.clientPhone.replace(/\D/g, '') === lookupEmail.replace(/\D/g, '')
      )
    : [];

  const handleConfirmCancellation = () => {
    if (!cancellingAptId) return;
    const res = requestCancellation(cancellingAptId, cancelReason);
    if (res.success) {
      setCancellingAptId(null);
      setCancelReason('');
    } else {
      showToast(res.message, 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Confirmado
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Pendente de Confirmação
          </span>
        );
      case 'cancellation_requested':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-800 bg-orange-100 px-2.5 py-1 rounded-md">
            <AlertTriangle className="w-3.5 h-3.5" />
            Cancelamento Solicitado
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md">
            <XCircle className="w-3.5 h-3.5 text-zinc-400" />
            Cancelado
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-800 bg-blue-100 px-2.5 py-1 rounded-md">
            <CheckCircle className="w-3.5 h-3.5" />
            Concluído
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header and Back button */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-200">
        <div>
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-950 mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para a Página Inicial
          </button>
          <h2 className="font-display text-3xl font-extrabold text-zinc-950">
            Meus Agendamentos
          </h2>
          <p className="text-zinc-600 text-xs sm:text-sm mt-1">
            Consulte seus horários marcados no Salão Fast e solicite cancelamentos com rapidez.
          </p>
        </div>

        <button
          onClick={onOpenBooking}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>Novo Agendamento</span>
        </button>
      </div>

      {/* Guest lookup if not logged in */}
      {!currentUser && (
        <div className="mb-8 p-5 bg-zinc-50 rounded-2xl border border-zinc-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left w-full sm:w-auto">
              <h3 className="font-bold text-sm text-zinc-900">
                Você não está conectado a uma conta
              </h3>
              <p className="text-xs text-zinc-600 mt-0.5">
                Faça login para acesso automático ou busque digitando seu e-mail/celular abaixo.
              </p>
            </div>
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
            >
              Fazer Login / Criar Conta
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setHasSearched(true);
            }}
            className="mt-4 flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="text"
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
                placeholder="Digite seu e-mail ou telefone cadastrado no agendamento..."
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-zinc-300 bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              Buscar
            </button>
          </form>
        </div>
      )}

      {/* Appointments List */}
      <div className="space-y-4">
        {clientAppointments.length === 0 ? (
          <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-zinc-200 p-8">
            <div className="w-14 h-14 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto mb-3 text-zinc-400">
              <Calendar className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-base text-zinc-900">
              Nenhum agendamento encontrado
            </h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              {!currentUser && !hasSearched
                ? 'Digite seu e-mail acima para localizar seus agendamentos ou agende um novo horário.'
                : 'Você ainda não possui horários agendados com esses dados no Salão Fast.'}
            </p>
            <button
              onClick={onOpenBooking}
              className="mt-5 px-5 py-2.5 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Agendar Meu Horário Agora
            </button>
          </div>
        ) : (
          clientAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm hover:shadow transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left: Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-zinc-500">
                    #{apt.id}
                  </span>
                  {getStatusBadge(apt.status)}
                </div>

                <div>
                  <h3 className="font-display text-lg font-bold text-zinc-950">
                    {apt.serviceName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-zinc-600 mt-1">
                    <span className="flex items-center gap-1 font-semibold text-zinc-900">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      {apt.date}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-semibold text-zinc-900">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {apt.time} ({apt.durationMinutes} min)
                    </span>
                    <span>·</span>
                    <span>Profissional: <strong className="text-zinc-800">{apt.employeeName}</strong></span>
                  </div>
                </div>

                {apt.notes && (
                  <p className="text-xs text-zinc-500 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                    <strong className="text-zinc-700">Obs:</strong> {apt.notes}
                  </p>
                )}

                {apt.cancellationReason && (
                  <p className="text-xs text-orange-700 bg-orange-50 p-2 rounded-lg border border-orange-200">
                    <strong className="font-bold">Motivo do cancelamento:</strong> {apt.cancellationReason}
                  </p>
                )}
              </div>

              {/* Right: Price & Cancel Action */}
              <div className="flex md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-100">
                <div className="text-left md:text-right">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Valor</span>
                  <span className="text-lg font-extrabold text-zinc-950 tabular-nums">
                    R$ {apt.servicePrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {apt.status !== 'cancelled' && apt.status !== 'completed' && apt.status !== 'cancellation_requested' && (
                  <button
                    onClick={() => {
                      setCancellingAptId(apt.id);
                      setCancelReason('');
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors cursor-pointer"
                  >
                    Pedir para Cancelar
                  </button>
                )}

                {apt.status === 'cancellation_requested' && (
                  <span className="text-[11px] text-orange-600 font-medium">
                    Aguardando análise da equipe
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cancellation Confirmation Dialog */}
      {cancellingAptId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-md p-6">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-display text-xl font-bold text-zinc-950 text-center">
              Solicitar Cancelamento
            </h3>
            <p className="text-xs text-zinc-600 text-center mt-1">
              Tem certeza que deseja solicitar o cancelamento deste agendamento no Salão Fast?
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Motivo (opcional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ex: Imprevisto no trabalho, necessito remarcar..."
                rows={2}
                className="w-full p-2.5 text-xs rounded-xl border border-zinc-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 resize-none"
              />
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setCancellingAptId(null)}
                className="flex-1 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
              >
                Manter Agendamento
              </button>
              <button
                type="button"
                onClick={handleConfirmCancellation}
                className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

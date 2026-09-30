import React, { useState, useEffect } from 'react';
import { useSalon } from '../context/SalonContext';
import { Service } from '../types';
import { X, Calendar, Clock, Check, AlertCircle, PlusCircle, User, Phone, Mail, FileText } from 'lucide-react';

interface StaffBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StaffBookingModal: React.FC<StaffBookingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentUser,
    services,
    createAppointment,
    getAvailableTimesForDay,
    showToast,
  } = useSalon();

  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
      if (services.length > 0 && !selectedServiceId) {
        setSelectedServiceId(services[0].id);
      }
      setSelectedTime('');
      setClientName('');
      setClientPhone('');
      setClientEmail('');
      setNotes('');
    }
  }, [isOpen, services]);

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];

  // Calculate available times for the current employee
  useEffect(() => {
    if (currentUser && selectedService && selectedDate) {
      const times = getAvailableTimesForDay(currentUser.id, selectedDate, selectedService.durationMinutes);
      setAvailableTimes(times);
      if (selectedTime && !times.includes(selectedTime)) {
        setSelectedTime('');
      }
    }
  }, [currentUser, selectedService, selectedDate]);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      showToast('Por favor, informe o nome do cliente.', 'error');
      return;
    }

    if (!clientPhone.trim()) {
      showToast('Por favor, informe o telefone de contato do cliente.', 'error');
      return;
    }

    if (!selectedDate) {
      showToast('Por favor, selecione a data do agendamento.', 'error');
      return;
    }

    if (!selectedTime) {
      showToast('Por favor, selecione um horário disponível.', 'error');
      return;
    }

    const emailToUse = clientEmail.trim()
      ? clientEmail.trim()
      : `cliente_${Date.now()}@saloofast.local`;

    const res = createAppointment({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: emailToUse,
      employeeId: currentUser.id,
      serviceId: selectedService.id,
      date: selectedDate,
      time: selectedTime,
      notes: notes.trim() ? `[Cadastrado por ${currentUser.name}]: ${notes.trim()}` : `[Cadastrado pelo profissional ${currentUser.name}]`,
    });

    if (res.success) {
      showToast(`Agendamento de ${clientName} para ${selectedDate} às ${selectedTime} cadastrado com sucesso na sua agenda!`, 'success');
      onClose();
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider">
              <PlusCircle className="w-4 h-4" />
              <span>Painel do Profissional</span>
            </div>
            <h3 className="font-display text-xl font-bold text-zinc-950 mt-0.5">
              Cadastrar Agendamento
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Insira um cliente manualmente na agenda de <strong className="text-zinc-800">{currentUser.name}</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Dados do Cliente */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-zinc-100">
              <User className="w-3.5 h-3.5 text-amber-500" />
              Dados do Cliente
            </h4>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Nome do Cliente *
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Amanda Silva"
                className="w-full p-2.5 rounded-xl border border-zinc-300 text-xs focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Telefone / Celular *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="(11) 98888-7777"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  E-mail (opcional)
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="cliente@email.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dados do Atendimento */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-zinc-100">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Serviço & Horário
            </h4>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Serviço a Realizar *
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full p-2.5 text-xs font-medium rounded-xl border border-zinc-300 bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              >
                {services.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name} — R$ {srv.price.toFixed(2).replace('.', ',')} ({srv.durationMinutes} min)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Data do Atendimento *
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-2.5 text-xs font-medium rounded-xl border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-700">
                  Horário Livre na Sua Agenda *
                </label>
                <span className="text-[11px] text-zinc-500">
                  {availableTimes.length} horários disponíveis
                </span>
              </div>

              {availableTimes.length === 0 ? (
                <div className="p-3 bg-zinc-100 rounded-xl border border-zinc-200 text-center">
                  <AlertCircle className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-zinc-800">
                    Você não possui horários livres nesta data.
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Verifique seus outros atendimentos ou bloqueios ativos para a data selecionada.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 max-h-36 overflow-y-auto p-1.5 border border-zinc-200 rounded-xl bg-zinc-50">
                  {availableTimes.map((time) => {
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`py-1.5 px-1 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer tabular-nums ${
                          isSelected
                            ? 'bg-zinc-950 text-amber-400 border-zinc-950 shadow-sm'
                            : 'bg-white text-zinc-800 border-zinc-200 hover:border-amber-400 hover:bg-amber-50/50'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedTime && (
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                <span className="text-zinc-700">
                  Confirmar para: <strong className="text-zinc-950">{selectedDate} às {selectedTime}</strong>
                </span>
                <span className="text-amber-700 font-bold">
                  R$ {selectedService.price.toFixed(2).replace('.', ',')}
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Observações do Atendimento (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Agendado presencialmente na recepção, cliente solicitou teste de mecha..."
                rows={2}
                className="w-full p-2.5 text-xs rounded-xl border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 resize-none"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedTime || availableTimes.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Confirmar Agendamento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

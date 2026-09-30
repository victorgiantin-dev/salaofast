import React, { useState, useEffect } from 'react';
import { useSalon } from '../context/SalonContext';
import { Service, User } from '../types';
import { X, Calendar, Clock, Check, ChevronRight, UserCheck, AlertCircle } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedService?: Service | null;
  onViewMyAppointments: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  preSelectedService,
  onViewMyAppointments,
}) => {
  const {
    services,
    users,
    currentUser,
    createAppointment,
    getAvailableTimesForDay,
    showToast,
  } = useSalon();

  const employees = users.filter((u) => u.role === 'employee');

  // Form states
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('any');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  // Default date to today or tomorrow formatted YYYY-MM-DD
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const formattedDate = `${yyyy}-${mm}-${dd}`;
      setSelectedDate(formattedDate);

      if (preSelectedService) {
        setSelectedService(preSelectedService);
        setStep(2); // Jump to professional selection
      } else if (!selectedService && services.length > 0) {
        setSelectedService(services[0]);
      }

      if (currentUser) {
        setClientName(currentUser.name);
        setClientEmail(currentUser.email);
        setClientPhone(currentUser.phone || '');
      }
    }
  }, [isOpen, preSelectedService, currentUser, services]);

  // Recalculate available times when employee, date, or service changes
  useEffect(() => {
    if (selectedService && selectedDate) {
      const duration = selectedService.durationMinutes;
      if (selectedEmployeeId === 'any') {
        // Collect times that ANY employee has available
        const allTimesSet = new Set<string>();
        employees.forEach((emp) => {
          const times = getAvailableTimesForDay(emp.id, selectedDate, duration);
          times.forEach((t) => allTimesSet.add(t));
        });
        const sortedTimes = Array.from(allTimesSet).sort();
        setAvailableTimes(sortedTimes);
        if (selectedTime && !sortedTimes.includes(selectedTime)) {
          setSelectedTime('');
        }
      } else {
        const times = getAvailableTimesForDay(selectedEmployeeId, selectedDate, duration);
        setAvailableTimes(times);
        if (selectedTime && !times.includes(selectedTime)) {
          setSelectedTime('');
        }
      }
    }
  }, [selectedEmployeeId, selectedDate, selectedService, employees]);

  if (!isOpen) return null;

  const handleNextStep = () => {
    if (step === 1) {
      if (!selectedService) {
        showToast('Por favor, selecione um serviço.', 'error');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (!selectedDate) {
        showToast('Por favor, selecione uma data.', 'error');
        return;
      }
      if (!selectedTime) {
        showToast('Por favor, escolha um dos horários disponíveis.', 'error');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!clientName.trim()) {
        showToast('Por favor, informe seu nome completo.', 'error');
        return;
      }
      if (!clientPhone.trim() || clientPhone.length < 9) {
        showToast('Por favor, informe um telefone de contato válido.', 'error');
        return;
      }
      if (!clientEmail.trim() || !clientEmail.includes('@')) {
        showToast('Por favor, informe um e-mail válido.', 'error');
        return;
      }

      // Submit booking
      const res = createAppointment({
        clientName,
        clientPhone,
        clientEmail,
        employeeId: selectedEmployeeId,
        serviceId: selectedService!.id,
        date: selectedDate,
        time: selectedTime,
        notes,
      });

      if (res.success && res.appointment) {
        setConfirmedBookingId(res.appointment.id);
        setStep(5);
      } else {
        showToast(res.message, 'error');
      }
    }
  };

  const handleResetAndClose = () => {
    setStep(1);
    setSelectedTime('');
    setConfirmedBookingId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider">
              <span>Salão Fast</span>
              <span>·</span>
              <span>Passo {step} de 4</span>
            </div>
            <h3 className="font-display text-xl font-bold text-zinc-950 mt-0.5">
              {step === 1 && 'Escolha o Serviço'}
              {step === 2 && 'Escolha o Profissional'}
              {step === 3 && 'Escolha a Data & Horário'}
              {step === 4 && 'Seus Dados de Contato'}
              {step === 5 && 'Agendamento Confirmado!'}
            </h3>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: Select Service */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500 mb-2 font-medium">
                Selecione o procedimento que deseja realizar:
              </p>
              {services.map((srv) => {
                const isSelected = selectedService?.id === srv.id;
                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedService(srv)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/30'
                        : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-zinc-900 text-sm">{srv.name}</h4>
                      <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
                        {srv.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-zinc-600 mt-1 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          {srv.durationMinutes} min
                        </span>
                        <span>·</span>
                        <span className="font-bold text-zinc-950 tabular-nums">
                          R$ {srv.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-400 text-zinc-950'
                          : 'border-zinc-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 2: Select Employee */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500 mb-2 font-medium">
                Escolha o especialista ou selecione o primeiro disponível:
              </p>

              {/* Option Any */}
              <div
                onClick={() => setSelectedEmployeeId('any')}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedEmployeeId === 'any'
                    ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/30'
                    : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-950 text-amber-400 flex items-center justify-center font-bold text-sm">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 text-sm">Qualquer Profissional Disponível</h4>
                    <p className="text-xs text-zinc-500">
                      Maior variedade de horários livres no mesmo dia.
                    </p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    selectedEmployeeId === 'any'
                      ? 'border-amber-500 bg-amber-400 text-zinc-950'
                      : 'border-zinc-300'
                  }`}
                >
                  {selectedEmployeeId === 'any' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              {/* Specific Employees */}
              {employees.map((emp) => {
                const isSelected = selectedEmployeeId === emp.id;
                return (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmployeeId(emp.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/30'
                        : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 flex items-center justify-center font-bold text-sm">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 text-sm">{emp.name}</h4>
                        <p className="text-xs text-amber-600 font-medium">
                          {emp.specialty || 'Profissional Fast'}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-400 text-zinc-950'
                          : 'border-zinc-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 3: Select Date & Time Slot */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  1. Selecione a Data
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-2.5 rounded-xl border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm font-medium text-zinc-900"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    2. Horários Livres (09:00 às 20:00)
                  </label>
                  <span className="text-[11px] text-zinc-500">
                    {availableTimes.length} horários vagos
                  </span>
                </div>

                {availableTimes.length === 0 ? (
                  <div className="p-4 bg-zinc-100 rounded-xl border border-zinc-200 text-center">
                    <AlertCircle className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-zinc-800">
                      Nenhum horário livre nesta data para este profissional.
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Horários podem estar ocupados ou bloqueados por descanso/cursos. Tente outra data ou selecione "Qualquer Profissional".
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-56 overflow-y-auto p-1 border border-zinc-200 rounded-xl bg-zinc-50">
                    {availableTimes.map((time) => {
                      const isSelected = selectedTime === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 px-1 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer tabular-nums ${
                            isSelected
                              ? 'bg-zinc-950 text-amber-400 border-zinc-950 shadow'
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
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-zinc-600">Horário escolhido: </span>
                    <strong className="text-zinc-950 font-bold">{selectedDate} às {selectedTime}</strong>
                  </div>
                  <span className="text-amber-700 font-semibold">Duração: {selectedService?.durationMinutes} min</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Client Contact Info */}
          {step === 4 && (
            <div className="space-y-3.5">
              <p className="text-xs text-zinc-500 mb-2">
                Insira suas informações de contato para receber confirmação e poder gerenciar seus agendamentos:
              </p>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Carlos Oliveira"
                  className="w-full p-2.5 rounded-xl border border-zinc-300 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Telefone / Celular *
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Ex: (11) 98765-4321"
                  className="w-full p-2.5 rounded-xl border border-zinc-300 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  E-mail *
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="Ex: seuemail@exemplo.com"
                  className="w-full p-2.5 rounded-xl border border-zinc-300 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Observações ou Preferências (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Ex: Cabelo com química prévia, prefiro corte mais curto..."
                  className="w-full p-2.5 rounded-xl border border-zinc-300 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 resize-none"
                />
              </div>

              {/* Summary box */}
              <div className="p-3.5 bg-zinc-100 rounded-xl text-xs space-y-1 text-zinc-700 border border-zinc-200">
                <div className="flex justify-between">
                  <span>Serviço:</span>
                  <strong className="text-zinc-900">{selectedService?.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Data & Horário:</span>
                  <strong className="text-zinc-900">{selectedDate} às {selectedTime}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Valor:</span>
                  <strong className="text-zinc-950 font-bold">R$ {selectedService?.price.toFixed(2).replace('.', ',')}</strong>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Success Confirmation */}
          {step === 5 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center mx-auto shadow-lg">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <h4 className="font-display text-2xl font-extrabold text-zinc-950">
                  Agendamento Confirmado!
                </h4>
                <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-sm mx-auto">
                  Seu horário foi reservado no sistema do Salão Fast com total pontualidade.
                </p>
              </div>

              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-left max-w-sm mx-auto space-y-1.5 text-xs text-zinc-700">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Código:</span>
                  <span className="font-mono font-bold text-zinc-900">{confirmedBookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Serviço:</span>
                  <span className="font-semibold text-zinc-900">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Data e Hora:</span>
                  <span className="font-semibold text-zinc-900">{selectedDate} às {selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Cliente:</span>
                  <span className="font-semibold text-zinc-900">{clientName}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  onClick={() => {
                    handleResetAndClose();
                    onViewMyAppointments();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Ver Meus Agendamentos
                </button>
                <button
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {step < 5 && (
          <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
              >
                Voltar
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNextStep}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <span>{step === 4 ? 'Confirmar Agendamento' : 'Avançar'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

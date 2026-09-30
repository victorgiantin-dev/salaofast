import React from 'react';
import { Phone, MapPin, Clock, ShieldCheck, Calendar } from 'lucide-react';
import { useSalon } from '../context/SalonContext';

interface FooterProps {
  onOpenAuth: () => void;
  onOpenBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAuth, onOpenBooking }) => {
  const { currentUser, setActiveView } = useSalon();

  return (
    <footer className="bg-zinc-950 text-white pt-16 pb-12 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="font-display text-2xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
              SALÃO <span className="text-amber-400">FAST</span>
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            </div>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              O seu salão de beleza inteligente com agendamentos pontuais, produtos de excelência e profissionais visagistas especializados.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar Horário Online</span>
              </button>
            </div>
          </div>

          {/* Col 2: Horários & Contato */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider text-amber-400">
              Horário de Atendimento
            </h4>
            <div className="space-y-2 text-xs text-zinc-400">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-200 block">Segunda a Sábado</span>
                  <span>09:00 às 20:00 (Sem fechar para almoço)</span>
                </div>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <Clock className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-300 block">Domingos & Feriados</span>
                  <span>Fechado para descanso da equipe</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Localização */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider text-amber-400">
              Localização & Contato
            </h4>
            <div className="space-y-2 text-xs text-zinc-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Av. Paulista, 1000 - Bela Vista, São Paulo - SP (Estacionamento conveniado)</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-mono text-zinc-300">(11) 94002-9334</span>
              </div>
              <div className="text-[11px] text-zinc-500 pt-1">
                Atendimento presencial e agendamentos pelo sistema web online.
              </div>
            </div>
          </div>

          {/* Col 4: Links Rápidos & Acesso Restrito */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider text-amber-400">
              Acesso & Plataforma
            </h4>
            <div className="flex flex-col space-y-2 text-xs text-zinc-400">
              <button
                onClick={onOpenBooking}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Agendar Horário Online
              </button>
              <button
                onClick={() => setActiveView('my-appointments')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Meus Agendamentos
              </button>
              {!currentUser ? (
                <button
                  onClick={onOpenAuth}
                  className="text-left hover:text-amber-400 transition-colors cursor-pointer font-semibold text-zinc-300 flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  Área do Cliente & Equipe (Login)
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (currentUser.role === 'admin') setActiveView('admin-dashboard');
                    else if (currentUser.role === 'employee') setActiveView('staff-dashboard');
                    else setActiveView('my-appointments');
                  }}
                  className="text-left text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                >
                  Painel Conectado ({currentUser.name})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <div>
            © {new Date().getFullYear()} Salão Fast Ltda. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-4 text-zinc-500">
            <span>Privacidade de Dados</span>
            <span>·</span>
            <span>Termos de Uso</span>
            <span>·</span>
            <span className="text-zinc-400">Banco de Dados Supabase Pronto</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

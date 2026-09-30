import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import { Calendar, User as UserIcon, LogOut, ShieldCheck, Briefcase, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onOpenBooking: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBooking, onOpenAuth }) => {
  const { currentUser, logout, activeView, setActiveView, appointments } = useSalon();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Count user's appointments if client
  const clientAppointmentsCount = currentUser?.role === 'client'
    ? appointments.filter(a => (a.clientId === currentUser.id || a.clientEmail.toLowerCase() === currentUser.email.toLowerCase()) && a.status !== 'cancelled').length
    : 0;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => setActiveView('home')}
          className="text-left group cursor-pointer focus:outline-none"
        >
          <span className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 flex items-center gap-1.5">
            SALÃO <span className="text-amber-500 group-hover:text-amber-400 transition-colors">FAST</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
          </span>
        </button>

        {/* Zone 2: 4-5 Clean Text Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-700">
          <button
            onClick={() => setActiveView('home')}
            className={`transition-colors hover:text-zinc-950 cursor-pointer ${
              activeView === 'home' ? 'text-zinc-950 font-bold border-b-2 border-amber-400 pb-0.5' : ''
            }`}
          >
            Início
          </button>
          <a
            href="#servicos"
            onClick={() => { if (activeView !== 'home') setActiveView('home'); }}
            className="transition-colors hover:text-zinc-950"
          >
            Serviços
          </a>
          <a
            href="#produtos"
            onClick={() => { if (activeView !== 'home') setActiveView('home'); }}
            className="transition-colors hover:text-zinc-950"
          >
            Produtos
          </a>
          <button
            onClick={() => {
              if (currentUser?.role === 'client') {
                setActiveView('my-appointments');
              } else if (currentUser?.role === 'employee') {
                setActiveView('staff-dashboard');
              } else if (currentUser?.role === 'admin') {
                setActiveView('admin-dashboard');
              } else {
                setActiveView('my-appointments');
              }
            }}
            className={`relative transition-colors hover:text-zinc-950 cursor-pointer ${
              activeView === 'my-appointments' ? 'text-zinc-950 font-bold border-b-2 border-amber-400 pb-0.5' : ''
            }`}
          >
            Meus Agendamentos
            {clientAppointmentsCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-amber-400 text-zinc-950 text-xs font-bold rounded-full">
                {clientAppointmentsCount}
              </span>
            )}
          </button>
          {currentUser?.role === 'employee' && (
            <button
              onClick={() => setActiveView('staff-dashboard')}
              className={`transition-colors hover:text-zinc-950 cursor-pointer ${
                activeView === 'staff-dashboard' ? 'text-zinc-950 font-bold border-b-2 border-amber-400 pb-0.5' : 'text-amber-600 font-semibold'
              }`}
            >
              Minha Agenda
            </button>
          )}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setActiveView('admin-dashboard')}
              className={`transition-colors hover:text-zinc-950 cursor-pointer ${
                activeView === 'admin-dashboard' ? 'text-zinc-950 font-bold border-b-2 border-amber-400 pb-0.5' : 'text-amber-600 font-bold'
              }`}
            >
              Painel Admin
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors border border-zinc-200"
              >
                {currentUser.role === 'admin' && <ShieldCheck className="w-4 h-4 text-amber-500" />}
                {currentUser.role === 'employee' && <Briefcase className="w-4 h-4 text-amber-500" />}
                {currentUser.role === 'client' && <UserIcon className="w-4 h-4 text-zinc-600" />}
                <span className="max-w-[120px] truncate font-semibold">{currentUser.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-zinc-200 py-1.5 z-50 text-xs sm:text-sm animate-in fade-in duration-150"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-zinc-100">
                    <p className="font-semibold text-zinc-900 truncate">{currentUser.name}</p>
                    <p className="text-zinc-500 text-xs truncate">{currentUser.email}</p>
                    <div className="mt-1 text-[11px] font-bold text-amber-600 uppercase tracking-wide">
                      {currentUser.role === 'admin' && '👑 Administrador'}
                      {currentUser.role === 'employee' && '✂️ Profissional da Equipe'}
                      {currentUser.role === 'client' && '👤 Cliente'}
                    </div>
                  </div>

                  {currentUser.role === 'client' && (
                    <button
                      onClick={() => setActiveView('my-appointments')}
                      className="w-full text-left px-4 py-2 hover:bg-zinc-50 flex items-center gap-2 text-zinc-700"
                    >
                      <Calendar className="w-4 h-4" />
                      Meus Agendamentos
                    </button>
                  )}

                  {currentUser.role === 'employee' && (
                    <button
                      onClick={() => setActiveView('staff-dashboard')}
                      className="w-full text-left px-4 py-2 hover:bg-zinc-50 flex items-center gap-2 text-zinc-700 font-medium"
                    >
                      <Briefcase className="w-4 h-4 text-amber-500" />
                      Minha Agenda & Bloqueios
                    </button>
                  )}

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => setActiveView('admin-dashboard')}
                      className="w-full text-left px-4 py-2 hover:bg-zinc-50 flex items-center gap-2 text-zinc-700 font-medium"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                      Painel Administrativo & Supabase
                    </button>
                  )}

                  <div className="border-t border-zinc-100 my-1"></div>

                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair da Conta
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-zinc-800 hover:text-zinc-950 transition-colors cursor-pointer"
            >
              Entrar / Cadastrar
            </button>
          )}

          <button
            onClick={onOpenBooking}
            className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all duration-150 hover:shadow active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Calendar className="w-4 h-4" />
            <span>Agendar Online</span>
          </button>
        </div>
      </div>
    </header>
  );
};

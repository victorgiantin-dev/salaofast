import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import { X, Lock, Mail, User as UserIcon, Phone, KeyRound, Sparkles, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
}) => {
  const { login, registerClient, resetPassword, showToast } = useSalon();

  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>(defaultTab);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Por favor, informe seu e-mail de acesso.', 'error');
      return;
    }
    const res = login(email, password);
    if (res.success) {
      onClose();
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      showToast('Preencha todos os campos obrigatórios.', 'error');
      return;
    }
    const res = registerClient(name, email, phone, password);
    if (res.success) {
      onClose();
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      showToast('Informe o seu e-mail cadastrado.', 'error');
      return;
    }
    const res = resetPassword(forgotEmail);
    if (res.success) {
      setForgotSuccess(res.message);
    } else {
      showToast(res.message, 'error');
    }
  };

  const fillQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('123456');
    const res = login(demoEmail, '123456');
    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="font-display text-lg font-bold text-zinc-950">
              Salão Fast · Acesso
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-zinc-200 bg-zinc-100/70 p-1">
          <button
            onClick={() => {
              setTab('login');
              setForgotSuccess(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => {
              setTab('register');
              setForgotSuccess(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === 'register'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Criar Conta Cliente
          </button>
          <button
            onClick={() => {
              setTab('forgot');
              setForgotSuccess(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === 'forgot'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Esqueci Senha
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          {/* TAB 1: LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  E-mail de Acesso *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-zinc-700">Senha *</label>
                  <button
                    type="button"
                    onClick={() => setTab('forgot')}
                    className="text-[11px] font-semibold text-amber-600 hover:underline cursor-pointer"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
              >
                Entrar no Salão Fast
              </button>

              {/* Demo Quick Logins */}
              <div className="pt-4 border-t border-zinc-200 mt-4">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">
                  Acesso Rápido para Demonstração:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => fillQuickLogin('admin@saloofast.com.br')}
                    className="p-2 rounded-lg bg-zinc-900 text-amber-400 hover:bg-zinc-800 text-left font-semibold cursor-pointer border border-zinc-800"
                  >
                    👑 Administrador
                    <span className="block text-[10px] text-zinc-400 font-normal">admin@saloofast.com.br</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickLogin('lucas@saloofast.com.br')}
                    className="p-2 rounded-lg bg-zinc-100 text-zinc-800 hover:bg-zinc-200 text-left font-semibold cursor-pointer border border-zinc-200"
                  >
                    ✂️ Funcionário (Lucas)
                    <span className="block text-[10px] text-zinc-500 font-normal">lucas@saloofast.com.br</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickLogin('mariana@saloofast.com.br')}
                    className="p-2 rounded-lg bg-zinc-100 text-zinc-800 hover:bg-zinc-200 text-left font-semibold cursor-pointer border border-zinc-200"
                  >
                    💅 Funcionária (Mariana)
                    <span className="block text-[10px] text-zinc-500 font-normal">mariana@saloofast.com.br</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickLogin('cliente@gmail.com')}
                    className="p-2 rounded-lg bg-amber-50 text-amber-900 hover:bg-amber-100 text-left font-semibold cursor-pointer border border-amber-200"
                  >
                    👤 Cliente (Juliana)
                    <span className="block text-[10px] text-amber-700 font-normal">cliente@gmail.com</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER CLIENT */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Nome Completo *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Beatriz Lima"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Telefone / Celular *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: (11) 98888-5555"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  E-mail *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Criar Senha *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              </div>

              {/* Informative notice about employees */}
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-[11px] text-zinc-600 leading-snug">
                <span className="font-bold text-zinc-800">É profissional da equipe?</span> Perfis de funcionários são criados exclusivamente pela administração do Salão Fast. Solicite ao administrador o seu cadastro.
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
              >
                Finalizar Cadastro de Cliente
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {tab === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-6 h-6" />
              </div>

              <h4 className="font-display text-base font-bold text-zinc-950 text-center">
                Recuperação de Senha
              </h4>
              <p className="text-xs text-zinc-600 text-center">
                Digite seu e-mail cadastrado. Enviaremos um link seguro para você redefinir sua senha imediatamente.
              </p>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  E-mail Cadastrado *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-zinc-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    required
                  />
                </div>
              </div>

              {forgotSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                  <span className="text-sm">✓</span>
                  <span>{forgotSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Enviar Link de Recuperação
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 cursor-pointer"
                >
                  Voltar para o Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

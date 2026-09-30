/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SalonProvider, useSalon } from './context/SalonContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { ProductsSection } from './components/ProductsSection';
import { BookingModal } from './components/BookingModal';
import { AuthModal } from './components/AuthModal';
import { ClientAppointmentsModal } from './components/ClientAppointmentsModal';
import { StaffDashboard } from './components/StaffDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { Service } from './types';
import { Zap, Clock, ShieldCheck, Award, Calendar, Sparkles } from 'lucide-react';

function SalonAppContent() {
  const { activeView, setActiveView } = useSalon();

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [preSelectedService, setPreSelectedService] = useState<Service | null>(null);

  const handleOpenBookingWithService = (service: Service) => {
    setPreSelectedService(service);
    setIsBookingOpen(true);
  };

  const handleOpenGeneralBooking = () => {
    setPreSelectedService(null);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 selection:bg-amber-400 selection:text-black">
      {/* Toast notifications */}
      <Toast />

      {/* Top Header */}
      <Header
        onOpenBooking={handleOpenGeneralBooking}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {activeView === 'home' && (
          <>
            <Hero onOpenBooking={handleOpenGeneralBooking} />

            {/* Fast Quality Value Proposition Strip */}
            <section className="bg-zinc-950 text-white py-12 border-y border-zinc-900">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center shrink-0 font-bold">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-base text-white">
                        Atendimento Fast
                      </h4>
                      <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                        Horário marcado com rigor de pontualidade. Seu tempo é valioso.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center shrink-0 font-bold">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-base text-white">
                        Visagismo Sob Medida
                      </h4>
                      <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                        Análise de traços e estilo para valorizar sua melhor versão.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center shrink-0 font-bold">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-base text-white">
                        Produtos Originais
                      </h4>
                      <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                        Marcas consagradas no mundo todo para saúde e brilho capilar.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center shrink-0 font-bold">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-base text-white">
                        Agendamento Inteligente
                      </h4>
                      <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                        Escolha o especialista e confirme seu horário no site em 30 segundos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Services Showcase */}
            <ServicesSection onSelectService={handleOpenBookingWithService} />

            {/* Products Showcase */}
            <ProductsSection />

            {/* Ready to Book CTA banner */}
            <section className="bg-amber-400 text-zinc-950 py-14">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2 block">
                  Experiência Salão Fast
                </span>
                <h3 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Pronto para transformar seu visual hoje?
                </h3>
                <p className="text-zinc-900 text-sm sm:text-base mt-2 max-w-xl mx-auto font-medium">
                  Escolha o seu serviço e o horário ideal diretamente na plataforma do Salão Fast.
                </p>
                <div className="mt-8 flex items-center justify-center">
                  <button
                    onClick={handleOpenGeneralBooking}
                    className="w-full sm:w-auto px-8 py-3.5 bg-zinc-950 text-amber-400 hover:bg-zinc-900 text-sm font-bold rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2.5"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Agendar Agora no Site</span>
                  </button>
                </div>
              </div>
            </section>
          </>
        )}

        {/* View 2: Client My Appointments Portal */}
        {activeView === 'my-appointments' && (
          <ClientAppointmentsModal
            onOpenBooking={handleOpenGeneralBooking}
            onOpenAuth={() => setIsAuthOpen(true)}
            onBackToHome={() => setActiveView('home')}
          />
        )}

        {/* View 3: Staff Dashboard */}
        {activeView === 'staff-dashboard' && (
          <StaffDashboard onBackToHome={() => setActiveView('home')} />
        )}

        {/* View 4: Admin Dashboard */}
        {activeView === 'admin-dashboard' && (
          <AdminDashboard onBackToHome={() => setActiveView('home')} />
        )}
      </main>

      {/* Modals */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          setPreSelectedService(null);
        }}
        preSelectedService={preSelectedService}
        onViewMyAppointments={() => setActiveView('my-appointments')}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Footer */}
      <Footer
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenBooking={handleOpenGeneralBooking}
      />
    </div>
  );
}

export default function App() {
  return (
    <SalonProvider>
      <SalonAppContent />
    </SalonProvider>
  );
}

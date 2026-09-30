import React from 'react';
import { Calendar, Clock, Award, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking }) => {
  return (
    <section className="relative overflow-hidden bg-white pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline and CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Unboxed editorial kicker */}
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 mb-4 tracking-wider uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
              <span>São Paulo · Estética & Visagismo de Alta Performance</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-950 tracking-tight leading-[1.1] mb-6 [text-wrap:balance]">
              O seu visual na velocidade que sua rotina exige.{' '}
              <span className="relative inline-block text-zinc-950">
                Sem filas,
                <span className="absolute bottom-1.5 left-0 w-full h-3 bg-amber-300/60 -z-10 rounded-sm"></span>
              </span>{' '}
              com perfeição.
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed mb-8 max-w-xl">
              No <strong className="text-zinc-900 font-semibold">Salão Fast</strong>, unimos visagismo sob medida, tratamentos capilares avançados e produtos premium em um ambiente moderno. Agende seu horário online em segundos com pontualidade garantida.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-10">
              <button
                onClick={onOpenBooking}
                className="flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98] cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar Horário Online</span>
              </button>
            </div>

            {/* Quantitative & trust proof indicators */}
            <div className="pt-6 border-t border-zinc-100 grid grid-cols-3 gap-4">
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-zinc-950 tabular-nums">
                  100%
                </div>
                <div className="text-xs text-zinc-500 font-medium">Pontualidade garantida</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-zinc-950 tabular-nums">
                  4.9 <span className="text-amber-500 text-base">★</span>
                </div>
                <div className="text-xs text-zinc-500 font-medium">+1.400 clientes atendidos</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-zinc-950 tabular-nums">
                  Fast Pay
                </div>
                <div className="text-xs text-zinc-500 font-medium">Pix, Cartões e Dinheiro</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-zinc-950 bg-zinc-100 aspect-[4/3] lg:aspect-[3/4]">
              <img
                src="/src/assets/images/hero_salao_fast_1790710772634.jpg"
                alt="Ambiente moderno do Salão Fast"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  // Fallback styled container
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              {/* Floating Badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-zinc-950/90 backdrop-blur-md text-white p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Atendimento de Segunda a Sábado
                  </div>
                  <div className="text-white text-sm font-semibold mt-0.5">
                    Das 09:00 às 20:00 sem fechar para almoço
                  </div>
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0 animate-ping"></div>
              </div>
            </div>

            {/* Micro decorative accents */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-amber-400 rounded-2xl -z-10 rotate-6 hidden sm:block"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-zinc-900 rounded-xl -z-10 -rotate-3 hidden sm:block"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

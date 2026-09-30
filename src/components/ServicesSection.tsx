import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import { Service, ServiceCategory } from '../types';
import { Clock, Calendar, Check } from 'lucide-react';

interface ServicesSectionProps {
  onSelectService: (service: Service) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  const { services } = useSalon();
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('todos');

  const categories: { id: ServiceCategory; label: string }[] = [
    { id: 'todos', label: 'Todos os Serviços' },
    { id: 'cabelo', label: 'Cabelo' },
    { id: 'barba', label: 'Barba & Bigode' },
    { id: 'coloracao', label: 'Coloração & Mechas' },
    { id: 'estetica', label: 'Tratamentos & Estética' },
    { id: 'unhas', label: 'Unhas & Manicure' },
  ];

  const filteredServices = selectedCategory === 'todos'
    ? services
    : services.filter(s => s.category === selectedCategory);

  return (
    <section id="servicos" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Menu de Experiências
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              Nossos Serviços & Cuidados
            </h2>
            <p className="text-zinc-600 text-sm sm:text-base mt-2 max-w-xl">
              Técnicas modernas de corte, tratamentos intensivos e rituais de bem-estar com produtos de alta performance.
            </p>
          </div>

          {/* Interactive filter buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-zinc-950 text-amber-400 shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="group relative bg-white rounded-2xl border border-zinc-200 hover:border-amber-400 hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden"
            >
              {/* Image banner with overlay */}
              <div className="relative h-44 w-full bg-zinc-900 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  onError={(e) => {
                    // Fallback to minimal styled block
                    (e.target as HTMLElement).style.opacity = '0.3';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent"></div>

                {service.popular && (
                  <div className="absolute top-3 right-3 bg-amber-400 text-zinc-950 text-[11px] font-extrabold px-2.5 py-1 rounded-md shadow-sm uppercase tracking-wide">
                    Mais Pedido
                  </div>
                )}

                <div className="absolute bottom-3 left-3 text-white text-xs flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{service.durationMinutes} minutos de duração</span>
                </div>
              </div>

              {/* Content body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-zinc-950 group-hover:text-amber-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-zinc-600 text-xs sm:text-sm mt-2 leading-relaxed line-clamp-3">
                    {service.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-zinc-500 font-medium block">Valor do serviço</span>
                    <span className="text-xl font-extrabold text-zinc-950 tabular-nums">
                      R$ {service.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectService(service)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Agendar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

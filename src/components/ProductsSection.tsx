import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import { ShoppingBag, Sparkles, Check, CheckCircle2 } from 'lucide-react';

export const ProductsSection: React.FC = () => {
  const { products, showToast } = useSalon();
  const [reservedProducts, setReservedProducts] = useState<Record<string, boolean>>({});

  const handleReserveProduct = (productName: string, productId: string) => {
    setReservedProducts((prev) => ({ ...prev, [productId]: true }));
    showToast(`Produto "${productName}" reservado no balcão do salão com sucesso!`, 'success');
  };

  return (
    <section id="produtos" className="py-16 sm:py-20 bg-zinc-50 border-y border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Linha Home Care Profissional
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
            Produtos Exclusivos Salão Fast
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base mt-2">
            Prolongue o resultado do salão em casa com as melhores fórmulas e ativos dermatologicamente testados.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md hover:border-amber-400 transition-all duration-200 flex flex-col justify-between"
            >
              {/* Image Area */}
              <div className="relative h-48 bg-zinc-900 flex items-center justify-center p-4 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="max-h-full object-contain hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-sm text-zinc-300 text-[10px] font-semibold px-2 py-0.5 rounded uppercase">
                  {product.volume}
                </div>
                <div className="absolute top-3 right-3">
                  <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Em Estoque
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    {product.brand} · {product.category}
                  </span>
                  <h3 className="font-display text-base font-bold text-zinc-950 mt-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-zinc-600 text-xs mt-2 line-clamp-3 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-medium block">Preço</span>
                    <span className="text-lg font-extrabold text-zinc-950 tabular-nums">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  {reservedProducts[product.id] ? (
                    <span className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Reservado</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleReserveProduct(product.name, product.id)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
                      title="Reservar no balcão"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-zinc-950" />
                      <span>Reservar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order note */}
        <div className="mt-10 bg-white p-4 rounded-xl border border-zinc-200 text-center max-w-xl mx-auto flex items-center justify-center gap-3 text-xs sm:text-sm text-zinc-600">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Retirada imediata no balcão do salão ou entrega expressa em São Paulo.</span>
        </div>
      </div>
    </section>
  );
};

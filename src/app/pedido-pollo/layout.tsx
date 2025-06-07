
import type { ReactNode } from 'react';

export default function PedidoPolloLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-orange-50 text-gray-800">
      {/* Aquí podrías agregar un Navbar/Header específico para la tienda si lo deseas en el futuro */}
      <main>{children}</main>
      {/* Aquí podrías agregar un Footer específico para la tienda si lo deseas en el futuro */}
    </div>
  );
}

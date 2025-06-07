
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Sparkles } from 'lucide-react';

interface ChickenProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  imageHint: string;
  calories?: string; // Optional
}

const mockProducts: ChickenProduct[] = [
  {
    id: '1',
    name: 'Pollo a la Brasa Entero',
    description: 'Nuestro clásico pollo marinado y horneado a la perfección, jugoso por dentro y crujiente por fuera. Acompañado de papas fritas y ensalada fresca.',
    price: 55.90,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'roast chicken platter',
    calories: '1200 kcal',
  },
  {
    id: '2',
    name: '1/2 Pollo a la Brasa',
    description: 'Media porción de nuestro delicioso pollo a la brasa, ideal para compartir o para un buen apetito. Incluye papas y ensalada.',
    price: 30.50,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'half roast chicken',
    calories: '750 kcal',
  },
  {
    id: '3',
    name: '1/4 Pollo a la Brasa (Pierna)',
    description: 'Una generosa pieza de pierna de pollo a la brasa, perfecta para una comida individual. Viene con papas fritas y ensalada.',
    price: 18.00,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'chicken leg portion',
    calories: '550 kcal',
  },
  {
    id: '4',
    name: 'Alitas BBQ (12 unidades)',
    description: 'Crujientes alitas de pollo bañadas en nuestra salsa BBQ casera agridulce. ¡Para chuparse los dedos!',
    price: 28.90,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'bbq chicken wings',
    calories: '900 kcal',
  },
  {
    id: '5',
    name: 'Mega Broaster Familiar',
    description: 'Un festín de pollo broaster crujiente: 8 piezas de pollo, papas familiares, ensalada y todas nuestras cremas.',
    price: 75.00,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'fried chicken bucket',
    calories: '2500 kcal',
  },
  {
    id: '6',
    name: 'Ensalada César con Pollo Grillado',
    description: 'Fresca lechuga romana, crutones, queso parmesano y trozos de pollo grillado, aderezada con nuestra salsa César especial.',
    price: 22.00,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'chicken caesar salad',
    calories: '450 kcal',
  },
];

export default function PedidoPolloPage() {
  const handleAddToCart = (productName: string) => {
    // Lógica futura para añadir al carrito (por ahora solo un console.log)
    console.log(`${productName} añadido al carrito (simulación)`);
    // Podrías usar toast aquí para notificar al usuario
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-orange-600 mb-2 flex items-center justify-center">
          <Sparkles className="w-12 h-12 mr-3 text-yellow-500" />
          Pollería "El Brasero Ardiente"
          <Sparkles className="w-12 h-12 ml-3 text-yellow-500" />
        </h1>
        <p className="text-xl text-gray-700">¡El sabor que te encanta, directo a tu mesa!</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockProducts.map((product) => (
          <Card key={product.id} className="flex flex-col overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-lg border-orange-200">
            <CardHeader className="p-0 relative">
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={600}
                height={400}
                className="object-cover w-full h-48"
                data-ai-hint={product.imageHint}
              />
            </CardHeader>
            <CardContent className="flex-grow p-6 bg-white">
              <CardTitle className="text-2xl font-semibold text-orange-700 mb-2">{product.name}</CardTitle>
              <CardDescription className="text-gray-600 mb-3 text-sm">{product.description}</CardDescription>
              {product.calories && (
                <p className="text-xs text-gray-500 mb-3">Aprox. {product.calories}</p>
              )}
              <p className="text-2xl font-bold text-red-600 mb-4">
                S/ {product.price.toFixed(2)}
              </p>
            </CardContent>
            <CardFooter className="p-6 bg-gray-50 border-t border-orange-100">
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg"
                onClick={() => handleAddToCart(product.name)}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Agregar al Carrito
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <footer className="text-center mt-16 py-8 border-t border-orange-200">
        <p className="text-gray-600">&copy; {new Date().getFullYear()} Pollería "El Brasero Ardiente". Todos los derechos reservados.</p>
        <p className="text-sm text-gray-500 mt-1">Av. Siempre Viva 123, Springfield - Pedidos al (01) 555-POLLO</p>
      </footer>
    </div>
  );
}


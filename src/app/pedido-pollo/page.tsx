
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Sparkles, Trash2, Plus, Minus, CreditCard, Smartphone, Banknote, X, DollarSign, PackageCheck, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ChickenProduct {
  id: string;
  name: string;
  description: string;
  price: number; // Price in SOL
  imageUrl: string;
  imageHint: string;
  calories?: string;
}

interface CartItem extends ChickenProduct {
  quantity: number;
}

const mockProducts: ChickenProduct[] = [
  {
    id: '1',
    name: 'Pollo a la Brasa Entero',
    description: 'Nuestro clásico pollo marinado y horneado a la perfección. Acompañado de papas fritas y ensalada fresca.',
    price: 55.90,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'roast chicken platter',
    calories: '1200 kcal',
  },
  {
    id: '2',
    name: '1/2 Pollo a la Brasa',
    description: 'Media porción de nuestro delicioso pollo a la brasa. Incluye papas y ensalada.',
    price: 30.50,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'half roast chicken',
    calories: '750 kcal',
  },
  {
    id: '3',
    name: '1/4 Pollo a la Brasa (Pierna)',
    description: 'Una generosa pieza de pierna de pollo a la brasa. Viene con papas fritas y ensalada.',
    price: 18.00,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'chicken leg portion',
    calories: '550 kcal',
  },
  {
    id: '4',
    name: 'Alitas BBQ (12 unidades)',
    description: 'Crujientes alitas de pollo bañadas en nuestra salsa BBQ casera agridulce.',
    price: 28.90,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'bbq chicken wings',
    calories: '900 kcal',
  },
  {
    id: '5',
    name: 'Mega Broaster Familiar',
    description: 'Un festín de pollo broaster crujiente: 8 piezas, papas familiares, ensalada y cremas.',
    price: 75.00,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'fried chicken bucket',
    calories: '2500 kcal',
  },
  {
    id: '6',
    name: 'Ensalada César con Pollo Grillado',
    description: 'Fresca lechuga romana, crutones, parmesano y pollo grillado, con nuestra salsa César.',
    price: 22.00,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'chicken caesar salad',
    calories: '450 kcal',
  },
];

const USD_EXCHANGE_RATE = 3.80; // Example exchange rate: 1 USD = 3.80 SOL

export default function PedidoPolloPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'yape' | 'card' | 'cash'>('yape');
  const [payInDollars, setPayInDollars] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleAddToCart = (product: ChickenProduct) => {
    setCartItems((prevItems) => {
      const itemExists = prevItems.find((item) => item.id === product.id);
      if (itemExists) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
    toast({
      title: "Producto Añadido",
      description: `${product.name} ha sido añadido al carrito.`,
      className: "bg-green-100 border-green-300 text-green-800",
    });
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    toast({
      title: "Producto Eliminado",
      variant: "destructive",
    });
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const totalInSol = calculateTotal();
  const totalInUsd = totalInSol / USD_EXCHANGE_RATE;

  const displayedTotal = payInDollars ? totalInUsd : totalInSol;
  const currencySymbol = payInDollars ? '$' : 'S/';

  const totalItemsInCart = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast({ title: "Carrito Vacío", description: "Añade productos antes de proceder.", variant: "destructive" });
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleConfirmOrder = () => {
    // Simulate order confirmation
    console.log("Pedido Confirmado (simulación):", {
      items: cartItems,
      total: displayedTotal,
      currency: payInDollars ? 'USD' : 'SOL',
      paymentMethod,
    });
    toast({
      title: "¡Pedido Confirmado!",
      description: "Gracias por tu compra. Tu pollo está en camino.",
      className: "bg-orange-500 text-white",
      duration: 5000,
      action: <PackageCheck className="h-6 w-6 text-white" />,
    });
    setCartItems([]);
    setIsCheckoutOpen(false);
    setPayInDollars(false); // Reset currency preference
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('loggedInUser'); // Good practice even if not directly used by this page
    }
    router.push('/');
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <div className="flex justify-between items-center">
            <div></div> {/* Empty div for spacing */}
            <h1 className="text-4xl md:text-5xl font-bold text-orange-600 mb-2 flex items-center justify-center">
            <Sparkles className="w-10 h-10 md:w-12 md:h-12 mr-3 text-yellow-500" />
            Pollería "El Brasero Ardiente"
            <Sparkles className="w-10 h-10 md:w-12 md:h-12 ml-3 text-yellow-500" />
            </h1>
            <Button variant="outline" size="lg" onClick={() => setIsCartOpen(true)} className="relative border-orange-400 hover:bg-orange-100 text-orange-600">
                <ShoppingCart className="mr-2 h-6 w-6" />
                Carrito
                {totalItemsInCart > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItemsInCart}
                </span>
                )}
            </Button>
        </div>
        <p className="text-xl text-gray-700 mt-2">¡El sabor que te encanta, directo a tu mesa!</p>
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
                onClick={() => handleAddToCart(product)}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Agregar al Carrito
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Cart Sheet */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent className="sm:max-w-lg w-[90vw] bg-orange-50 text-orange-800 border-orange-300">
          <SheetHeader className="border-b border-orange-200 pb-4">
            <SheetTitle className="text-2xl font-bold text-orange-700 flex items-center">
                <ShoppingCart className="mr-3 h-7 w-7"/>Tu Carrito de Compras
            </SheetTitle>
          </SheetHeader>
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10">
              <ShoppingCart className="w-24 h-24 text-orange-300 mb-4" />
              <p className="text-xl text-orange-500">Tu carrito está vacío.</p>
              <p className="text-sm text-orange-400">¡Añade algunos pollos deliciosos!</p>
            </div>
          ) : (
            <div className="py-4 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-md shadow border border-orange-100">
                  <Image src={item.imageUrl} alt={item.name} width={60} height={60} className="rounded-md object-cover" data-ai-hint={item.imageHint}/>
                  <div className="flex-grow ml-3">
                    <h3 className="font-semibold text-orange-700">{item.name}</h3>
                    <p className="text-sm text-red-600">S/ {item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 border-orange-300 text-orange-600 hover:bg-orange-100" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-medium w-6 text-center">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8 border-orange-300 text-orange-600 hover:bg-orange-100" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-100" onClick={() => handleRemoveFromCart(item.id)}>
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {cartItems.length > 0 && (
            <SheetFooter className="mt-auto border-t border-orange-200 pt-4 p-4 bg-orange-50">
              <div className="w-full space-y-3">
                <div className="flex justify-between text-xl font-bold text-orange-700">
                  <span>Total:</span>
                  <span>S/ {calculateTotal().toFixed(2)}</span>
                </div>
                <Button className="w-full text-lg py-3 bg-orange-600 hover:bg-orange-700 text-white" onClick={handleProceedToCheckout}>
                  Proceder al Pago
                </Button>
                 <SheetClose asChild>
                    <Button variant="outline" className="w-full border-orange-400 text-orange-600 hover:bg-orange-100">Seguir Comprando</Button>
                </SheetClose>
              </div>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md bg-orange-50 border-orange-300">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-orange-700 flex items-center">
                <PackageCheck className="mr-3 h-7 w-7"/>Confirmar Pedido y Pago
            </DialogTitle>
            <DialogDescription className="text-orange-600">
              Revisa tu pedido y selecciona tu método de pago.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            <div className="flex items-center justify-between p-3 bg-white rounded-md shadow-sm border border-orange-200">
                <Label htmlFor="payInDollarsSwitch" className="text-lg font-medium text-orange-700 flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-green-600"/>Pagar en Dólares (USD)
                </Label>
                <Switch
                    id="payInDollarsSwitch"
                    checked={payInDollars}
                    onCheckedChange={setPayInDollars}
                    className="data-[state=checked]:bg-green-500"
                />
            </div>
            <p className="text-2xl font-bold text-center text-orange-800">
                Total a Pagar: {currencySymbol} {displayedTotal.toFixed(2)}
                {payInDollars && <span className="text-sm block text-gray-500">(Tipo de cambio: S/ {USD_EXCHANGE_RATE.toFixed(2)} por USD)</span>}
            </p>
            
            <div>
              <Label className="text-lg font-medium text-orange-700 mb-2 block">Método de Pago:</Label>
              <RadioGroup value={paymentMethod} onValueChange={(value: 'yape' | 'card' | 'cash') => setPaymentMethod(value)} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                    { value: 'yape', label: 'Yape / Plin', icon: Smartphone },
                    { value: 'card', label: 'Tarjeta Débito/Crédito', icon: CreditCard },
                    { value: 'cash', label: 'Efectivo (al recibir)', icon: Banknote },
                ].map(option => (
                    <Label
                    key={option.value}
                    htmlFor={`payment-${option.value}`}
                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                                ${paymentMethod === option.value ? 'bg-orange-500 border-orange-600 text-white shadow-lg scale-105' : 'bg-white border-orange-200 text-orange-700 hover:border-orange-400 hover:bg-orange-100'}`}
                    >
                    <RadioGroupItem value={option.value} id={`payment-${option.value}`} className="sr-only" />
                    <option.icon className={`mb-2 h-8 w-8 ${paymentMethod === option.value ? 'text-white' : 'text-orange-500'}`} />
                    <span className="text-sm font-medium text-center">{option.label}</span>
                    </Label>
                ))}
              </RadioGroup>
            </div>

            {/* Payment Method Specific Content */}
            {paymentMethod === 'yape' && (
              <div className="text-center p-4 bg-white rounded-lg border border-purple-300 shadow-md">
                <h3 className="text-lg font-semibold text-purple-700 mb-2">Paga con Yape/Plin</h3>
                <p className="text-sm text-gray-600 mb-2">Escanea el QR con tu app Yape o Plin. Monto: <span className="font-bold">{currencySymbol} {displayedTotal.toFixed(2)}</span></p>
                <Image src="https://placehold.co/250x250.png" alt="QR Code Yape/Plin" width={200} height={200} className="mx-auto rounded-md border-2 border-purple-400" data-ai-hint="qr code payment"/>
                <p className="text-xs text-gray-500 mt-2">Luego de pagar, haz clic en "Confirmar Pedido".</p>
              </div>
            )}
            {paymentMethod === 'card' && (
              <div className="p-4 bg-white rounded-lg border border-blue-300 shadow-md space-y-3">
                <h3 className="text-lg font-semibold text-blue-700">Pago con Tarjeta (Simulación)</h3>
                <div>
                  <Label htmlFor="cardNumber" className="text-sm font-medium text-blue-600">Número de Tarjeta</Label>
                  <Input id="cardNumber" placeholder="**** **** **** ****" className="border-blue-300 focus:border-blue-500" />
                </div>
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <Label htmlFor="expiryDate" className="text-sm font-medium text-blue-600">Fecha Exp. (MM/AA)</Label>
                    <Input id="expiryDate" placeholder="MM/AA" className="border-blue-300 focus:border-blue-500" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="cvv" className="text-sm font-medium text-blue-600">CVV</Label>
                    <Input id="cvv" placeholder="***" className="border-blue-300 focus:border-blue-500"/>
                  </div>
                </div>
                 <p className="text-xs text-gray-500 mt-1">Esta es una simulación. No se guardarán datos reales.</p>
              </div>
            )}
            {paymentMethod === 'cash' && (
              <div className="p-4 bg-white rounded-lg border border-green-300 shadow-md text-center">
                <h3 className="text-lg font-semibold text-green-700">Pago en Efectivo</h3>
                <p className="text-sm text-gray-600">Pagarás <span className="font-bold">{currencySymbol} {displayedTotal.toFixed(2)}</span> en efectivo cuando recibas tu pedido.</p>
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-between gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="w-full sm:w-auto border-orange-400 text-orange-600 hover:bg-orange-100">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleConfirmOrder} className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white">
              <PackageCheck className="mr-2 h-5 w-5" /> Confirmar Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <footer className="text-center mt-16 py-8 border-t border-orange-200">
        <p className="text-gray-600">&copy; {new Date().getFullYear()} Pollería "El Brasero Ardiente". Todos los derechos reservados.</p>
        <p className="text-sm text-gray-500 mt-1">Av. Siempre Viva 123, Springfield - Pedidos al (01) 555-POLLO</p>
        <Button variant="ghost" onClick={handleLogout} className="mt-4 text-orange-600 hover:text-orange-800">
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </footer>
    </div>
  );
}

    

    
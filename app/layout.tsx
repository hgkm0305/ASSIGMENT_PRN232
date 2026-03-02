import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import { AuthProvider } from '@/components/AuthContext';
import { CartProvider } from '@/components/CartContext';

export const metadata: Metadata = {
  title: 'Clothing E-Commerce Platform',
  description: 'A modern e-commerce platform for clothing products',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <Navigation />
            <main className="min-h-screen bg-gray-50">{children}</main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

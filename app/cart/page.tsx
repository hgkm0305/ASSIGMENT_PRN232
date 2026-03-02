'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartContext';

export default function CartPage() {
  const { items, totalAmount, updateQuantity, removeItem } = useCart();

  const handleQuantityChange = (productId: number, value: string) => {
    const quantity = parseInt(value, 10);
    if (Number.isNaN(quantity)) return;
    updateQuantity(productId, quantity);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart</h1>
        <p className="text-gray-600 mb-6">Your cart is currently empty.</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Cart</h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {items.map((item) => (
            <li key={item.productId} className="p-4 flex gap-4 items-center">
              <div className="w-20 h-20 flex-shrink-0">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-md">
                    <span className="text-xs text-gray-400">No Image</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">
                  ${Number(item.price).toFixed(2)} each
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(item.productId, e.target.value)
                  }
                  className="w-20 px-2 py-1 border border-gray-300 rounded-md text-center"
                />
              </div>
              <div className="w-24 text-right">
                <p className="font-semibold text-gray-900">
                  $
                  {(
                    item.quantity * Number(item.price)
                  ).toFixed(2)}
                </p>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="mt-1 text-xs text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-xl font-semibold text-gray-900">
          Total:{' '}
          <span className="text-indigo-600">
            ${totalAmount.toFixed(2)}
          </span>
        </p>
        <div className="flex gap-3">
          <Link
            href="/"
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Continue Shopping
          </Link>
          <Link
            href="/checkout"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}


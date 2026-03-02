'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import type { Order, OrderItem } from '@/types/order';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OrderDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const { data, error, isLoading } = useSWR(
    user && orderId ? `/api/orders/${orderId}` : null,
    fetcher
  );

  if (!authLoading && !user) {
    router.replace('/login');
  }

  if (authLoading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">
            {authLoading ? 'Checking your session...' : 'Redirecting to login...'}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Loading order...</p>
      </div>
    );
  }

  if (error || !data || data.error || !data.order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-red-600 mb-4">Failed to load order.</p>
        <Link
          href="/orders"
          className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const order: Order = data.order;
  const items: OrderItem[] = data.items ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/orders"
        className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block"
      >
        ← Back to Orders
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Order #{order.id}
      </h1>

      <p className="text-gray-600 mb-2">
        Placed on{' '}
        <span className="font-medium">
          {new Date(order.created_at).toLocaleString()}
        </span>
      </p>
      <p className="text-gray-600 mb-4">
        Status:{' '}
        <span className="font-semibold capitalize">{order.status}</span>
      </p>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <ul className="divide-y divide-gray-200">
          {items.map((item) => (
            <li key={item.id} className="p-4 flex gap-4 items-center">
              <div className="w-16 h-16 flex-shrink-0">
                {item.product_image ? (
                  <img
                    src={item.product_image}
                    alt={item.product_name || ''}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-md">
                    <span className="text-xs text-gray-400">No Image</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {item.product_name ?? `Product #${item.product_id}`}
                </p>
                <p className="text-sm text-gray-500">
                  {item.quantity} × ${Number(item.unit_price).toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  ${(item.quantity * Number(item.unit_price)).toFixed(2)}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="text-xl font-bold text-indigo-600">
            ${Number(order.total_amount).toFixed(2)}
          </span>
        </div>
      </div>

      <Link
        href="/"
        className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        Continue Shopping
      </Link>
    </div>
  );
}


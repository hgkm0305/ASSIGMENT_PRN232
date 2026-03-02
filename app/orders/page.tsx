'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import type { Order } from '@/types/order';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const { data, error, isLoading } = useSWR(
    user ? '/api/orders' : null,
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

  const orders: Order[] = data?.orders ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Orders</h1>

      {isLoading ? (
        <p className="text-gray-500">Loading orders...</p>
      ) : error ? (
        <p className="text-red-600">Failed to load orders.</p>
      ) : orders.length === 0 ? (
        <div>
          <p className="text-gray-600 mb-4">
            You have not placed any orders yet.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {orders.map((order) => (
              <li key={order.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900">
                    Order #{order.id}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status:{' '}
                    <span className="font-medium capitalize">
                      {order.status}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-indigo-600">
                    ${Number(order.total_amount).toFixed(2)}
                  </p>
                  <Link
                    href={`/orders/${order.id}`}
                    className="mt-1 inline-block text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    View details
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


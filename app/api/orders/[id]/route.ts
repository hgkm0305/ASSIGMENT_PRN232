import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCurrentUserFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orderId = parseInt(params.id, 10);
    if (Number.isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const orderResult = await pool.query(
      `
        SELECT id, user_id, total_amount, status, created_at
        FROM orders
        WHERE id = $1 AND user_id = $2
      `,
      [orderId, user.id]
    );

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderResult.rows[0];

    const itemsResult = await pool.query(
      `
        SELECT
          oi.id,
          oi.order_id,
          oi.product_id,
          oi.quantity,
          oi.unit_price,
          p.name AS product_name,
          p.image AS product_image
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = $1
      `,
      [orderId]
    );

    return NextResponse.json(
      { order, items: itemsResult.rows },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}


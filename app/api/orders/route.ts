import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCurrentUserFromRequest } from '@/lib/auth';

interface IncomingOrderItem {
  productId: number;
  quantity: number;
}

// GET /api/orders - list current user's orders
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await pool.query(
      `
        SELECT id, user_id, total_amount, status, created_at
        FROM orders
        WHERE user_id = $1
        ORDER BY created_at DESC
      `,
      [user.id]
    );

    return NextResponse.json({ orders: result.rows }, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - create a new order from cart items
export async function POST(request: NextRequest) {
  const client = await pool.connect();
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      client.release();
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as { items?: IncomingOrderItem[] };
    const items = body.items ?? [];

    if (!Array.isArray(items) || items.length === 0) {
      client.release();
      return NextResponse.json(
        { error: 'Cart items are required' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    // Load product prices from DB to prevent tampering
    const productIds = items.map((it) => it.productId);
    const productsResult = await client.query(
      `SELECT id, price, name, image FROM products WHERE id = ANY($1::int[])`,
      [productIds]
    );

    const productsById = new Map<
      number,
      { id: number; price: string; name: string; image: string | null }
    >();
    for (const row of productsResult.rows) {
      productsById.set(row.id, row);
    }

    if (productsById.size !== productIds.length) {
      await client.query('ROLLBACK');
      client.release();
      return NextResponse.json(
        { error: 'One or more products no longer exist' },
        { status: 400 }
      );
    }

    let totalAmount = 0;
    for (const item of items) {
      const product = productsById.get(item.productId)!;
      const priceNumber = Number(product.price);
      if (!Number.isFinite(priceNumber) || priceNumber < 0) {
        await client.query('ROLLBACK');
        client.release();
        return NextResponse.json(
          { error: 'Invalid product price' },
          { status: 400 }
        );
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        await client.query('ROLLBACK');
        client.release();
        return NextResponse.json(
          { error: 'Invalid quantity' },
          { status: 400 }
        );
      }
      totalAmount += priceNumber * item.quantity;
    }

    // Simulated payment: mark as paid directly
    const orderResult = await client.query(
      `
        INSERT INTO orders (user_id, total_amount, status)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, total_amount, status, created_at
      `,
      [user.id, totalAmount.toFixed(2), 'paid']
    );

    const order = orderResult.rows[0];

    // Insert order items
    for (const item of items) {
      const product = productsById.get(item.productId)!;
      const priceNumber = Number(product.price);
      await client.query(
        `
          INSERT INTO order_items (order_id, product_id, quantity, unit_price)
          VALUES ($1, $2, $3, $4)
        `,
        [order.id, item.productId, item.quantity, priceNumber.toFixed(2)]
      );
    }

    await client.query('COMMIT');
    client.release();

    return NextResponse.json(
      {
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    try {
      await client.query('ROLLBACK');
    } catch {
      // ignore rollback error
    }
    client.release();
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}


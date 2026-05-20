export const dynamic = 'force-dynamic';

import { getCookieServer } from '@/lib/cookieServer';
import { api } from '@/services/api';
import { redirect } from 'next/navigation';
import { Orders } from './components/orders';
import { OrderProps } from '@/lib/order.type';

async function getOrders(): Promise<OrderProps[]> {
  const token = await getCookieServer();
  if (!token) {
    redirect('/');
  }

  try {
    const response = await api.get('/orders', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    redirect('/');
  }
}

export default async function Dashboard() {
  const orders = await getOrders();

  return <Orders orders={orders} />;
}
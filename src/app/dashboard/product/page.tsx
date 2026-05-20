export const dynamic = 'force-dynamic';

import { getCookieServer } from '@/lib/cookieServer';
import { api } from '@/services/api';
import { redirect } from 'next/navigation';
import { Form } from './components/form';

export default async function Product() {
  const token = await getCookieServer();

  if (!token) {
    redirect('/');
  }

  let categories = [];

  try {
    const response = await api.get('/category', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    categories = response.data;
  } catch (err) {
    console.error("Erro ao buscar categorias para o produto:", err);
  }

  return (
    <Form categories={categories} />
  );
}
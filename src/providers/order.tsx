'use client';

import { createContext, ReactNode, useState } from 'react';
import { api } from '@/services/api';
import { getCookieClient } from '@/lib/cookieClient';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export interface OrderItemProps {
  id: string;
  amount: number;
  created_at: string;
  order_id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    price: string;
    description: string;
    banner: string;
    category_id: string;
  };
  order: {
    id: string;
    table: number;
    name: string | null;
    draft: boolean;
    status: boolean;
  };
}

interface OrderDashboardProps {
  id: string;
  table: number;
  name: string | null;
  status: boolean;
  draft: boolean;
  created_at: string;
  items: OrderItemProps[];
}

type OrderContextData = {
  isOpen: boolean;
  onRequestOpen: (order_id: string) => Promise<void>;
  onRequestClose: () => void;
  order: OrderItemProps[];
  currentOrderId: string | null;
  finishOrder: (order_id: string) => Promise<void>;
  orders: OrderDashboardProps[];
  setOrders: React.Dispatch<React.SetStateAction<OrderDashboardProps[]>>;
};

type OrderProviderProps = {
  children: ReactNode;
};

export const OrderContext = createContext({} as OrderContextData);

export function OrderProvider({ children }: OrderProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [order, setOrder] = useState<OrderItemProps[]>([]);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderDashboardProps[]>([]);
  const router = useRouter();

  async function onRequestOpen(order_id: string) {
    setCurrentOrderId(order_id);

    try {
      const token = getCookieClient();
      if (!token) {
        toast.error('Sessão expirada. Faça login novamente.', {
          style: { backgroundColor: 'var(--red-900)', color: 'var(--white)' },
        });
        return;
      }

      const response = await api.get('/order/detail', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          order_id: order_id,
        },
      });

      const data = Array.isArray(response.data) ? response.data : [response.data];

      if (data.length === 0) {
        toast.warning(`Nenhum item encontrado para o pedido ID: ${order_id}`, {
          style: { backgroundColor: 'var(--red-900)', color: 'var(--white)' },
        });
      }

      setOrder(data);
      setIsOpen(true);
    } catch (error: any) {
      toast.error('Erro ao carregar detalhes do pedido.', {
        style: { backgroundColor: 'var(--red-900)', color: 'var(--white)' },
      });
      setOrder([]);
      setIsOpen(false);
      setCurrentOrderId(null);
    }
  }

  function onRequestClose() {
    setIsOpen(false);
    setOrder([]);
    setCurrentOrderId(null);
  }

  async function finishOrder(order_id: string) {
    const token = getCookieClient();

    if (!token) {
      toast.error('Token não encontrado!');
      return;
    }

    try {
      await api.put('/order/finish', { orderId: order_id }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Pedido finalizado com sucesso!');
      router.refresh();
      
      setOrders(orders.filter(item => item.id !== order_id));
      onRequestClose();

    } catch (err: any) {
      toast.error("Erro ao finalizar o pedido");
      return;
    }
  }

  return (
    <OrderContext.Provider
      value={{
        isOpen,
        onRequestOpen,
        onRequestClose,
        order,
        currentOrderId,
        finishOrder,
        orders,
        setOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}
'use client';

import { use } from 'react';
import styles from './styles.module.scss';
import { X } from 'lucide-react';
import { OrderContext } from '@/providers/order';
import { calculateTotalOrder } from '@/lib/helper';

interface OrderItemProps {
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

export function Modalorder() {
  const { onRequestClose, order, currentOrderId, finishOrder } = use(OrderContext);

  async function handleFinishOrder() {
    await finishOrder(order[0]?.order.id || '');
  }

  
  if (!order || order.length === 0) {
    return (
      <dialog className={styles.dialogContainer} open>
        <section className={styles.dialogContent}>
          <button className={styles.dialogBack} onClick={onRequestClose}>
            <X size={40} color='#FF3f4b' />
          </button>
          <article className={styles.container}>
            <h2>Detalhes do pedido</h2>
            <p>
              Nenhum detalhe disponível para o pedido ID: {currentOrderId || 'desconhecido'}. Verifique se o pedido existe.
            </p>
          </article>
        </section>
      </dialog>
    );
  }

  const mainOrder = order[0]?.order;

  return (
    <dialog className={styles.dialogContainer} open>
      <section className={styles.dialogContent}>
        <button className={styles.dialogBack} onClick={onRequestClose}>
          <X size={40} color='#FF3f4b' />
        </button>

        <article className={styles.container}>
          <h2>Detalhes do pedido (ID: {currentOrderId || 'N/A'})</h2>

          <span className={styles.table}>
            Mesa <b>{mainOrder?.table ?? 'N/A'}</b>
          </span>

          {mainOrder?.name && (
            <span className={styles.name}>
              <b>{mainOrder.name}</b>
            </span>
          )}

          {order.map((item: OrderItemProps) => (
            <section className={styles.item} key={item.id}>
              <span>
                Qtd: {item.amount} - <b>{item.product?.name ?? 'Produto desconhecido'}</b> - R$ {parseFloat(item.product.price) *
                item.amount}
              </span>
              <span className={styles.description}>
                {item.product?.description ?? 'Sem descrição'}
              </span>
            </section>
          ))}

          <h3 className={styles.total}>Valor total: R$ {calculateTotalOrder(order)}</h3>

          <button className={styles.buttonOrder} onClick={ handleFinishOrder }>
            Concluir pedido
            </button>
        </article>
      </section>
    </dialog>
  );
}
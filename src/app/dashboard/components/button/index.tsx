"use client"

import styles from './styles.module.scss'
import { useFormStatus } from 'react-dom'

interface Props {
  name: string;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({ name, type }: Props){
  const { pending } = useFormStatus();

  return (
    <button type={type} disabled={pending} className={styles.button}>
      {pending ? "Carregando..." : name}
    </button>
  );
}
'use client';

import { useState } from 'react';
import styles from './page.module.scss';
import logoImg from '/public/logo.png';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/services/api';
import { toast } from 'sonner';

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

    if (!email || !password) {
      toast.error('Por favor, preencha email e senha.', {
        style: { backgroundColor: 'var(--red-900)', color: 'var(--white)' }
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Por favor, insira um email válido.', {
        style: { backgroundColor: 'var(--red-900)', color: 'var(--white)' }
      });
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.', {
        style: { backgroundColor: 'var(--red-900)', color: 'var(--white)' }
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/session', {
        email: email.trim(),
        password: password.trim()
      });

      if (!response.data.token) {
        toast.error('Falha no login: Nenhum token retornado.', {
          style: { backgroundColor: 'var(--red-900)', color: 'var(--white)' }
        });
        setIsSubmitting(false);
        return;
      }

      document.cookie = `session=${response.data.token}; max-age=${
        60 * 60 * 24 * 30
      }; path=/; ${process.env.NODE_ENV === 'production' ? 'secure' : ''}`;

      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Erro no login:', err);
      toast.error('Erro ao fazer login. Verifique suas credenciais.', {
        style: { backgroundColor: 'var(--red-900)', color: 'var(--white)' }
      });
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.containerCenter}>
      <section className={styles.login}>
        <Image src={logoImg} alt='Logo da pizzaria' className={styles.logo} />
        <form onSubmit={handleLogin}>
          <input
            type='email'
            required
            name='email'
            placeholder='Digite seu email...'
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type='password'
            required
            name='password'
            placeholder='***********'
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type='submit'
            className={styles.button}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Acessando...' : 'Acessar'}
          </button>
        </form>

        <Link href='/signup' className={styles.text}>
          Não possui uma conta? Cadastre-se
        </Link>
      </section>
    </div>
  );
}
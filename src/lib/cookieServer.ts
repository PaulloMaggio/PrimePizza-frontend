import { cookies } from 'next/headers';

export async function getCookieServer(): Promise<string | null> {
  const cookieStore = await cookies(); 
  const token = cookieStore.get("session")?.value;

  return token || null;
}
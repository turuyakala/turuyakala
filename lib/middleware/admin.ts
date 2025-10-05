import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login?callbackUrl=/admin');
  }

  const userRole = (session.user as any)?.role;

  if (userRole !== 'admin') {
    redirect('/?error=unauthorized');
  }

  return session;
}

export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return session;
}



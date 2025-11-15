import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function requireAdmin() {
  try {
    const session = await auth();

    if (!session) {
      redirect('/auth/login?callbackUrl=/admin');
    }

    const userRole = (session.user as any)?.role;

    if (userRole !== 'admin') {
      redirect('/?error=unauthorized');
    }

    return session;
  } catch (error) {
    console.error('requireAdmin error:', error);
    redirect('/auth/login?callbackUrl=/admin&error=auth_failed');
  }
}

export async function requireAuth() {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  }

  return session;
}



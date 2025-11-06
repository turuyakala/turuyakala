import { redirect } from 'next/navigation';

export default function AdminPage() {
  // Admin ana sayfasına gidince stats sayfasına yönlendir
  redirect('/admin/stats');
}


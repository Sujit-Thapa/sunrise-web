import type { Metadata } from 'next';

import AdminDashboard from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Sunrise Realestate',
  description: 'Manage Sunrise Realestate property listings.',
};

export default function AdminPage() {
  return <AdminDashboard />;
}

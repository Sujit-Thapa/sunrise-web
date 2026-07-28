import type { Metadata } from 'next';

import AdminPropertyStudio from '@/components/admin/AdminPropertyStudio';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Sunrise Realestate',
  description: 'Manage Sunrise Realestate property listings.',
};

export default function AdminPage() {
  return <AdminPropertyStudio />;
}

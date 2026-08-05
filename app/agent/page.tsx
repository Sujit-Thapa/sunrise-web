import type { Metadata } from 'next';

import AdminPropertyStudio from '@/components/admin/AdminPropertyStudio';

export const metadata: Metadata = {
  title: 'Agent Dashboard | Sunrise Realestate',
  description: 'Manage Sunrise Realestate property listings.',
};

export default function AgentPage() {
  return <AdminPropertyStudio />;
}

import type { Metadata } from 'next';

import AdminPropertyStudio from '@/components/admin/AdminPropertyStudio';

export const metadata: Metadata = {
  title: 'Agent Studio | Sunrise Realestate',
  description: 'Create and manage draft property listings.',
};

export default function AgentPage() {
  return <AdminPropertyStudio />;
}

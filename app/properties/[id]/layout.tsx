import type { Metadata } from 'next';
import { propertiesApi } from '@/lib/backend';

// The page itself loads client-side; this only names the browser tab after the property.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const property = await propertiesApi.findOne(id).catch(() => null);
  return property ? { title: property.title, description: property.description?.slice(0, 160) } : { title: 'Property' };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

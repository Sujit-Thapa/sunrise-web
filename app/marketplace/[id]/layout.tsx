import type { Metadata } from 'next';
import { userPropertiesApi } from '@/lib/backend';

// The page itself loads client-side; this only names the browser tab after the listing.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const listing = await userPropertiesApi.findOne(id).catch(() => null);
  return listing ? { title: listing.title, description: listing.description?.slice(0, 160) } : { title: 'Marketplace listing' };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

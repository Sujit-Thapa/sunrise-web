import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumb({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[13px]">
      <ol className="flex flex-wrap items-center gap-2 text-[#77726b]">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 ? <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" /> : null}
            {item.href ? <Link href={item.href} className="hover:text-[#cc7654]">{item.label}</Link> : <span aria-current="page" className="text-[#2a2723]">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

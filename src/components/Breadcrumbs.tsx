import React from 'react';
import Link from 'next/link';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const schemaList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: '24px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaList) }}
      />
      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', fontSize: '0.875rem' }}>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={item.url} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isLast ? (
                <span style={{ color: 'var(--rg-text-secondary)', fontWeight: 500 }} aria-current="page">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link href={item.url} style={{ color: 'var(--rg-primary)', textDecoration: 'none', fontWeight: 600 }}>
                    {item.name}
                  </Link>
                  <span style={{ color: 'var(--rg-border)', fontSize: '0.8rem' }}>&gt;</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Calculator,
  FileText,
  Building2,
  Receipt,
} from 'lucide-react';

const categories = [
  { id: 'all', name: 'All Services', icon: Briefcase },
  { id: 'ca-services', name: 'CA Services', icon: Calculator },
  { id: 'audit', name: 'Audit', icon: FileText },
  { id: 'registration', name: 'Registration', icon: Building2 },
  { id: 'tax', name: 'Tax Services', icon: Receipt },
];

function CategoryFilterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';

  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === 'all') {
      params.delete('category');
    } else {
      params.set('category', categoryId);
    }
    router.push(`/client/services?${params.toString()}`);
  };

  return (
    <nav className="flex space-x-4 p-4" aria-label="Service categories">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = currentCategory === category.id;

        return (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={`relative flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon
              className={`mr-2 h-5 w-5 flex-shrink-0 ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`}
              aria-hidden="true"
            />
            <span>{category.name}</span>
            {isActive && (
              <motion.div
                layoutId="activeCategory"
                className="absolute inset-x-0 -bottom-px h-0.5 bg-blue-600"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

export function ServiceCategoryFilter() {
  return (
    <div className="bg-white shadow rounded-lg overflow-x-auto">
      <div className="min-w-full">
        <Suspense
          fallback={
            <div className="flex space-x-4 p-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="animate-pulse flex items-center px-3 py-2"
                >
                  <div className="h-5 w-5 bg-gray-200 rounded mr-2" />
                  <div className="h-4 bg-gray-200 rounded w-20" />
                </div>
              ))}
            </div>
          }
        >
          <CategoryFilterContent />
        </Suspense>
      </div>
    </div>
  );
} 
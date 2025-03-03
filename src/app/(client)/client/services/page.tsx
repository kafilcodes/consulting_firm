import { Suspense } from 'react';
import { getServices } from '@/lib/firebase/services';
import { ServiceCard } from '@/components/client/service-card';
import { ServiceCategoryFilter } from '@/components/client/service-category-filter';

async function ServicesList() {
  const services = await getServices();

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-semibold leading-6 text-gray-900">
              Our Services
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Browse our comprehensive range of professional services tailored to your business needs.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <ServiceCategoryFilter />
          
          <div className="mt-6">
            <Suspense
              fallback={
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-72 rounded-lg bg-gray-200 animate-pulse"
                    />
                  ))}
                </div>
              }
            >
              <ServicesList />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
} 
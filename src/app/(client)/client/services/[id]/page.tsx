import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getService } from '@/lib/firebase/services';
import { ServiceDetailHeader } from '@/components/client/service-detail-header';
import { ServiceFeatures } from '@/components/client/service-features';
import { ServiceRequirements } from '@/components/client/service-requirements';
import { ServicePricing } from '@/components/client/service-pricing';
import { ServiceFAQ } from '@/components/client/service-faq';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const service = await getService(params.id);

  if (!service) {
    return {
      title: 'Service Not Found',
    };
  }

  return {
    title: `${service.name} - SKS Consulting`,
    description: service.description,
  };
}

export default async function Page({ params }: PageProps) {
  const service = await getService(params.id);

  if (!service) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Service Header */}
        <ServiceDetailHeader service={service} />

        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Features Section */}
            <ServiceFeatures features={service.features} />

            {/* Requirements Section */}
            <div className="mt-16">
              <ServiceRequirements requirements={service.requirements} />
            </div>

            {/* Deliverables Section */}
            <div className="mt-16">
              <h3 className="text-lg font-semibold text-gray-900">
                What You'll Get
              </h3>
              <ul className="mt-4 space-y-4">
                {service.deliverables.map((deliverable, index) => (
                  <li
                    key={index}
                    className="flex items-start"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      {index + 1}
                    </span>
                    <span className="ml-3 text-sm text-gray-600">
                      {deliverable}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ServicePricing service={service} />
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 mb-16">
          <ServiceFAQ serviceId={service.id} />
        </div>
      </div>
    </div>
  );
} 
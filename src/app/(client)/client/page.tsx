import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const featuredServices = [
  {
    title: 'CA Services',
    description: 'Expert Chartered Accountant services for your business needs.',
    href: '/client/services/ca',
    icon: '📊',
  },
  {
    title: 'Audit Services',
    description: 'Comprehensive audit solutions to ensure compliance and growth.',
    href: '/client/services/audit',
    icon: '📋',
  },
  {
    title: 'Tax Services',
    description: 'Professional tax planning and filing services.',
    href: '/client/services/tax',
    icon: '💰',
  },
  {
    title: 'Business Registration',
    description: 'Streamlined company registration and compliance services.',
    href: '/client/services/registration',
    icon: '🏢',
  },
];

export default function ClientHome() {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-blue-100/20">
        <div className="mx-auto max-w-7xl pb-24 pt-10 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40">
          <div className="px-6 lg:px-0 lg:pt-4">
            <div className="mx-auto max-w-2xl">
              <div className="max-w-lg">
                <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Expert Consulting Solutions for Your Business
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Professional services tailored to your success. From CA services to business consulting, we've got you covered.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link
                    href="/client/services"
                    className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Explore Services
                  </Link>
                  <Link
                    href="/client/contact"
                    className="text-sm font-semibold leading-6 text-gray-900"
                  >
                    Contact Us <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured services section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Professional Services</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to manage your business
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Comprehensive consulting services to help you navigate complex business challenges and achieve your goals.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {featuredServices.map((service) => (
              <div key={service.title} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <span className="text-3xl">{service.icon}</span>
                  {service.title}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{service.description}</p>
                  <p className="mt-6">
                    <Link
                      href={service.href}
                      className="text-sm font-semibold leading-6 text-blue-600 hover:text-blue-500"
                    >
                      Learn more <ArrowRight className="inline-block h-4 w-4" />
                    </Link>
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
} 
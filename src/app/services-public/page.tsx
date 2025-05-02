import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { 
  CheckCircle, 
  ArrowRight,
  Shield, 
  BarChart, 
  FileText, 
  Scale,
  ShieldCheck,
  Clock,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Our Services | SKS Consulting',
  description: 'Explore the range of professional consulting services offered by SKS Consulting to help your business grow.',
};

// Services data with detailed information
const services = [
  {
    id: 'business-registration',
    name: "Business Registration",
    shortDescription: "Streamline your business registration process with our expert guidance and support",
    description: "Our Business Registration service provides comprehensive support to businesses looking to establish their legal identity. We guide you through the entire process of company incorporation, GST registration, obtaining necessary business licenses, and ensuring full regulatory compliance.",
    features: [
      "Company incorporation and registration",
      "GST registration and compliance", 
      "Business licenses and permits", 
      "Regulatory compliance guidance",
      "Legal documentation support"
    ],
    image: "/images/services/business-registration.jpg",
    icon: Scale,
    price: "Starting from ₹9,999",
    duration: "7-14 business days",
    color: 'from-emerald-500 to-teal-600',
    hoverColor: 'group-hover:from-emerald-600 group-hover:to-teal-700'
  },
  {
    id: 'tax-planning',
    name: "Tax Planning",
    shortDescription: "Optimize your tax strategy with comprehensive planning and compliance services",
    description: "Our Tax Planning service helps you minimize tax liability while ensuring full compliance with tax laws. Our experienced tax consultants analyze your financial situation to develop tailored strategies that optimize deductions, credits, and other tax benefits.",
    features: [
      "Tax optimization strategies", 
      "Compliance management", 
      "Deduction planning", 
      "Audit support",
      "Tax filing assistance"
    ],
    image: "/images/services/tax-planning.jpg",
    icon: Shield,
    price: "Starting from ₹7,499",
    duration: "Ongoing service",
    color: 'from-blue-500 to-indigo-600',
    hoverColor: 'group-hover:from-blue-600 group-hover:to-indigo-700'
  },
  {
    id: 'financial-analysis',
    name: "Financial Analysis",
    shortDescription: "Gain valuable insights with our detailed financial analysis and reporting services",
    description: "Our Financial Analysis service provides comprehensive evaluation of your business's financial health. We analyze profitability, cash flow, assets, and other key financial metrics to give you actionable insights for informed decision-making.",
    features: [
      "Profitability analysis", 
      "Cash flow management", 
      "Financial forecasting", 
      "Investment planning",
      "Risk assessment"
    ],
    image: "/images/services/financial-analysis.jpg",
    icon: BarChart,
    price: "Starting from ₹14,999",
    duration: "2-3 weeks",
    color: 'from-amber-500 to-orange-600',
    hoverColor: 'group-hover:from-amber-600 group-hover:to-orange-700'
  },
  {
    id: 'audit-assurance',
    name: "Audit & Assurance",
    shortDescription: "Ensure compliance and transparency with our thorough audit and assurance services",
    description: "Our Audit & Assurance service provides independent verification of your financial statements and business processes. Our auditors conduct thorough examinations to ensure accuracy, compliance with standards, and identify areas for improvement.",
    features: [
      "Statutory audits", 
      "Internal audits", 
      "Process audits", 
      "Compliance reviews",
      "Risk assessment"
    ],
    image: "/images/services/audit-assurance.jpg",
    icon: FileText,
    price: "Starting from ₹19,999",
    duration: "3-5 weeks",
    color: 'from-purple-500 to-fuchsia-600',
    hoverColor: 'group-hover:from-purple-600 group-hover:to-fuchsia-700'
  },
  {
    id: 'business-advisory',
    name: "Business Advisory",
    shortDescription: "Transform your business with strategic advisory services tailored to your goals",
    description: "Our Business Advisory service provides strategic guidance to help you navigate challenges, capitalize on opportunities, and achieve sustainable growth. Our advisors work closely with you to develop customized strategies aligned with your business objectives.",
    features: [
      "Growth strategies", 
      "Business restructuring", 
      "Market entry planning", 
      "Risk management",
      "Performance optimization"
    ],
    image: "/images/services/business-advisory.jpg",
    icon: ShieldCheck,
    price: "Starting from ₹24,999",
    duration: "Customized engagement",
    color: 'from-pink-500 to-rose-600',
    hoverColor: 'group-hover:from-pink-600 group-hover:to-rose-700'
  },
  {
    id: 'legal-compliance',
    name: "Legal Compliance",
    shortDescription: "Navigate complex regulations with our comprehensive legal compliance services",
    description: "Our Legal Compliance service helps businesses navigate the complex landscape of laws and regulations. We ensure that your organization meets all legal requirements, reducing risk and avoiding potential penalties or legal issues.",
    features: [
      "Contract reviews", 
      "Legal documentation", 
      "Compliance training", 
      "Regulatory updates",
      "Legal risk management"
    ],
    image: "/images/services/legal-compliance.jpg",
    icon: Scale,
    price: "Starting from ₹12,999",
    duration: "Ongoing service",
    color: 'from-indigo-500 to-violet-600',
    hoverColor: 'group-hover:from-indigo-600 group-hover:to-violet-700'
  },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Our Services</span>
                <span className="block text-blue-600">Professional Solutions for Your Business</span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
                Comprehensive consulting services designed to help your business thrive in today's competitive landscape.
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div 
                  key={service.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={service.image || "/images/services/default.jpg"}
                      alt={service.name}
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-4">
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-800">
                        <Clock className="mr-1 h-3 w-3" />
                        {service.duration}
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${service.color}`}>
                        <service.icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="ml-3 text-xl font-bold text-gray-900">{service.name}</h3>
                    </div>
                    <p className="text-gray-600 mb-6">{service.shortDescription}</p>
                    <div className="mb-6">
                      <div className="flex items-center mb-2">
                        <Briefcase className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-gray-700 font-medium">{service.price}</span>
                      </div>
                      <ul className="space-y-2 mt-4">
                        {service.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <Link href={`/services/${service.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center">
                        View Details
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                      <Button 
                        asChild
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Link href={`/auth/sign-in?callbackUrl=${encodeURIComponent(`/client/dashboard`)}`}>
                          Order Service
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Why Choose Our Services</h2>
              <p className="mt-4 text-xl text-gray-600">
                We're committed to delivering exceptional service and tangible results
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Expertise & Experience</h3>
                <p className="text-gray-600">
                  Our team consists of industry experts with decades of combined experience across various business domains.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Client-Focused Approach</h3>
                <p className="text-gray-600">
                  We tailor our services to meet your specific needs, ensuring solutions that align perfectly with your business goals.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <BarChart className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Measurable Results</h3>
                <p className="text-gray-600">
                  We focus on delivering quantifiable outcomes that demonstrate clear value and return on investment.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
} 
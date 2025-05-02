import Image from 'next/image';
import { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { FileCheck, Award, Users, TrendingUp, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | SKS Consulting',
  description: 'Learn about SKS Consulting - our mission, vision, and the team behind our premium consulting services.',
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-blue-50 to-white py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">About</span>
                <span className="block text-blue-600">SKS Consulting</span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
                Empowering businesses with premium consulting services since 2010
              </p>
            </div>

            <div className="relative">
              <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-xl">
                <Image
                  src="/images/pexels-n-voitkevich-8927456.jpg"
                  alt="SKS Consulting team meeting"
                  className="object-cover"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 90vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                  Our Story
                </h2>
                <div className="mt-6 text-lg text-gray-600 space-y-6">
                  <p>
                    Founded in 2010, SKS Consulting began with a single mission: to provide businesses with expert guidance that delivers tangible results. What started as a small team of dedicated professionals has grown into a comprehensive consulting firm serving clients across industries.
                  </p>
                  <p>
                    Our journey has been defined by a commitment to excellence, integrity, and continuous innovation. We've evolved our services to meet the changing landscape of business challenges while maintaining our core values.
                  </p>
                  <p>
                    Today, SKS Consulting stands as a trusted partner to businesses looking to optimize operations, navigate complex regulations, and achieve sustainable growth.
                  </p>
                </div>
              </div>
              <div className="mt-10 lg:mt-0 grid grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <FileCheck className="h-10 w-10 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900">1000+</h3>
                  <p className="mt-2 text-gray-600">Projects Completed</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <Users className="h-10 w-10 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900">500+</h3>
                  <p className="mt-2 text-gray-600">Satisfied Clients</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <Award className="h-10 w-10 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900">12+</h3>
                  <p className="mt-2 text-gray-600">Years of Excellence</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <TrendingUp className="h-10 w-10 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900">95%</h3>
                  <p className="mt-2 text-gray-600">Client Retention</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Our Core Values
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                The principles that guide our work and relationships
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Excellence</h3>
                <p className="text-gray-600">
                  We strive for excellence in every aspect of our work, delivering solutions that exceed expectations and set new standards in the industry.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Integrity</h3>
                <p className="text-gray-600">
                  We operate with complete transparency and ethical standards, building trust through honest communication and responsible actions.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Innovation</h3>
                <p className="text-gray-600">
                  We embrace change and continuously seek innovative approaches to solve complex business challenges in an evolving marketplace.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Our Leadership Team
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Meet the experts behind SKS Consulting
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden mb-6">
                  <Image
                    src="/images/team/leader-1.jpg"
                    alt="CEO portrait"
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 30vw, 192px"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Rajiv Sharma</h3>
                <p className="text-blue-600 font-medium">CEO & Founder</p>
                <p className="mt-4 text-gray-600">
                  With over 20 years of experience in financial consulting, Rajiv leads our team with vision and expertise.
                </p>
              </div>

              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden mb-6">
                  <Image
                    src="/images/team/leader-2.jpg"
                    alt="COO portrait"
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 30vw, 192px"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Priya Patel</h3>
                <p className="text-blue-600 font-medium">Chief Operating Officer</p>
                <p className="mt-4 text-gray-600">
                  Priya brings strategic insight and operational excellence to ensure we deliver exceptional results for our clients.
                </p>
              </div>

              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden mb-6">
                  <Image
                    src="/images/team/leader-3.jpg"
                    alt="CTO portrait"
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 30vw, 192px"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Amit Verma</h3>
                <p className="text-blue-600 font-medium">Chief Financial Advisor</p>
                <p className="mt-4 text-gray-600">
                  Amit leads our financial advisory services with deep expertise in tax planning and regulatory compliance.
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
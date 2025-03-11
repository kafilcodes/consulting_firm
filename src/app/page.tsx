'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useAppSelector } from '@/store';

const carouselItems = [
  {
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
    title: 'Tax Made Simple',
    description: 'Let us handle the complexities of tax while you focus on growing your business',
  },
  {
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf',
    title: 'Strategic Consulting',
    description: 'Transform your business with our expert consulting services',
  },
  {
    image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07',
    title: 'Professional Audit',
    description: 'Comprehensive audit services to ensure your business compliance',
  },
];

const services = [
  {
    title: 'Tax Services',
    description: 'Tax is tedious. Connect with us for easy and compliant tax solutions.',
    features: ['Tax Planning', 'GST Filing', 'Income Tax Returns'],
  },
  {
    title: 'Business Registration',
    description: 'Start your business journey with proper registration and compliance.',
    features: ['Company Registration', 'GST Registration', 'MSME Registration'],
  },
  {
    title: 'Audit & Assurance',
    description: 'Ensure your business meets all regulatory requirements.',
    features: ['Statutory Audit', 'Internal Audit', 'Compliance Audit'],
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col">
        {/* Hero Section */}
        <section className="relative isolate px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              {user ? (
                <>
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                    Welcome back, {user.displayName || 'valued client'}!
                  </h1>
                  <p className="mt-6 text-lg leading-8 text-gray-600">
                    Access your personalized dashboard to manage your projects and services. We're here to help you succeed.
                  </p>
                  <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link
                      href={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                      className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Go to Dashboard
                    </Link>
                    <Link
                      href="/services"
                      className="text-sm font-semibold leading-6 text-gray-900"
                    >
                      View Our Services <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                    Professional Consulting Services
                  </h1>
                  <p className="mt-6 text-lg leading-8 text-gray-600">
                    Expert guidance and solutions tailored to your business needs. Join us to transform your ideas into success.
                  </p>
                  <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link
                      href="/auth/sign-up"
                      className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Get Started
                    </Link>
                    <Link
                      href="/services"
                      className="text-sm font-semibold leading-6 text-gray-900"
                    >
                      Learn More <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </section>

        {/* Hero Carousel */}
        <div className="relative h-[600px] w-full overflow-hidden">
          {carouselItems.map((item, index) => (
            <motion.div
              key={index}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{
                opacity: currentSlide === index ? 1 : 0,
                transition: { duration: 0.5 },
              }}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                priority={index === 0}
                quality={85}
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-6xl font-bold mb-4"
                  >
                    {item.title}
                  </motion.h1>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl md:text-2xl mb-8"
                  >
                    {item.description}
                  </motion.p>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Link
                      href="/auth/sign-in"
                      className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Services Section */}
        <section id="services" className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Our Services
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Comprehensive solutions tailored to your business needs
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                  <p className="text-gray-600 mb-6">{service.description}</p>
                  <ul className="space-y-3">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-gray-700">
                        <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth/sign-in"
                    className="inline-flex items-center mt-6 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Learn more
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
} 
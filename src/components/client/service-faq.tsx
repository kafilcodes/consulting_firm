'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'What documents do I need to provide?',
    answer: 'The required documents vary depending on the service. Once you place an order, we will provide you with a detailed checklist of all necessary documents. Generally, you will need identification proof, business registration documents, and relevant financial statements.',
  },
  {
    question: 'How long does the process take?',
    answer: 'The processing time varies by service type and complexity. Most services are completed within 7-14 business days. For urgent requests, please contact our support team.',
  },
  {
    question: 'What if I need modifications or have questions?',
    answer: 'You can communicate directly with our team through the client portal. We offer unlimited revisions during the service period to ensure your complete satisfaction.',
  },
  {
    question: 'Are my documents secure?',
    answer: 'Yes, we use industry-standard encryption and secure storage solutions. Your documents are protected by strict confidentiality protocols and access controls.',
  },
];

interface ServiceFAQProps {
  serviceId: string;
}

export function ServiceFAQ({ serviceId }: ServiceFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">
        Frequently Asked Questions
      </h2>
      <dl className="space-y-6">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={false}
            className="border-b border-gray-200 pb-6"
          >
            <dt>
              <button
                className="flex w-full items-start justify-between text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-base font-semibold leading-7 text-gray-900">
                  {faq.question}
                </span>
                <span className="ml-6 flex h-7 items-center">
                  <ChevronDown
                    className={`h-6 w-6 transform text-gray-600 transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </span>
              </button>
            </dt>
            <AnimatePresence>
              {openIndex === index && (
                <motion.dd
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 overflow-hidden"
                >
                  <p className="text-base leading-7 text-gray-600">
                    {faq.answer}
                  </p>
                </motion.dd>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </dl>
    </div>
  );
} 
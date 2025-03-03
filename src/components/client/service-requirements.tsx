'use client';

import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

interface ServiceRequirementsProps {
  requirements: string[];
}

export function ServiceRequirements({ requirements }: ServiceRequirementsProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">
        What You Need to Provide
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        To ensure smooth service delivery, please have the following ready:
      </p>
      <div className="mt-6">
        <ul role="list" className="space-y-4">
          {requirements.map((requirement, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start"
            >
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                  <FileText className="h-5 w-5 text-blue-600" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{requirement}</p>
                {index === 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    You can upload these documents during the order process
                  </p>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
      <div className="mt-8 rounded-md bg-blue-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Need help with documents?
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Our team can guide you through the document requirements. Feel free to
                reach out through chat or contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
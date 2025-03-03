'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ServiceFeaturesProps {
  features: string[];
}

export function ServiceFeatures({ features }: ServiceFeaturesProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">
        Service Features
      </h2>
      <div className="mt-6">
        <ul role="list" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map((feature, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start"
            >
              <div className="flex-shrink-0">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100">
                  <Check className="h-4 w-4 text-blue-600" aria-hidden="true" />
                </div>
              </div>
              <p className="ml-3 text-sm leading-6 text-gray-600">{feature}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
} 
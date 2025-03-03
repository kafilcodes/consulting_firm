import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DocumentCategory } from '@/types';

const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string; description: string }[] = [
  {
    value: 'contract',
    label: 'Contracts',
    description: 'Service agreements, terms and conditions, and other contractual documents',
  },
  {
    value: 'invoice',
    label: 'Invoices',
    description: 'Bills, receipts, and payment-related documents',
  },
  {
    value: 'report',
    label: 'Reports',
    description: 'Progress reports, analysis documents, and other deliverables',
  },
  {
    value: 'identification',
    label: 'Identification',
    description: 'ID proofs, business registration, and other verification documents',
  },
  {
    value: 'financial',
    label: 'Financial',
    description: 'Financial statements, tax documents, and other monetary records',
  },
  {
    value: 'legal',
    label: 'Legal',
    description: 'Legal documents, certificates, and compliance-related files',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Miscellaneous documents that don\'t fit other categories',
  },
];

interface DocumentCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (category: DocumentCategory) => void;
  fileName: string;
}

export function DocumentCategoryModal({
  isOpen,
  onClose,
  onSelect,
  fileName,
}: DocumentCategoryModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg"
              >
                <Dialog.Title className="text-lg font-semibold text-gray-900">
                  Select Document Category
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-sm text-gray-500">
                  Choose a category for: {fileName}
                </Dialog.Description>

                <div className="mt-6 space-y-4">
                  {DOCUMENT_CATEGORIES.map((category) => (
                    <motion.button
                      key={category.value}
                      onClick={() => {
                        onSelect(category.value);
                        onClose();
                      }}
                      className="w-full rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <h3 className="text-sm font-medium text-gray-900">
                        {category.label}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        {category.description}
                      </p>
                    </motion.button>
                  ))}
                </div>

                <Dialog.Close asChild>
                  <button
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </Dialog.Close>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
} 
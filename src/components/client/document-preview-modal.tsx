import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ExternalLink, FileText } from 'lucide-react';
import type { OrderDocument } from '@/types';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: OrderDocument | null;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  document,
}: DocumentPreviewModalProps) {
  const [isLoading, setIsLoading] = React.useState(true);

  const isPreviewable = React.useMemo(() => {
    if (!document) return false;
    return (
      document.type.startsWith('image/') ||
      document.type === 'application/pdf'
    );
  }, [document]);

  const renderPreview = () => {
    if (!document) return null;

    if (document.type.startsWith('image/')) {
      return (
        <div className="relative w-full h-full min-h-[400px] bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={document.url}
            alt={document.name}
            className="w-full h-full object-contain"
            onLoad={() => setIsLoading(false)}
          />
          {isLoading && <PreviewLoader />}
        </div>
      );
    }

    if (document.type === 'application/pdf') {
      return (
        <div className="relative w-full h-full min-h-[600px] bg-gray-100 rounded-lg overflow-hidden">
          <iframe
            src={`${document.url}#toolbar=0`}
            className="w-full h-full"
            onLoad={() => setIsLoading(false)}
          />
          {isLoading && <PreviewLoader />}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-100 rounded-lg">
        <FileText className="h-16 w-16 text-gray-400" />
        <p className="mt-4 text-sm text-gray-500">
          Preview not available for this file type
        </p>
      </div>
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && document && (
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
                className="fixed left-[50%] top-[50%] max-h-[90vh] w-[90vw] max-w-[1000px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Dialog.Title className="text-lg font-semibold text-gray-900">
                      {document.name}
                    </Dialog.Title>
                    <Dialog.Description className="mt-1 text-sm text-gray-500">
                      {(document.size / 1024 / 1024).toFixed(2)} MB • {document.type}
                    </Dialog.Description>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={document.url}
                      download={document.name}
                      className="p-2 text-gray-400 hover:text-gray-500 transition-colors"
                      title="Download"
                    >
                      <Download className="h-5 w-5" />
                    </a>
                    <a
                      href={document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-gray-500 transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                    <Dialog.Close asChild>
                      <button
                        className="p-2 text-gray-400 hover:text-gray-500 transition-colors"
                        aria-label="Close"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </Dialog.Close>
                  </div>
                </div>

                <div className="relative overflow-auto">
                  {renderPreview()}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function PreviewLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
} 
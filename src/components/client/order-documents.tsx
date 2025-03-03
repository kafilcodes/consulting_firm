'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  Search, 
  CheckCircle,
  ArrowUpDown,
  Calendar,
  FileIcon,
  Database
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { uploadOrderDocument, deleteOrderDocument } from '@/lib/firebase/storage';
import type { OrderDocument, DocumentCategory } from '@/types';
import { DocumentCategoryModal } from './document-category-modal';
import { DocumentPreviewModal } from './document-preview-modal';

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: 'contract', label: 'Contracts' },
  { value: 'invoice', label: 'Invoices' },
  { value: 'report', label: 'Reports' },
  { value: 'identification', label: 'Identification' },
  { value: 'financial', label: 'Financial' },
  { value: 'legal', label: 'Legal' },
  { value: 'other', label: 'Other' },
];

type SortField = 'name' | 'date' | 'size' | 'category';
type SortOrder = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  order: SortOrder;
}

const SORT_ICONS = {
  name: FileIcon,
  date: Calendar,
  size: Database,
  category: ArrowUpDown,
};

const KEYBOARD_SHORTCUTS = [
  { key: '/', description: 'Focus search' },
  { key: 'a', description: 'Select/Deselect all', modifier: 'ctrl' },
  { key: 'Delete', description: 'Delete selected', modifier: 'ctrl' },
  { key: 'd', description: 'Download selected', modifier: 'ctrl' },
  { key: 'Escape', description: 'Clear selection' },
] as const;

interface OrderDocumentsProps {
  orderId: string;
  documents: OrderDocument[];
  onDocumentUpdate: () => void;
}

export function OrderDocuments({ orderId, documents, onDocumentUpdate }: OrderDocumentsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previewDocument, setPreviewDocument] = useState<OrderDocument | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<SortConfig>({ field: 'date', order: 'desc' });
  const [showShortcuts, setShowShortcuts] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Focus search with '/'
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Select/Deselect all with Ctrl+A
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSelectAll();
      }

      // Delete selected with Ctrl+Delete
      if (e.key === 'Delete' && (e.ctrlKey || e.metaKey) && selectedDocuments.size > 0) {
        e.preventDefault();
        handleBatchDelete();
      }

      // Download selected with Ctrl+D
      if (e.key === 'd' && (e.ctrlKey || e.metaKey) && selectedDocuments.size > 0) {
        e.preventDefault();
        handleBatchDownload();
      }

      // Clear selection with Escape
      if (e.key === 'Escape') {
        setSelectedDocuments(new Set());
        if (document.activeElement === searchInputRef.current) {
          searchInputRef.current.blur();
        }
      }

      // Toggle shortcuts help with '?'
      if (e.key === '?' && (e.shiftKey)) {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDocuments]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      await processFiles(files);
      e.target.value = '';
    }
  };

  const processFiles = async (files: File[]) => {
    const invalidFiles = files.filter(
      file => !ALLOWED_FILE_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE
    );

    if (invalidFiles.length > 0) {
      toast.error('Some files were not uploaded due to invalid type or size');
      return;
    }

    setPendingFiles(files);
    setCurrentFile(files[0]);
    setCategoryModalOpen(true);
  };

  const handleCategorySelect = async (category: DocumentCategory) => {
    if (!currentFile) return;

    setIsUploading(true);
    try {
      await uploadOrderDocument(orderId, currentFile, category);
      
      // Process next file if there are more
      const remainingFiles = pendingFiles.filter(f => f !== currentFile);
      if (remainingFiles.length > 0) {
        setPendingFiles(remainingFiles);
        setCurrentFile(remainingFiles[0]);
        setCategoryModalOpen(true);
      } else {
        setPendingFiles([]);
        setCurrentFile(null);
        onDocumentUpdate();
      }
      
      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      await deleteOrderDocument(orderId, documentId);
      onDocumentUpdate();
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleSelectDocument = (documentId: string) => {
    setSelectedDocuments(prev => {
      const next = new Set(prev);
      if (next.has(documentId)) {
        next.delete(documentId);
      } else {
        next.add(documentId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedDocuments.size === filteredDocuments.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(filteredDocuments.map(doc => doc.id)));
    }
  };

  const handleBatchDelete = async () => {
    if (!selectedDocuments.size) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedDocuments.size} document${
        selectedDocuments.size === 1 ? '' : 's'
      }?`
    );

    if (!confirmDelete) return;

    try {
      await Promise.all(
        Array.from(selectedDocuments).map(id => deleteOrderDocument(orderId, id))
      );
      onDocumentUpdate();
      setSelectedDocuments(new Set());
      toast.success('Documents deleted successfully');
    } catch (error) {
      console.error('Error deleting documents:', error);
      toast.error('Failed to delete some documents');
    }
  };

  const handleBatchDownload = async () => {
    if (!selectedDocuments.size) return;

    const selectedDocs = filteredDocuments.filter(doc => selectedDocuments.has(doc.id));
    
    // For single document, use native download
    if (selectedDocs.length === 1) {
      const link = document.createElement('a');
      link.href = selectedDocs[0].url;
      link.download = selectedDocs[0].name;
      link.click();
      return;
    }

    // For multiple documents, download in sequence
    toast.loading('Preparing downloads...', { duration: 1000 });
    selectedDocs.forEach((doc, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = doc.url;
        link.download = doc.name;
        link.click();
      }, index * 500); // Stagger downloads to prevent browser issues
    });
  };

  const handleSort = (field: SortField) => {
    setSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredDocuments = useMemo(() => {
    return documents
      .filter(doc => 
        (selectedCategory === 'all' || doc.category === selectedCategory) &&
        (searchQuery === '' || 
          doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          DOCUMENT_CATEGORIES.find(cat => cat.value === doc.category)?.label
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
      )
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }, [documents, selectedCategory, searchQuery]);

  const sortedAndFilteredDocuments = useMemo(() => {
    const filtered = documents.filter(doc => 
      (selectedCategory === 'all' || doc.category === selectedCategory) &&
      (searchQuery === '' || 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        DOCUMENT_CATEGORIES.find(cat => cat.value === doc.category)?.label
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    );

    return filtered.sort((a, b) => {
      const multiplier = sort.order === 'asc' ? 1 : -1;
      
      switch (sort.field) {
        case 'name':
          return multiplier * a.name.localeCompare(b.name);
        case 'date':
          return multiplier * (new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        case 'size':
          return multiplier * (a.size - b.size);
        case 'category':
          return multiplier * a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });
  }, [documents, selectedCategory, searchQuery, sort]);

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
          <button
            onClick={() => setShowShortcuts(prev => !prev)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
            title="Show keyboard shortcuts (Shift + ?)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search documents... (/)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as DocumentCategory | 'all')}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {DOCUMENT_CATEGORIES.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          <label className="relative cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md">
            <span>Upload</span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept={ALLOWED_FILE_TYPES.join(',')}
            />
          </label>
        </div>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        {isUploading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-gray-500">Uploading...</span>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Drag and drop files here, or click Upload
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Maximum file size: 10MB. Supported formats: PDF, Word, Excel, Images
            </p>
          </div>
        )}
      </div>

      {showShortcuts && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <h4 className="text-sm font-medium text-gray-900 mb-2">Keyboard Shortcuts</h4>
          <div className="grid grid-cols-2 gap-2">
            {KEYBOARD_SHORTCUTS.map(({ key, description, modifier }) => (
              <div key={key} className="flex items-center text-sm text-gray-600">
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
                  {modifier && <span>{modifier} + </span>}
                  {key}
                </kbd>
                <span className="ml-2">{description}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {selectedDocuments.size > 0 && (
        <div className="flex items-center justify-between bg-blue-50 px-4 py-2 rounded-lg mb-4">
          <span className="text-sm text-blue-700">
            {selectedDocuments.size} document{selectedDocuments.size === 1 ? '' : 's'} selected
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBatchDownload}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Download
            </button>
            <button
              onClick={handleBatchDelete}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {sortedAndFilteredDocuments.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
            <button
              onClick={handleSelectAll}
              className="text-sm text-gray-600 hover:text-gray-700"
            >
              {selectedDocuments.size === sortedAndFilteredDocuments.length
                ? 'Deselect All'
                : 'Select All'}
            </button>
            <div className="flex items-center space-x-4">
              {(Object.entries(SORT_ICONS) as [SortField, any][]).map(([field, Icon]) => (
                <button
                  key={field}
                  onClick={() => handleSort(field)}
                  className={`flex items-center space-x-1 text-sm ${
                    sort.field === field
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title={`Sort by ${field}`}
                >
                  <Icon className="h-4 w-4" />
                  {sort.field === field && (
                    <ArrowUpDown className={`h-3 w-3 transform ${
                      sort.order === 'asc' ? 'rotate-0' : 'rotate-180'
                    }`} />
                  )}
                </button>
              ))}
              <span className="text-sm text-gray-500">
                {sortedAndFilteredDocuments.length} document{sortedAndFilteredDocuments.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        )}

        <AnimatePresence>
          {sortedAndFilteredDocuments.map((document) => (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex items-center justify-between p-4 bg-white rounded-lg shadow transition-colors ${
                selectedDocuments.has(document.id) ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleSelectDocument(document.id)}
                  className={`p-1 rounded-full transition-colors ${
                    selectedDocuments.has(document.id)
                      ? 'text-blue-500 bg-blue-100'
                      : 'text-gray-400 hover:text-gray-500'
                  }`}
                >
                  <CheckCircle className="h-5 w-5" />
                </button>
                <FileText className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{document.name}</p>
                  <p className="text-xs text-gray-500">
                    {DOCUMENT_CATEGORIES.find(cat => cat.value === document.category)?.label || 'Other'} •{' '}
                    {(document.size / 1024 / 1024).toFixed(2)} MB •{' '}
                    {new Date(document.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPreviewDocument(document)}
                  className="p-2 text-gray-400 hover:text-gray-500"
                  title="Preview"
                >
                  <Eye className="h-5 w-5" />
                </button>
                <a
                  href={document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-gray-500"
                  download
                >
                  <Download className="h-5 w-5" />
                </a>
                <button
                  onClick={() => handleDelete(document.id)}
                  className="p-2 text-red-400 hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {sortedAndFilteredDocuments.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery
                ? 'No documents match your search'
                : 'Upload documents to get started'}
            </p>
          </div>
        )}
      </div>

      <DocumentCategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSelect={handleCategorySelect}
        fileName={currentFile?.name || ''}
      />

      <DocumentPreviewModal
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
        document={previewDocument}
      />
    </div>
  );
} 
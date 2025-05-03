import { Service, ServiceCategory, DocumentCategory } from "@/types";

// Service categories with detailed information
export const serviceCategories: ServiceCategory[] = [
  {
    id: 'ca-services',
    name: 'CA Services',
    description: 'Comprehensive chartered accountant services for businesses and individuals',
  },
  {
    id: 'audit',
    name: 'Audit Services',
    description: 'Professional audit services to ensure compliance and transparency',
  },
  {
    id: 'tax',
    name: 'Tax Services',
    description: 'Expert tax planning, preparation, and filing services',
  },
  {
    id: 'registration',
    name: 'Business Registration',
    description: 'Complete business registration and incorporation services',
  },
  {
    id: 'consulting',
    name: 'Business Consulting',
    description: 'Strategic business advisory and consulting services',
  }
];

// Required document types by service category
export const requiredDocumentsByCategory: Record<string, {
  category: DocumentCategory,
  name: string,
  description: string,
  required: boolean
}[]> = {
  'ca-services': [
    {
      category: 'financial',
      name: 'Bank Statements',
      description: 'Last 6 months of bank statements',
      required: true
    },
    {
      category: 'financial',
      name: 'Previous Year Financial Statements',
      description: 'Balance sheet and profit/loss statements',
      required: true
    },
    {
      category: 'identification',
      name: 'Identity Proof',
      description: 'Valid government-issued ID (Aadhaar, PAN, etc.)',
      required: true
    }
  ],
  'audit': [
    {
      category: 'financial',
      name: 'Company Financial Records',
      description: 'Complete financial statements for the audit period',
      required: true
    },
    {
      category: 'financial',
      name: 'Bank Reconciliation Statements',
      description: 'Bank reconciliation for all accounts',
      required: true
    },
    {
      category: 'financial',
      name: 'Tax Returns',
      description: 'Previous tax returns',
      required: true
    },
    {
      category: 'legal',
      name: 'Corporate Documents',
      description: 'Company incorporation documents, bylaws, etc.',
      required: true
    }
  ],
  'tax': [
    {
      category: 'financial',
      name: 'Income Statements',
      description: 'All income sources documentation',
      required: true
    },
    {
      category: 'financial',
      name: 'Expense Records',
      description: 'Receipts and proof of business expenses',
      required: true
    },
    {
      category: 'identification',
      name: 'PAN Card',
      description: 'Permanent Account Number card',
      required: true
    },
    {
      category: 'financial',
      name: 'Investment Proofs',
      description: 'Documentation of all investment for tax deductions',
      required: false
    }
  ],
  'registration': [
    {
      category: 'identification',
      name: 'ID Proofs of Directors/Partners',
      description: 'Government-issued IDs of all business owners',
      required: true
    },
    {
      category: 'legal',
      name: 'Address Proof for Business',
      description: 'Rent agreement or ownership documents for business location',
      required: true
    },
    {
      category: 'legal',
      name: 'Partnership Deed / MOA / AOA',
      description: 'Business formation documents',
      required: true
    }
  ],
  'consulting': [
    {
      category: 'financial',
      name: 'Current Financial Position',
      description: 'Latest financial statements and projections',
      required: true
    },
    {
      category: 'report',
      name: 'Business Plan',
      description: 'Current business plan if available',
      required: false
    },
    {
      category: 'report',
      name: 'Market Analysis',
      description: 'Any existing market research or analysis',
      required: false
    }
  ]
};

// Comprehensive service data with detailed information
export const servicesData: Service[] = [
  {
    id: 'ca-001',
    name: 'Business Accounting Services',
    shortDescription: 'Complete accounting services for small to medium businesses',
    description: 'Our comprehensive business accounting services cover all aspects of your financial record-keeping needs. We handle bookkeeping, financial statement preparation, reconciliation, and financial reporting to ensure your business maintains accurate and compliant financial records.',
    category: 'ca-services',
    serviceType: 'plan',
    price: {
      amount: 24999,
      currency: 'INR',
      billingType: 'monthly'
    },
    features: [
      'Monthly bookkeeping and account reconciliation',
      'Preparation of financial statements',
      'Maintenance of general ledger',
      'Accounts payable and receivable management',
      'Financial ratio analysis and reporting',
      'Dedicated accountant for your business'
    ],
    requirements: [
      'Access to accounting records and financial documents',
      'Bank statements for the past 6 months',
      'List of all income sources and expenses',
      'Previous financial statements (if available)'
    ],
    deliverables: [
      'Monthly financial statements',
      'Quarterly financial analysis reports',
      'Year-end financial package',
      'Tax-ready financial documentation'
    ],
    estimatedDuration: '1-2 weeks setup, ongoing service',
    image: '/images/services/accounting.jpg'
  },
  {
    id: 'ca-002',
    name: 'Tax Planning and Strategy',
    shortDescription: 'Strategic tax planning to minimize liabilities and maximize savings',
    description: 'Our tax planning and strategy service helps businesses and individuals identify opportunities to minimize tax liabilities while ensuring full compliance with tax laws. We create customized tax strategies based on your specific financial situation to help you keep more of what you earn.',
    category: 'tax',
    serviceType: 'plan',
    price: {
      amount: 15999,
      currency: 'INR',
      billingType: 'one-time'
    },
    features: [
      'Comprehensive tax situation analysis',
      'Identification of tax-saving opportunities',
      'Strategic tax planning',
      'Deduction and credit optimization',
      'Business structure tax efficiency review',
      'Year-round tax advice and support'
    ],
    requirements: [
      'Previous tax returns (last 2-3 years)',
      'Current income and expense information',
      'Investment and asset documentation',
      'Business structure details (if applicable)'
    ],
    deliverables: [
      'Detailed tax planning strategy document',
      'Projected tax savings analysis',
      'Implementation roadmap',
      'Quarterly tax planning updates'
    ],
    estimatedDuration: '2-3 weeks',
    image: '/images/services/tax-planning.jpg'
  },
  {
    id: 'aud-001',
    name: 'Comprehensive Business Audit',
    shortDescription: 'Thorough audit services for regulatory compliance and financial transparency',
    description: 'Our comprehensive business audit service examines your financial statements, internal controls, and accounting practices to ensure accuracy, compliance, and transparency. We identify potential issues and provide recommendations to strengthen your financial reporting and processes.',
    category: 'audit',
    serviceType: 'plan',
    price: {
      amount: 49999,
      currency: 'INR',
      billingType: 'one-time'
    },
    features: [
      'Financial statement audit and verification',
      'Internal control assessment',
      'Compliance with accounting standards evaluation',
      'Risk assessment and recommendations',
      'Fraud detection procedures',
      'Post-audit consultation and strategy'
    ],
    requirements: [
      'Complete financial statements for audit period',
      'Chart of accounts and accounting policies',
      'Bank statements and reconciliations',
      'Fixed asset register and depreciation schedules',
      'Minutes of board meetings',
      'Previous audit reports (if any)'
    ],
    deliverables: [
      'Detailed audit report with findings',
      'Management letter with recommendations',
      'Audited financial statements',
      'Presentation of findings to management/board',
      'Regulatory compliance documentation'
    ],
    estimatedDuration: '4-6 weeks',
    image: '/images/services/audit.jpg'
  },
  {
    id: 'reg-001',
    name: 'Company Incorporation & Registration',
    shortDescription: 'Complete business registration and incorporation services for new ventures',
    description: 'Our company registration service handles all aspects of legally establishing your business entity. From selecting the optimal business structure to completing all necessary filings with government authorities, we ensure your business is properly registered and compliant from day one.',
    category: 'registration',
    serviceType: 'plan',
    price: {
      amount: 19999,
      currency: 'INR',
      billingType: 'one-time'
    },
    features: [
      'Business structure consultation and selection',
      'Company name availability search',
      'Preparation of MOA and AOA',
      'Filing with Registrar of Companies',
      'Obtaining Certificate of Incorporation',
      'Tax registration (GST, PAN, TAN)',
      'Post-incorporation compliance setup'
    ],
    requirements: [
      'ID proofs of all directors/partners',
      'Address proof for registered office',
      'Digital signatures of all directors',
      'Business activity details',
      'Initial capital investment information'
    ],
    deliverables: [
      'Certificate of Incorporation',
      'Company PAN and TAN',
      'GST registration certificate',
      'Digital company records and statutory registers',
      'Post-incorporation compliance checklist'
    ],
    estimatedDuration: '2-3 weeks',
    image: '/images/services/company-registration.jpg'
  },
  {
    id: 'tax-001',
    name: 'GST Registration & Compliance',
    shortDescription: 'Complete GST registration and ongoing compliance management',
    description: 'Our GST registration and compliance service takes care of registering your business for Goods and Services Tax and ensures ongoing compliance with all GST regulations. We handle monthly/quarterly return filing, input tax credit management, and keep you updated on regulatory changes.',
    category: 'tax',
    serviceType: 'one-time',
    price: {
      amount: 9999,
      currency: 'INR',
      billingType: 'one-time'
    },
    features: [
      'GST registration application preparation and filing',
      'GST compliance assessment',
      'Monthly/quarterly return filing',
      'Input tax credit reconciliation',
      'GST audit assistance',
      'GST notice handling and resolution'
    ],
    requirements: [
      'Business PAN card and registration documents',
      'Bank account details',
      'Digital signature of authorized signatory',
      'Business address proof',
      'Sale and purchase invoices'
    ],
    deliverables: [
      'GST registration certificate',
      'Regular filing of GST returns',
      'Monthly GST compliance reports',
      'Input tax credit optimization recommendations',
      'Year-end GST reconciliation statement'
    ],
    estimatedDuration: '1-2 weeks for registration, ongoing for compliance',
    image: '/images/services/gst.jpg'
  },
  {
    id: 'con-001',
    name: 'Business Growth Strategy Consulting',
    shortDescription: 'Strategic consulting to accelerate business growth and profitability',
    description: 'Our business growth strategy consulting helps you identify and capitalize on opportunities to expand your business. We analyze your current operations, market position, and competitive landscape to develop actionable strategies for sustainable growth and increased profitability.',
    category: 'consulting',
    serviceType: 'plan',
    price: {
      amount: 75000,
      currency: 'INR',
      billingType: 'one-time'
    },
    features: [
      'Comprehensive business assessment',
      'Market and competitor analysis',
      'Growth opportunity identification',
      'Strategic planning and roadmap development',
      'Financial projections and modeling',
      'Implementation guidance and support',
      'Progress tracking and strategy refinement'
    ],
    requirements: [
      'Current business plan and financial statements',
      'Customer data and sales information',
      'Marketing materials and strategies',
      'Organizational structure details',
      'Information on competitors and market positioning'
    ],
    deliverables: [
      'Detailed growth strategy report',
      'Implementation roadmap with timelines',
      'Financial projections and ROI analysis',
      'Resource allocation recommendations',
      'Risk assessment and mitigation plan',
      'Follow-up consultation sessions'
    ],
    estimatedDuration: '4-8 weeks',
    image: '/images/services/business-consulting.jpg'
  },
  {
    id: 'aud-002',
    name: 'Internal Audit & Controls Review',
    shortDescription: 'Comprehensive internal audit to strengthen control systems and reduce risk',
    description: 'Our internal audit service evaluates your organization\'s internal control systems, risk management processes, and governance procedures to ensure efficiency, effectiveness, and compliance. We identify control weaknesses and provide recommendations to strengthen your internal operations.',
    category: 'audit',
    serviceType: 'plan',
    price: {
      amount: 35000,
      currency: 'INR',
      billingType: 'one-time'
    },
    features: [
      'Internal control system assessment',
      'Risk management process evaluation',
      'Operational efficiency review',
      'Compliance with internal policies verification',
      'Fraud risk assessment',
      'Process improvement recommendations',
      'Follow-up on implementation of recommendations'
    ],
    requirements: [
      'Internal policies and procedures documentation',
      'Organizational chart and job descriptions',
      'Process flowcharts',
      'Previous internal/external audit reports',
      'Access to key personnel for interviews',
      'Sample transactions for testing'
    ],
    deliverables: [
      'Detailed internal audit report',
      'Findings and recommendations document',
      'Risk assessment matrix',
      'Control improvement roadmap',
      'Executive summary for management',
      'Follow-up action plan'
    ],
    estimatedDuration: '3-5 weeks',
    image: '/images/services/internal-audit.jpg'
  },
  {
    id: 'ca-003',
    name: 'Financial Statement Preparation',
    shortDescription: 'Professional preparation of accurate and compliant financial statements',
    description: 'Our financial statement preparation service ensures your business has properly prepared balance sheets, income statements, cash flow statements, and other financial reports. We ensure accuracy, compliance with accounting standards, and create statements that provide valuable insights into your financial position.',
    category: 'ca-services',
    serviceType: 'plan',
    price: {
      amount: 12999,
      currency: 'INR',
      billingType: 'one-time'
    },
    features: [
      'Balance sheet preparation',
      'Income statement preparation',
      'Cash flow statement preparation',
      'Statement of changes in equity preparation',
      'Notes to financial statements',
      'Ratio analysis and interpretation',
      'Compliance with applicable accounting standards'
    ],
    requirements: [
      'Trial balance and general ledger',
      'Bank statements and reconciliations',
      'Fixed asset register',
      'Accounts receivable and payable aging reports',
      'Inventory valuation details',
      'Previous financial statements (if available)'
    ],
    deliverables: [
      'Complete set of financial statements',
      'Financial performance analysis report',
      'Key financial metrics and ratios',
      'Recommendations for financial improvement',
      'Management discussion document',
      'Presentation of financial statements'
    ],
    estimatedDuration: '2-3 weeks',
    image: '/images/services/financial-statements.jpg'
  },
  // New One-Time Services
  {
    id: 'tax-002',
    name: 'Income Tax Return (ITR) Filing',
    shortDescription: 'Professional ITR filing service for individuals and businesses',
    description: 'Our Income Tax Return filing service ensures accurate and timely submission of your tax returns. We handle all complexities of the ITR process, maximize your eligible deductions, and ensure compliance with the latest tax regulations to help you avoid penalties and notices.',
    category: 'tax',
    serviceType: 'one-time',
    price: {
      amount: 2999,
      currency: 'INR',
      billingType: 'one-time'
    },
    features: [
      'Assessment of appropriate ITR form',
      'Calculation of total income and tax liability',
      'Identification of all eligible deductions',
      'Capital gains computation if applicable',
      'E-filing of return with digital signature',
      'Post-filing support for notices'
    ],
    requirements: [
      'Form 16/16A from employer',
      'Bank statements for the financial year',
      'Investment proofs for tax saving',
      'Property documents if applicable',
      'Previous year\'s ITR (if filed)'
    ],
    deliverables: [
      'Filed ITR with acknowledgment',
      'Tax computation sheet',
      'Recommendations for future tax planning',
      'E-filing confirmation',
      'Copy of all submitted documents'
    ],
    estimatedDuration: '2-5 days',
    image: '/images/services/itr.jpg'
  },
  {
    id: 'tax-003',
    name: 'GST Return Filing - Single Period',
    shortDescription: 'One-time GST return filing service for businesses',
    description: 'Our one-time GST return filing service helps businesses meet their GST compliance requirements for a specific tax period. We ensure accurate preparation and timely submission of your GSTR forms, reconcile input tax credits, and help you avoid late filing penalties.',
    category: 'tax',
    serviceType: 'one-time',
    price: {
      amount: 1499,
      currency: 'INR',
      billingType: 'one-time'
    },
    features: [
      'GSTR form preparation and filing',
      'Input tax credit reconciliation',
      'Tax liability calculation',
      'Filing within statutory deadlines',
      'Basic GST compliance advisory',
      'Error correction assistance'
    ],
    requirements: [
      'Purchase and sales invoices for the period',
      'GST login credentials',
      'Previous returns if applicable',
      'Bank statements for the period',
      'Details of any advances received'
    ],
    deliverables: [
      'Filed GSTR return with acknowledgment',
      'GST tax computation sheet',
      'ITC reconciliation report',
      'Filing confirmation',
      'Summary of tax paid'
    ],
    estimatedDuration: '1-3 days',
    image: '/images/services/gst-return.jpg'
  },
  {
    id: 'ca-004',
    name: 'Annual Accounting Closure',
    shortDescription: 'Year-end accounting services for small and medium businesses',
    description: 'Our annual accounting closure service helps businesses properly close their books at the end of the financial year. We ensure all transactions are properly recorded, prepare year-end financial statements, and get your accounts ready for tax filing and statutory compliance.',
    category: 'ca-services',
    serviceType: 'one-time',
    price: {
      amount: 7999,
      currency: 'INR',
      billingType: 'one-time'
    },
    features: [
      'Year-end journal entries and adjustments',
      'Reconciliation of all accounts',
      'Preparation of annual financial statements',
      'Fixed assets register updating',
      'Inventory valuation assistance',
      'Preparation for statutory audit'
    ],
    requirements: [
      'Complete accounting records for the year',
      'Bank statements for all accounts',
      'Fixed asset purchases/disposals information',
      'Inventory details and valuation method',
      'Outstanding payables and receivables'
    ],
    deliverables: [
      'Year-end balance sheet',
      'Profit and loss statement',
      'Cash flow statement',
      'Notes to accounts',
      'Reconciliation reports',
      'Tax-ready financial package'
    ],
    estimatedDuration: '1-2 weeks',
    image: '/images/services/annual-accounts.jpg'
  },
  {
    id: 'reg-002',
    name: 'Vehicle Registration & Documentation',
    shortDescription: 'Complete vehicle registration and documentation services',
    description: 'Our vehicle registration service handles all the paperwork and procedures required for registering your vehicle with the Regional Transport Office (RTO). We take care of the entire process from application submission to obtaining the registration certificate, ensuring compliance with all regulations.',
    category: 'registration',
    serviceType: 'one-time',
    price: {
      amount: 4999,
      currency: 'INR',
      billingType: 'one-time'
    },
    features: [
      'RTO application preparation and submission',
      'Vehicle inspection coordination',
      'Road tax calculation and payment',
      'Insurance verification',
      'Registration certificate collection',
      'High security registration plate arrangement'
    ],
    requirements: [
      'Vehicle invoice and purchase documents',
      'Owner\'s identity and address proof',
      'Vehicle insurance policy',
      'Pollution Under Control (PUC) certificate',
      'Previous registration details (if transfer)'
    ],
    deliverables: [
      'Vehicle registration certificate (RC)',
      'Tax payment receipts',
      'Number plate authorization',
      'Registration documents file',
      'Process completion report'
    ],
    estimatedDuration: '7-14 days',
    image: '/images/services/vehicle-registration.jpg'
  },
  {
    id: 'tax-004',
    name: 'TDS Return Filing',
    shortDescription: 'One-time TDS return preparation and filing service',
    description: 'Our TDS (Tax Deducted at Source) return filing service ensures accurate and timely submission of your quarterly TDS returns. We handle preparation of the appropriate TDS forms, verification of deductions, and electronic filing with the Income Tax Department to keep you compliant with TDS regulations.',
    category: 'tax',
    serviceType: 'one-time',
    price: {
      amount: 1999,
      currency: 'INR',
      billingType: 'one-time'
    },
    features: [
      'Preparation of TDS returns (Form 24Q, 26Q, 27Q, etc.)',
      'Verification of TDS deductions and rates',
      'Generation of Form 16/16A',
      'E-filing of returns with digital signature',
      'Correction statements if required',
      'TDS payment challan verification'
    ],
    requirements: [
      'Details of all payments made subject to TDS',
      'TDS certificates and challans',
      'PAN details of deductees',
      'Bank statements for the quarter',
      'Previous TDS returns (if applicable)'
    ],
    deliverables: [
      'Filed TDS return with acknowledgment',
      'Form 16/16A for deductees',
      'TDS reconciliation report',
      'Filing confirmation receipt',
      'Compiled deduction summary'
    ],
    estimatedDuration: '3-5 days',
    image: '/images/services/tds-filing.jpg'
  }
];

// Function to get services by category
export const getServicesByCategory = (categoryId: string): Service[] => {
  return servicesData.filter(service => service.category === categoryId);
};

// Function to get services by type
export const getServicesByType = (serviceType: 'plan' | 'one-time'): Service[] => {
  return servicesData.filter(service => service.serviceType === serviceType);
};

// Function to get a single service by ID
export const getServiceById = (serviceId: string): Service | undefined => {
  return servicesData.find(service => service.id === serviceId);
};

// Function to get related services (same category, excluding the current one)
export const getRelatedServices = (serviceId: string, limit: number = 3): Service[] => {
  const currentService = getServiceById(serviceId);
  if (!currentService) return [];
  
  return servicesData
    .filter(service => service.category === currentService.category && service.id !== serviceId)
    .slice(0, limit);
};

// Function to get required documents for a service
export const getRequiredDocumentsForService = (serviceId: string) => {
  const service = getServiceById(serviceId);
  if (!service) return [];
  
  return requiredDocumentsByCategory[service.category] || [];
}; 
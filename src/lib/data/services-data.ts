/**
 * Mock service data for development
 */

export interface Service {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  serviceType: 'plan' | 'one-time';
  price: {
    amount: number;
    currency: string;
    billingCycle?: 'monthly' | 'quarterly' | 'yearly';
  };
  features: string[];
  image?: string;
  estimatedDuration: string;
  faqs: {
    question: string;
    answer: string;
  }[];
  process: {
    step: number;
    title: string;
    description: string;
  }[];
  requiredDocuments?: string[];
  slug: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  imageUrl?: string;
}

// Mock service categories
export const serviceCategories: ServiceCategory[] = [
  {
    id: 'consulting',
    name: 'Consulting Services',
    description: 'Professional consultation and advisory services',
    slug: 'consulting',
    imageUrl: '/images/categories/consulting.jpg'
  },
  {
    id: 'business-registration',
    name: 'Business Registration',
    description: 'Register your business and get legal compliance',
    slug: 'business-registration',
    imageUrl: '/images/categories/business-registration.jpg'
  },
  {
    id: 'tax-compliance',
    name: 'Tax Compliance',
    description: 'Stay compliant with tax regulations',
    slug: 'tax-compliance',
    imageUrl: '/images/categories/tax-compliance.jpg'
  },
  {
    id: 'accounting',
    name: 'Accounting Services',
    description: 'Professional accounting services for your business',
    slug: 'accounting',
    imageUrl: '/images/categories/accounting.jpg'
  },
  {
    id: 'legal',
    name: 'Legal Services',
    description: 'Legal advice and documentation services',
    slug: 'legal',
    imageUrl: '/images/categories/legal.jpg'
  }
];

// Mock services data
export const servicesData: Service[] = [
  {
    id: 'consulting-appointment',
    name: 'Consulting Appointment',
    shortDescription: 'Book a one-on-one video consultation with our expert consultants',
    description: `
      <p>Get personalized guidance and expert advice through our one-on-one video consultation service. Our professional consultants will help you address your specific business challenges, accounting issues, or regulatory questions in a dedicated private session.</p>
      <p>After booking, our team will coordinate with you to schedule the meeting at a mutually convenient time. The meeting link will be shared with you via the order chat section prior to the appointment.</p>
      <h3>Benefits:</h3>
      <ul>
        <li>Personalized advice tailored to your specific situation</li>
        <li>Direct access to experienced consultants and CA professionals</li>
        <li>Convenient online meeting from your location</li>
        <li>Secure and confidential environment for sensitive discussions</li>
        <li>Follow-up documentation of key points discussed</li>
      </ul>
    `,
    category: 'consulting',
    serviceType: 'one-time',
    price: {
      amount: 5000,
      currency: 'INR'
    },
    features: [
      '60-minute video consultation',
      'Pre-consultation questionnaire',
      'Expert advice from certified professionals',
      'Secure video conferencing platform',
      'Post-consultation summary notes',
      'Option for follow-up questions via email'
    ],
    image: '/images/services/consulting.jpg',
    estimatedDuration: 'Scheduled within 3-5 business days',
    faqs: [
      {
        question: 'How long is the consultation session?',
        answer: 'Each consultation session is scheduled for 60 minutes. If more time is needed, additional sessions can be booked.'
      },
      {
        question: 'What platform will be used for the video meeting?',
        answer: 'We typically use Google Meet or Zoom for our consultation sessions. The meeting link will be shared with you before the scheduled appointment.'
      },
      {
        question: 'How do I prepare for the consultation?',
        answer: 'After booking, you\'ll receive a pre-consultation questionnaire to help you organize your thoughts and questions. This helps our consultants prepare and makes the session more productive.'
      },
      {
        question: 'Can I reschedule my appointment?',
        answer: 'Yes, appointments can be rescheduled with at least 24 hours notice. Please contact us through the order chat section to request a reschedule.'
      }
    ],
    process: [
      {
        step: 1,
        title: 'Book Consultation',
        description: 'Purchase the consultation service through our platform'
      },
      {
        step: 2,
        title: 'Complete Questionnaire',
        description: 'Fill out the pre-consultation questionnaire to help us understand your needs'
      },
      {
        step: 3,
        title: 'Schedule Meeting',
        description: 'Coordinate with our team to find a suitable time for your consultation'
      },
      {
        step: 4,
        title: 'Receive Meeting Link',
        description: 'Get your video conference link via the order chat section'
      },
      {
        step: 5,
        title: 'Attend Consultation',
        description: 'Join the video meeting at the scheduled time for your consultation'
      },
      {
        step: 6,
        title: 'Follow-up Documentation',
        description: 'Receive summary notes and any recommended next steps'
      }
    ],
    requiredDocuments: [
      'Pre-consultation questionnaire',
      'Any relevant business documents for discussion (optional)',
      'List of specific questions or topics (recommended)'
    ],
    slug: 'consulting-appointment'
  },
  {
    id: 'gst-registration',
    name: 'GST Registration',
    shortDescription: 'Register your business for Goods and Services Tax',
    description: `
      <p>GST Registration is mandatory for businesses with a turnover exceeding ₹20 lakhs (₹10 lakhs for North Eastern and hill states). Our comprehensive GST registration service ensures a smooth and hassle-free registration process.</p>
      <p>Our experts will handle all the documentation and formalities required for GST registration, ensuring compliance with the latest regulations.</p>
      <h3>Benefits:</h3>
      <ul>
        <li>Legal compliance with GST laws</li>
        <li>Ability to collect and claim GST</li>
        <li>Access to input tax credit</li>
        <li>Enhanced credibility for your business</li>
      </ul>
    `,
    category: 'tax-compliance',
    serviceType: 'one-time',
    price: {
      amount: 2999,
      currency: 'INR'
    },
    features: [
      'Document preparation and verification',
      'Application filing',
      'Follow-up with GST department',
      'GST certificate delivery',
      '1-month post-registration support'
    ],
    image: '/images/services/gst.jpg',
    estimatedDuration: '7-10 working days',
    faqs: [
      {
        question: 'Who needs to register for GST?',
        answer: 'Any business with a turnover exceeding ₹20 lakhs (₹10 lakhs for North Eastern and hill states) needs to register for GST. Some businesses are required to register regardless of turnover.'
      },
      {
        question: 'What documents are required for GST registration?',
        answer: 'PAN card, Aadhaar card, business registration documents, bank account details, and address proof of business premises are the basic requirements.'
      },
      {
        question: 'How long does GST registration take?',
        answer: 'Typically, GST registration takes 7-10 working days after submission of all required documents.'
      }
    ],
    process: [
      {
        step: 1,
        title: 'Document Collection',
        description: 'Submit all required documents through our portal'
      },
      {
        step: 2,
        title: 'Application Preparation',
        description: 'Our experts prepare and verify your application'
      },
      {
        step: 3,
        title: 'Filing and Submission',
        description: 'Application is filed with the GST department'
      },
      {
        step: 4,
        title: 'Verification',
        description: 'GST department verifies the application'
      },
      {
        step: 5,
        title: 'Certificate Delivery',
        description: 'GST certificate is delivered to you'
      }
    ],
    requiredDocuments: [
      'PAN Card',
      'Aadhaar Card',
      'Business Registration Document',
      'Bank Account Statement',
      'Address Proof of Business Premises'
    ],
    slug: 'gst-registration'
  },
  {
    id: 'company-registration',
    name: 'Private Limited Company Registration',
    shortDescription: 'Register your business as a Private Limited Company',
    description: `
      <p>A Private Limited Company is a popular business structure that offers limited liability protection to its shareholders. Our company registration service provides end-to-end assistance in incorporating your Private Limited Company.</p>
      <p>Our experts will guide you through the entire process, from name reservation to certificate of incorporation, ensuring compliance with all legal requirements.</p>
      <h3>Benefits:</h3>
      <ul>
        <li>Limited liability protection for shareholders</li>
        <li>Enhanced credibility and brand image</li>
        <li>Easier access to funding and investments</li>
        <li>Perpetual existence independent of shareholders</li>
        <li>Tax benefits and deductions</li>
      </ul>
    `,
    category: 'business-registration',
    serviceType: 'one-time',
    price: {
      amount: 9999,
      currency: 'INR'
    },
    features: [
      'Name availability check',
      'DSC (Digital Signature Certificate) application',
      'DIN (Director Identification Number) application',
      'MOA and AOA preparation',
      'Company incorporation filing',
      'Certificate of Incorporation',
      'PAN and TAN application',
      'Bank account opening assistance',
      '3-month post-incorporation support'
    ],
    image: '/images/services/company-registration.jpg',
    estimatedDuration: '15-20 working days',
    faqs: [
      {
        question: 'What are the requirements for Private Limited Company registration?',
        answer: 'You need at least 2 directors, 1 shareholder (can be the same as directors), a registered office address, and minimum capital (no minimum requirement but typically starts with ₹1 lakh).'
      },
      {
        question: 'How long does it take to register a Private Limited Company?',
        answer: 'The entire process typically takes 15-20 working days after submission of all required documents.'
      },
      {
        question: 'What are MOA and AOA?',
        answer: 'Memorandum of Association (MOA) defines the company\'s relationship with outside stakeholders, while Articles of Association (AOA) governs the internal management of the company.'
      }
    ],
    process: [
      {
        step: 1,
        title: 'Name Reservation',
        description: 'Apply for name approval with MCA'
      },
      {
        step: 2,
        title: 'DSC and DIN Application',
        description: 'Apply for Digital Signature Certificate and Director Identification Number'
      },
      {
        step: 3,
        title: 'Document Preparation',
        description: 'Prepare MOA, AOA and other incorporation documents'
      },
      {
        step: 4,
        title: 'Filing for Incorporation',
        description: 'Submit incorporation application with MCA'
      },
      {
        step: 5,
        title: 'Certificate Issuance',
        description: 'Receive Certificate of Incorporation, PAN and TAN'
      },
      {
        step: 6,
        title: 'Post-Incorporation Compliance',
        description: 'Complete post-incorporation requirements'
      }
    ],
    requiredDocuments: [
      'Identity Proof of Directors (PAN, Aadhaar)',
      'Address Proof of Directors',
      'Passport-size Photographs of Directors',
      'Address Proof of Registered Office',
      'No Objection Certificate from Property Owner'
    ],
    slug: 'company-registration'
  },
  {
    id: 'income-tax-filing',
    name: 'Income Tax Return Filing',
    shortDescription: 'Professional assistance with filing your income tax returns',
    description: `
      <p>Our Income Tax Return Filing service ensures accurate and timely filing of your income tax returns. Whether you're an individual, a professional, or a business entity, our tax experts will help you maximize deductions and comply with tax regulations.</p>
      <p>We stay updated with the latest tax laws and amendments to ensure that your returns are filed correctly and efficiently.</p>
      <h3>Benefits:</h3>
      <ul>
        <li>Accurate tax calculation and maximum legitimate deductions</li>
        <li>Timely filing to avoid penalties</li>
        <li>Expert handling of complex tax situations</li>
        <li>Documentation and record-keeping assistance</li>
        <li>Guidance on tax planning for future years</li>
      </ul>
    `,
    category: 'tax-compliance',
    serviceType: 'one-time',
    price: {
      amount: 1999,
      currency: 'INR'
    },
    features: [
      'Income and deduction analysis',
      'Tax calculation',
      'ITR form selection and filling',
      'E-filing with digital signature',
      'Form 16 and other document verification',
      'Tax payment guidance',
      'Post-filing support'
    ],
    image: '/images/services/tax-planning.jpg',
    estimatedDuration: '3-5 working days',
    faqs: [
      {
        question: 'Which ITR form is applicable for me?',
        answer: 'The ITR form depends on your sources of income. Salaried individuals typically use ITR-1, while businesses and professionals use ITR-3 or ITR-4. We will help determine the right form for your situation.'
      },
      {
        question: 'What documents do I need for filing income tax returns?',
        answer: 'Form 16 (for salaried individuals), bank statements, investment proofs, property documents (if applicable), and any other income or deduction proofs.'
      },
      {
        question: 'What happens if I miss the ITR filing deadline?',
        answer: 'Late filing may result in penalties, interest charges, and loss of certain carry-forward benefits. It\'s always best to file within the deadline.'
      }
    ],
    process: [
      {
        step: 1,
        title: 'Document Collection',
        description: 'Submit all required financial documents'
      },
      {
        step: 2,
        title: 'Income Analysis',
        description: 'Our experts analyze your income and applicable deductions'
      },
      {
        step: 3,
        title: 'Tax Calculation',
        description: 'Calculate tax liability or refund amount'
      },
      {
        step: 4,
        title: 'ITR Preparation',
        description: 'Prepare the appropriate ITR form'
      },
      {
        step: 5,
        title: 'E-Filing',
        description: 'E-file the return with the Income Tax Department'
      },
      {
        step: 6,
        title: 'Verification',
        description: 'Verify the return through appropriate method'
      }
    ],
    requiredDocuments: [
      'PAN Card',
      'Aadhaar Card',
      'Form 16 (for salaried individuals)',
      'Bank Statements',
      'Investment Proofs',
      'Previous Year\'s ITR (if applicable)'
    ],
    slug: 'income-tax-filing'
  },
  {
    id: 'accounting-services',
    name: 'Monthly Accounting Services',
    shortDescription: 'Comprehensive bookkeeping and accounting services for your business',
    description: `
      <p>Our Monthly Accounting Services provide comprehensive bookkeeping and financial management for your business. We handle all aspects of your day-to-day accounting needs, allowing you to focus on growing your business.</p>
      <p>Our team of experienced accountants will maintain accurate financial records, prepare financial statements, and provide insights to help you make informed business decisions.</p>
      <h3>Benefits:</h3>
      <ul>
        <li>Professional management of financial records</li>
        <li>Regular financial reporting and analysis</li>
        <li>Improved financial decision-making</li>
        <li>Compliance with accounting standards</li>
        <li>Time and resource savings for your business</li>
      </ul>
    `,
    category: 'accounting',
    serviceType: 'plan',
    price: {
      amount: 4999,
      currency: 'INR',
      billingCycle: 'monthly'
    },
    features: [
      'Daily/weekly transaction recording',
      'Bank reconciliation',
      'Accounts receivable and payable management',
      'Monthly financial statements (P&L, Balance Sheet)',
      'Expense categorization and tracking',
      'Invoice generation and management',
      'Financial analysis and reporting',
      'Dedicated accountant'
    ],
    image: '/images/services/accounting.jpg',
    estimatedDuration: 'Ongoing monthly service',
    faqs: [
      {
        question: 'What accounting software do you use?',
        answer: 'We work with popular accounting software like Tally, QuickBooks, and Zoho Books. We can adapt to your existing system or recommend the best option for your business.'
      },
      {
        question: 'How do I share my financial documents with you?',
        answer: 'We provide a secure client portal where you can upload documents. Alternatively, you can share them via email or give us access to your accounting software.'
      },
      {
        question: 'Can you handle GST filing as part of the accounting service?',
        answer: 'Yes, GST filing can be included in your monthly accounting package for an additional fee.'
      }
    ],
    process: [
      {
        step: 1,
        title: 'Initial Setup',
        description: 'Set up accounting system and chart of accounts'
      },
      {
        step: 2,
        title: 'Regular Bookkeeping',
        description: 'Record and categorize transactions'
      },
      {
        step: 3,
        title: 'Reconciliation',
        description: 'Reconcile bank and credit card accounts'
      },
      {
        step: 4,
        title: 'Financial Statements',
        description: 'Prepare monthly financial statements'
      },
      {
        step: 5,
        title: 'Review and Analysis',
        description: 'Review financial performance and provide insights'
      },
      {
        step: 6,
        title: 'Monthly Reporting',
        description: 'Deliver monthly financial reports'
      }
    ],
    requiredDocuments: [
      'Bank Statements',
      'Sales Invoices',
      'Purchase Invoices',
      'Expense Receipts',
      'Previous Financial Records (if available)'
    ],
    slug: 'accounting-services'
  },
  {
    id: 'audit-services',
    name: 'Internal Audit Services',
    shortDescription: 'Comprehensive internal audit to ensure compliance and efficiency',
    description: `
      <p>Our Internal Audit Services provide a systematic and independent assessment of your company\'s operations, helping you identify risks, ensure compliance, and improve operational efficiency.</p>
      <p>Our experienced auditors will examine your business processes, financial records, and internal controls to provide valuable insights and recommendations.</p>
      <h3>Benefits:</h3>
      <ul>
        <li>Identify and mitigate business risks</li>
        <li>Ensure compliance with regulations and internal policies</li>
        <li>Improve operational efficiency and effectiveness</li>
        <li>Enhance internal control systems</li>
        <li>Prevent fraud and financial misstatements</li>
      </ul>
    `,
    category: 'accounting',
    serviceType: 'one-time',
    price: {
      amount: 15000,
      currency: 'INR'
    },
    features: [
      'Risk assessment and audit planning',
      'Review of internal control systems',
      'Financial and operational audits',
      'Compliance verification',
      'Fraud risk assessment',
      'Detailed audit report with findings',
      'Recommendations for improvement',
      'Post-audit follow-up'
    ],
    image: '/images/services/internal-audit.jpg',
    estimatedDuration: '2-4 weeks',
    faqs: [
      {
        question: 'How often should we conduct an internal audit?',
        answer: 'The frequency depends on your business size, industry, and risk profile. Generally, critical areas should be audited annually, while less critical areas can be audited every 2-3 years.'
      },
      {
        question: 'What is the difference between internal and external audit?',
        answer: 'Internal audits focus on improving operations and controls, while external audits primarily focus on verifying financial statements for stakeholders. Internal audits are voluntary and for management use, whereas external audits may be legally required.'
      },
      {
        question: 'How do we prepare for an internal audit?',
        answer: 'Prepare by organizing relevant documentation, ensuring staff availability for interviews, providing access to systems and records, and communicating the audit purpose to your team.'
      }
    ],
    process: [
      {
        step: 1,
        title: 'Planning & Scoping',
        description: 'Define audit objectives, scope, and methodology'
      },
      {
        step: 2,
        title: 'Risk Assessment',
        description: 'Identify and prioritize key risk areas'
      },
      {
        step: 3,
        title: 'Fieldwork',
        description: 'Conduct detailed testing and analysis'
      },
      {
        step: 4,
        title: 'Findings Documentation',
        description: 'Document observations and recommendations'
      },
      {
        step: 5,
        title: 'Report Preparation',
        description: 'Prepare comprehensive audit report'
      },
      {
        step: 6,
        title: 'Results Discussion',
        description: 'Present findings and recommendations to management'
      }
    ],
    requiredDocuments: [
      'Financial Statements',
      'Internal Policies and Procedures',
      'Process Documentation',
      'Previous Audit Reports',
      'Organizational Charts',
      'Sample Transactions'
    ],
    slug: 'audit-services'
  }
];

// Required documents by category
export const requiredDocumentsByCategory: Record<string, string[]> = {
  'business-registration': [
    'PAN Card',
    'Aadhaar Card',
    'Address Proof',
    'Passport-size Photographs',
    'Business Address Proof'
  ],
  'tax-compliance': [
    'PAN Card',
    'Aadhaar Card',
    'Bank Statements',
    'Income Proofs',
    'Investment Proofs'
  ],
  'accounting': [
    'Bank Statements',
    'Sales Invoices',
    'Purchase Invoices',
    'Expense Receipts',
    'Previous Financial Records'
  ],
  'legal': [
    'Identity Proof',
    'Address Proof',
    'Case-specific Documents',
    'Previous Legal Documents (if any)'
  ]
};

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

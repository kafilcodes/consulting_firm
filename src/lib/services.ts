import { collection, getDocs, doc, getDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Timestamp } from 'firebase/firestore';

export interface ServiceFeature {
  id: string;
  name: string;
  description?: string;
}

export interface ServiceFAQ {
  id: string;
  question: string;
  answer: string;
}

export interface ServiceProcess {
  id: string;
  title: string;
  description: string;
  order: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  priceUnit?: string;
  categoryId: string;
  imageUrl?: string;
  features: ServiceFeature[];
  faqs?: ServiceFAQ[];
  process?: ServiceProcess[];
  estimatedDelivery?: string;
  popular?: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ServiceDetails extends Service {
  longDescription?: string;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  process?: Array<{
    step: number;
    title: string;
    description: string;
  }>;
}

/**
 * Fetches all service categories from Firestore
 * @returns Promise<ServiceCategory[]>
 */
export async function fetchCategories(): Promise<ServiceCategory[]> {
  try {
    const categoriesRef = collection(db, 'serviceCategories');
    const querySnapshot = await getDocs(categoriesRef);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as ServiceCategory;
    });
  } catch (error) {
    console.error('Error fetching service categories:', error);
    return [];
  }
}

/**
 * Fetches all services from Firestore
 * @returns Promise<Service[]>
 */
export async function fetchServices(): Promise<Service[]> {
  try {
    const servicesRef = collection(db, 'services');
    const querySnapshot = await getDocs(servicesRef);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        features: data.features || [],
        faqs: data.faqs || [],
        process: data.process || [],
      } as Service;
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

/**
 * Fetches services by category ID
 * @param categoryId - The category ID to filter by
 * @returns Promise<Service[]>
 */
export async function fetchServicesByCategory(categoryId: string): Promise<Service[]> {
  try {
    const servicesRef = collection(db, 'services');
    const q = query(
      servicesRef,
      where('categoryId', '==', categoryId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        features: data.features || [],
      } as Service;
    });
  } catch (error) {
    console.error(`Error fetching services for category ${categoryId}:`, error);
    return [];
  }
}

/**
 * Fetches a specific service by ID
 * @param serviceId - The service ID to fetch
 * @returns Promise<ServiceDetails | null>
 */
export async function fetchServiceById(serviceId: string): Promise<ServiceDetails | null> {
  try {
    const serviceDocRef = doc(db, 'services', serviceId);
    const serviceDoc = await getDoc(serviceDocRef);
    
    if (!serviceDoc.exists()) {
      return null;
    }
    
    const data = serviceDoc.data();
    return {
      id: serviceDoc.id,
      ...data,
      features: data.features || [],
      faqs: data.faqs || [],
      process: data.process || [],
    } as ServiceDetails;
  } catch (error) {
    console.error(`Error fetching service ${serviceId}:`, error);
    return null;
  }
}

/**
 * Formats a price with proper currency and units
 * @param price - The price to format
 * @param unit - Optional price unit (hour, day, project, month)
 * @returns Formatted price string
 */
export function formatPrice(price: number, unit?: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return formatter.format(price);
}

/**
 * Fetches popular/featured services
 * @param limit - Number of services to return
 * @returns Promise<Service[]>
 */
export async function fetchFeaturedServices(limit: number = 3): Promise<Service[]> {
  try {
    const servicesRef = collection(db, 'services');
    const q = query(
      servicesRef,
      where('popular', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        features: data.features || [],
      } as Service;
    });
  } catch (error) {
    console.error('Error fetching popular services:', error);
    return [];
  }
}

// Mock service data for the application
export interface Service {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  price: number;
  oldPrice: number | null;
  features: string[];
  benefits: {
    title: string;
    description: string;
    icon: string;
  }[];
  process: {
    step: number;
    title: string;
    description: string;
  }[];
  imageUrl: string;
}

// Sample service data
export const services: Service[] = [
  {
    id: "business-consulting",
    name: "Business Consulting",
    description: "Strategic guidance to optimize your business operations and growth",
    longDescription: "Our comprehensive business consulting services help organizations identify opportunities, overcome challenges, and achieve sustainable growth. We provide strategic guidance, operational optimization, and innovative solutions tailored to your specific industry and business needs.",
    category: "consulting",
    price: 2500,
    oldPrice: 3000,
    features: [
      "Business strategy development",
      "Market opportunity analysis",
      "Operational efficiency assessment",
      "Growth and scaling strategies",
      "Risk management planning",
      "Competitive analysis"
    ],
    benefits: [
      {
        title: "Increased Revenue",
        description: "Implement strategies that drive sustainable revenue growth and improved profit margins",
        icon: "trending-up"
      },
      {
        title: "Operational Efficiency",
        description: "Streamline processes and reduce costs through optimized business operations",
        icon: "settings"
      },
      {
        title: "Strategic Direction",
        description: "Gain clarity on your business direction with data-driven strategic planning",
        icon: "compass"
      }
    ],
    process: [
      {
        step: 1,
        title: "Discovery",
        description: "We conduct a thorough assessment of your business, including market position, operations, and growth opportunities."
      },
      {
        step: 2,
        title: "Strategy Development",
        description: "Our team creates a customized strategy aligned with your business goals and market conditions."
      },
      {
        step: 3,
        title: "Implementation",
        description: "We guide you through the implementation process, ensuring effective execution of recommendations."
      },
      {
        step: 4,
        title: "Evaluation & Refinement",
        description: "Regular reviews to measure results and refine strategies for optimal outcomes."
      }
    ],
    imageUrl: "/images/pexels-karolina-grabowska-7680751.jpg"
  },
  {
    id: "financial-advisory",
    name: "Financial Advisory",
    description: "Expert financial guidance for optimal business performance",
    longDescription: "Our financial advisory services provide businesses with expert guidance on financial planning, investment strategies, risk management, and wealth preservation. We help you make informed financial decisions that support your long-term business objectives and personal wealth goals.",
    category: "finance",
    price: 1800,
    oldPrice: 2200,
    features: [
      "Financial planning and analysis",
      "Investment strategy development",
      "Cash flow optimization",
      "Tax planning and compliance",
      "Financial risk assessment",
      "Wealth management guidance"
    ],
    benefits: [
      {
        title: "Financial Clarity",
        description: "Gain complete visibility into your financial position with detailed analysis and reporting",
        icon: "bar-chart"
      },
      {
        title: "Cost Reduction",
        description: "Identify opportunities to reduce costs and improve financial efficiency",
        icon: "scissors"
      },
      {
        title: "Wealth Growth",
        description: "Implement strategies that protect and grow your business and personal wealth",
        icon: "trending-up"
      }
    ],
    process: [
      {
        step: 1,
        title: "Financial Assessment",
        description: "Comprehensive review of your current financial situation, including assets, liabilities, and cash flow."
      },
      {
        step: 2,
        title: "Strategy Formulation",
        description: "Development of tailored financial strategies aligned with your business goals and risk tolerance."
      },
      {
        step: 3,
        title: "Implementation",
        description: "Execution of recommended financial strategies with ongoing support and guidance."
      },
      {
        step: 4,
        title: "Monitoring & Adjustment",
        description: "Regular review of financial performance with adjustments to strategies as needed."
      }
    ],
    imageUrl: "/images/pexels-rdne-7821708.jpg"
  },
  {
    id: "market-research",
    name: "Market Research",
    description: "Data-driven insights to inform strategic business decisions",
    longDescription: "Our market research services provide comprehensive data analysis and actionable insights to help you understand your target market, identify customer needs, and capitalize on industry trends. We use advanced research methodologies to deliver valuable intelligence that drives informed business decisions.",
    category: "research",
    price: 1500,
    oldPrice: null,
    features: [
      "Consumer behavior analysis",
      "Competitor landscape mapping",
      "Market segmentation",
      "Trend identification and forecasting",
      "Product and pricing research",
      "Brand perception studies"
    ],
    benefits: [
      {
        title: "Data-Driven Decisions",
        description: "Make strategic choices based on solid market data rather than assumptions",
        icon: "database"
      },
      {
        title: "Market Advantage",
        description: "Identify untapped opportunities and stay ahead of market trends",
        icon: "target"
      },
      {
        title: "Risk Reduction",
        description: "Minimize business risks through informed market understanding",
        icon: "shield"
      }
    ],
    process: [
      {
        step: 1,
        title: "Research Design",
        description: "Development of a research framework tailored to your specific business questions and objectives."
      },
      {
        step: 2,
        title: "Data Collection",
        description: "Gathering relevant market data through surveys, interviews, focus groups, and secondary research."
      },
      {
        step: 3,
        title: "Analysis & Interpretation",
        description: "Comprehensive analysis of collected data to extract meaningful insights and patterns."
      },
      {
        step: 4,
        title: "Actionable Recommendations",
        description: "Translation of research findings into strategic recommendations for business implementation."
      }
    ],
    imageUrl: "/images/pexels-n-voitkevich-6863260.jpg"
  },
  {
    id: "digital-transformation",
    name: "Digital Transformation",
    description: "Modernize your business with cutting-edge digital solutions",
    longDescription: "Our digital transformation services help businesses leverage technology to improve performance, reach new customers, and create more efficient workflows. We guide you through the entire process of digitizing your business operations, from strategy development to implementation and ongoing optimization.",
    category: "technology",
    price: 3500,
    oldPrice: 4000,
    features: [
      "Digital strategy development",
      "Business process automation",
      "Technology infrastructure assessment",
      "Digital customer experience design",
      "Data analytics implementation",
      "Change management support"
    ],
    benefits: [
      {
        title: "Increased Efficiency",
        description: "Automate processes and reduce manual work through digital solutions",
        icon: "zap"
      },
      {
        title: "Enhanced Customer Experience",
        description: "Create seamless digital experiences that attract and retain customers",
        icon: "users"
      },
      {
        title: "Future-Ready Business",
        description: "Build a scalable technological foundation that adapts to changing market demands",
        icon: "globe"
      }
    ],
    process: [
      {
        step: 1,
        title: "Digital Assessment",
        description: "Evaluation of your current digital capabilities, identifying gaps and opportunities for transformation."
      },
      {
        step: 2,
        title: "Strategy Development",
        description: "Creation of a digital roadmap aligned with your business objectives and customer needs."
      },
      {
        step: 3,
        title: "Technology Implementation",
        description: "Deployment of selected digital solutions with minimal disruption to ongoing operations."
      },
      {
        step: 4,
        title: "Training & Integration",
        description: "Staff training and integration of new digital processes into your business workflow."
      }
    ],
    imageUrl: "/images/pexels-n-voitkevich-8927456.jpg"
  },
  {
    id: "strategic-planning",
    name: "Strategic Planning",
    description: "Develop clear business direction and actionable growth plans",
    longDescription: "Our strategic planning services help organizations clarify their vision, set achievable goals, and develop actionable roadmaps for growth. We facilitate collaborative planning sessions, conduct comprehensive analysis, and create detailed strategies that align all aspects of your business toward common objectives.",
    category: "consulting",
    price: 2200,
    oldPrice: 2500,
    features: [
      "Vision and mission refinement",
      "SWOT and competitive analysis",
      "Goal setting and KPI development",
      "Resource allocation planning",
      "Implementation roadmap creation",
      "Performance measurement frameworks"
    ],
    benefits: [
      {
        title: "Clear Direction",
        description: "Establish a unified vision and purpose that guides all business activities",
        icon: "map"
      },
      {
        title: "Aligned Execution",
        description: "Ensure all departments and team members work toward common goals",
        icon: "git-merge"
      },
      {
        title: "Measurable Progress",
        description: "Track performance against strategic objectives with defined metrics",
        icon: "activity"
      }
    ],
    process: [
      {
        step: 1,
        title: "Current State Analysis",
        description: "Assessment of your organization's current position, including strengths, weaknesses, market position, and capabilities."
      },
      {
        step: 2,
        title: "Vision Development",
        description: "Collaborative development of your organization's future vision and strategic objectives."
      },
      {
        step: 3,
        title: "Strategy Formulation",
        description: "Creation of detailed strategies and action plans to achieve your defined objectives."
      },
      {
        step: 4,
        title: "Implementation Support",
        description: "Guidance on executing strategic initiatives and measuring progress against goals."
      }
    ],
    imageUrl: "/images/pexels-n-voitkevich-6863281.jpg"
  },
  {
    id: "leadership-coaching",
    name: "Leadership Coaching",
    description: "Develop exceptional leaders who drive organizational success",
    longDescription: "Our leadership coaching programs develop the skills, mindsets, and behaviors that enable executives and managers to lead effectively in today's complex business environment. We provide personalized coaching, assessment tools, and practical strategies to enhance leadership capabilities at all organizational levels.",
    category: "coaching",
    price: 1900,
    oldPrice: null,
    features: [
      "Leadership style assessment",
      "Executive coaching sessions",
      "Communication skills development",
      "Team management strategies",
      "Change leadership techniques",
      "Conflict resolution training"
    ],
    benefits: [
      {
        title: "Improved Performance",
        description: "Enhance the effectiveness of your leadership team and overall organizational performance",
        icon: "award"
      },
      {
        title: "Stronger Culture",
        description: "Build a positive, high-performance culture through improved leadership practices",
        icon: "users"
      },
      {
        title: "Talent Retention",
        description: "Reduce turnover by developing leaders who engage and inspire their teams",
        icon: "user-check"
      }
    ],
    process: [
      {
        step: 1,
        title: "Assessment",
        description: "Evaluation of current leadership capabilities using validated assessment tools and 360-degree feedback."
      },
      {
        step: 2,
        title: "Development Planning",
        description: "Creation of personalized leadership development plans based on assessment results and organizational needs."
      },
      {
        step: 3,
        title: "Coaching & Training",
        description: "Delivery of one-on-one coaching sessions and targeted training to build specific leadership skills."
      },
      {
        step: 4,
        title: "Progress Review",
        description: "Regular evaluation of leadership growth with adjustments to development plans as needed."
      }
    ],
    imageUrl: "/images/pexels-karolina-grabowska-7680751.jpg"
  }
];

/**
 * Get all services
 */
export const getAllServices = () => {
  return services;
};

/**
 * Get service by ID
 */
export const getServiceById = (id: string) => {
  return services.find(service => service.id === id) || null;
};

/**
 * Get services by category
 */
export const getServicesByCategory = (category: string) => {
  return services.filter(service => service.category === category);
};

/**
 * Get related services (services in the same category, excluding the current one)
 */
export const getRelatedServices = (id: string, limit: number = 3) => {
  const currentService = getServiceById(id);
  if (!currentService) return [];
  
  return services
    .filter(service => service.category === currentService.category && service.id !== id)
    .slice(0, limit);
};

/**
 * Get service categories
 */
export const getServiceCategories = () => {
  const categories = services.map(service => service.category);
  return [...new Set(categories)]; // Remove duplicates
}; 
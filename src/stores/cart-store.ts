import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Service } from '@/lib/services';

// Define cart item type
export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number | null;
  currency?: string;
  quantity: number;
  imageUrl?: string;
  serviceId: string;
  category?: string;
}

// Define cart store state
interface CartState {
  items: CartItem[];
  addItem: (service: Service) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  getTotal: () => { subtotal: number; tax: number; total: number };
}

// Tax rate for calculations
const TAX_RATE = 0.18; // 18% GST

// Create cart store with persistence
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      
      // Add item to cart
      addItem: (service: Service) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(item => item.id === service.id);
        
        if (existingItem) {
          // Increment quantity if item already exists
          set({
            items: currentItems.map(item => 
              item.id === service.id 
                ? { ...item, quantity: item.quantity + 1 } 
                : item
            )
          });
        } else {
          // Add new item with quantity 1
          set({ 
            items: [...currentItems, { 
              id: service.id,
              serviceId: service.id,
              name: service.name,
              description: service.description,
              price: service.price,
              oldPrice: service.oldPrice,
              currency: 'INR', // Default currency
              quantity: 1,
              imageUrl: service.imageUrl,
              category: service.categoryId
            }] 
          });
        }
      },
      
      // Remove item from cart
      removeItem: (id: string) => {
        set({
          items: get().items.filter(item => item.id !== id)
        });
      },
      
      // Update item quantity
      updateQuantity: (id: string, quantity: number) => {
        // Don't allow quantity less than 1
        if (quantity < 1) return;
        
        set({
          items: get().items.map(item => 
            item.id === id 
              ? { ...item, quantity } 
              : item
          )
        });
      },
      
      // Clear entire cart
      clearCart: () => {
        set({ items: [] });
      },
      
      // Calculate total items
      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      // Calculate total price
      totalPrice: () => {
        return get().items.reduce(
          (total, item) => total + (item.price * item.quantity), 
          0
        );
      },
      
      // Get detailed totals with tax calculation
      getTotal: () => {
        const subtotal = get().totalPrice();
        const tax = subtotal * TAX_RATE;
        return {
          subtotal,
          tax,
          total: subtotal + tax
        };
      }
    }),
    {
      // Persist cart in localStorage
      name: 'cart-storage',
    }
  )
); 
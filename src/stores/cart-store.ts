import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Service } from '@/types';

export interface CartItem {
  service: Service;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (service: Service) => void;
  removeItem: (serviceId: string) => void;
  updateQuantity: (serviceId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => {
    subtotal: number;
    tax: number;
    total: number;
  };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (service: Service) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.service.id === service.id
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.service.id === service.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { service, quantity: 1 }],
          };
        });
      },

      removeItem: (serviceId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.service.id !== serviceId),
        }));
      },

      updateQuantity: (serviceId: string, quantity: number) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.service.id === serviceId
              ? { ...item, quantity: Math.max(0, quantity) }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        const items = get().items;
        const subtotal = items.reduce(
          (total, item) => total + item.service.price.amount * item.quantity,
          0
        );
        const tax = subtotal * 0.18; // 18% GST
        const total = subtotal + tax;

        return {
          subtotal,
          tax,
          total,
        };
      },
    }),
    {
      name: 'cart-storage',
    }
  )
); 
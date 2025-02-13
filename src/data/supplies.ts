import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Supply = {
  id: string;
  name: string;
  monthlyQuantity: number;
  unitCost: number;
  category: 'office' | 'cleaning' | 'kitchen' | 'tech' | 'furniture' | 'other';
  lastPurchased: string;
  reorderPoint: number;
  monthlyBudget: number;
};

type SuppliesStore = {
  supplies: Supply[];
  addSupply: (supply: Omit<Supply, 'id'>) => void;
  updateSupply: (id: string, supply: Partial<Supply>) => void;
  deleteSupply: (id: string) => void;
};

export const useSuppliesStore = create<SuppliesStore>()(
  persist(
    (set) => ({
      supplies: [
        {
          id: '1',
          name: 'Printer Paper',
          monthlyQuantity: 5,
          unitCost: 5,
          category: 'office',
          lastPurchased: '2025-02-15',
          reorderPoint: 2,
          monthlyBudget: 30
        },
        {
          id: '2',
          name: 'Coffee Supplies',
          monthlyQuantity: 10,
          unitCost: 2,
          category: 'kitchen',
          lastPurchased: '2025-02-20',
          reorderPoint: 3,
          monthlyBudget: 25
        },
        {
          id: '3',
          name: 'Cleaning Supplies',
          monthlyQuantity: 8,
          unitCost: 3,
          category: 'cleaning',
          lastPurchased: '2025-02-10',
          reorderPoint: 2,
          monthlyBudget: 30
        }
      ],
      addSupply: (supply) =>
        set((state) => ({
          supplies: [
            ...state.supplies,
            { ...supply, id: Math.random().toString(36).substr(2, 9) }
          ]
        })),
      updateSupply: (id, supply) =>
        set((state) => ({
          supplies: state.supplies.map((sup) =>
            sup.id === id ? { ...sup, ...supply } : sup
          )
        })),
      deleteSupply: (id) =>
        set((state) => ({
          supplies: state.supplies.filter((sup) => sup.id !== id)
        }))
    }),
    {
      name: 'supplies-storage',
      version: 1,
      skipHydration: false
    }
  )
);

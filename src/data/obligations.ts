import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Obligation = {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  category: 'tax' | 'license' | 'permit' | 'insurance' | 'other';
};

type ObligationsStore = {
  obligations: Obligation[];
  addObligation: (obligation: Omit<Obligation, 'id'>) => void;
  updateObligation: (id: string, obligation: Partial<Obligation>) => void;
  deleteObligation: (id: string) => void;
};

export const useObligationsStore = create<ObligationsStore>()(
  persist(
    (set) => ({
      obligations: [
        {
          id: '1',
          name: 'Corporate Income Tax',
          amount: 500,
          dueDate: '2025-03-15',
          status: 'pending',
          category: 'tax'
        },
        {
          id: '2',
          name: 'Business License Renewal',
          amount: 300,
          dueDate: '2025-04-01',
          status: 'pending',
          category: 'license'
        },
        {
          id: '3',
          name: 'Workers Compensation',
          amount: 400,
          dueDate: '2025-03-30',
          status: 'paid',
          category: 'insurance'
        }
      ],
      addObligation: (obligation) =>
        set((state) => ({
          obligations: [
            ...state.obligations,
            { ...obligation, id: Math.random().toString(36).substr(2, 9) }
          ]
        })),
      updateObligation: (id, obligation) =>
        set((state) => ({
          obligations: state.obligations.map((obl) =>
            obl.id === id ? { ...obl, ...obligation } : obl
          )
        })),
      deleteObligation: (id) =>
        set((state) => ({
          obligations: state.obligations.filter((obl) => obl.id !== id)
        }))
    }),
    {
      name: 'obligations-storage'
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useSubscriptionsStore } from './subscriptions';

export type CostCategory = {
  id: string;
  name: string;
  monthlyCost: number;
  icon: 'users' | 'building2' | 'scale' | 'heart' | 'package' | 'appWindow';
};

type CostsStore = {
  costs: CostCategory[];
  updateCost: (id: string, monthlyCost: number) => void;
  getAppSubscriptionsCost: () => number;
};

export const useCostsStore = create<CostsStore>()(
  persist(
    (set, get) => ({
      costs: [
        {
          id: 'employeesPayroll',
          name: 'Employees Payroll',
          monthlyCost: 2500,
          icon: 'users'
        },
        {
          id: 'officeRent',
          name: 'Office Rent',
          monthlyCost: 1800,
          icon: 'building2'
        },
        {
          id: 'governmentObligations',
          name: 'Government Obligations',
          monthlyCost: 1200,
          icon: 'scale'
        },
        {
          id: 'healthInsurance',
          name: 'Health Insurance',
          monthlyCost: 850,
          icon: 'heart'
        },
        {
          id: 'officeSupplies',
          name: 'Office Supplies & Bills',
          monthlyCost: 450,
          icon: 'package'
        },
        {
          id: 'appsSubscriptions',
          name: 'Apps Subscriptions',
          get monthlyCost() {
            return useSubscriptionsStore.getState().subscriptions.reduce(
              (total, sub) => total + sub.monthlyCost,
              0
            );
          },
          icon: 'appWindow'
        }
      ],
      updateCost: (id, monthlyCost) =>
        set((state) => ({
          costs: state.costs.map((cost) =>
            cost.id === id ? { ...cost, monthlyCost } : cost
          )
        })),
      getAppSubscriptionsCost: () => {
        const appsCost = get().costs.find(cost => cost.id === 'appsSubscriptions');
        return appsCost?.monthlyCost || 0;
      }
    }),
    {
      name: 'costs-storage'
    }
  )
);

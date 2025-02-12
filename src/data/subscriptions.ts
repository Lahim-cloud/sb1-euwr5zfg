import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Subscription = {
  id: string;
  name: string;
  description: string;
  monthlyCost: number;
  billingCycle: 'monthly' | 'annually';
  category: 'development' | 'design' | 'marketing' | 'productivity' | 'other';
  website: string;
  renewalDate: string;
};

type SubscriptionsStore = {
  subscriptions: Subscription[];
  addSubscription: (subscription: Omit<Subscription, 'id'>) => void;
  updateSubscription: (id: string, subscription: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
};

export const useSubscriptionsStore = create<SubscriptionsStore>()(
  persist(
    (set) => ({
      subscriptions: [
        {
          id: '1',
          name: 'GitHub Team',
          description: 'Code hosting and collaboration platform',
          monthlyCost: 40,
          billingCycle: 'monthly',
          category: 'development',
          website: 'https://github.com',
          renewalDate: '2025-03-15'
        },
        {
          id: '2',
          name: 'Figma Professional',
          description: 'Design and prototyping tool',
          monthlyCost: 15,
          billingCycle: 'monthly',
          category: 'design',
          website: 'https://figma.com',
          renewalDate: '2025-03-20'
        },
        {
          id: '3',
          name: 'Notion Team',
          description: 'Team wiki and project management',
          monthlyCost: 10,
          billingCycle: 'monthly',
          category: 'productivity',
          website: 'https://notion.so',
          renewalDate: '2025-03-25'
        }
      ],
      addSubscription: (subscription) =>
        set((state) => ({
          subscriptions: [
            ...state.subscriptions,
            { ...subscription, id: Math.random().toString(36).substr(2, 9) }
          ]
        })),
      updateSubscription: (id, subscription) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, ...subscription } : sub
          )
        })),
      deleteSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((sub) => sub.id !== id)
        }))
    }),
    {
      name: 'subscriptions-storage'
    }
  )
);
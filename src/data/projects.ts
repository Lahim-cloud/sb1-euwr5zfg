import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export type Project = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  overheadAllocationPercentage: number;
  autoAllocateOverhead: boolean;
  manualAllocationPercentage: number | null;
  calculatedAllocationPercentage: number;
  totalActiveWeeks: number;
  price: number;
  profitMargin: number;
  durationInWeeks: number;
  remainingWeeks: number;
};

type ProjectsStore = {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'durationInWeeks' | 'remainingWeeks' | 'profitMargin'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  calculateProjectMetrics: (project: Pick<Project, 'startDate' | 'endDate'>) => {
    durationInWeeks: number;
    remainingWeeks: number;
  };
  calculateProfitMargin: (price: number, costs: number) => number;
};

export const useProjectsStore = create<ProjectsStore>()(
  persist(
    (set, get) => ({
      projects: [],
      loading: false,
      error: null,

      calculateProjectMetrics: (project) => {
        const start = new Date(project.startDate);
        const end = new Date(project.endDate);
        const today = new Date();

        const durationInWeeks = Math.ceil(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)
        );
        
        const remainingWeeks = Math.max(
          0,
          Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7))
        );

        return { durationInWeeks, remainingWeeks };
      },

      calculateProfitMargin: (price: number, costs: number) => {
        if (costs === 0) return 0;
        return ((price - costs) / costs) * 100;
      },

      fetchProjects: async () => {
        set({ loading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');

          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;

          const projectsWithMetrics = data.map(project => ({
            ...project,
            startDate: project.start_date,
            endDate: project.end_date,
            overheadAllocationPercentage: project.overhead_allocation_percentage,
            price: project.price || 0,
            profitMargin: project.profit_margin || 0,
            ...get().calculateProjectMetrics({
              startDate: project.start_date,
              endDate: project.end_date
            })
          }));

          set({ projects: projectsWithMetrics });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
        } finally {
          set({ loading: false });
        }
      },

      addProject: async (project) => {
        set({ loading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');

          const { error } = await supabase
            .from('projects')
            .insert({
              name: project.name,
              description: project.description,
              start_date: project.startDate,
              end_date: project.endDate,
              status: project.status,
              overhead_allocation_percentage: project.overheadAllocationPercentage,
              price: project.price,
              user_id: user.id
            });

          if (error) throw error;

          get().fetchProjects();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
        } finally {
          set({ loading: false });
        }
      },

      updateProject: async (id, project) => {
        set({ loading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');

          const { error } = await supabase
            .from('projects')
            .update({
              name: project.name,
              description: project.description,
              start_date: project.startDate,
              end_date: project.endDate,
              status: project.status,
              overhead_allocation_percentage: project.overheadAllocationPercentage,
              price: project.price
            })
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;

          get().fetchProjects();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
        } finally {
          set({ loading: false });
        }
      },

      deleteProject: async (id) => {
        set({ loading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');

          const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;

          get().fetchProjects();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
        } finally {
          set({ loading: false });
        }
      }
    }),
    {
      name: 'projects-storage'
    }
  )
);
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Employee = {
  id: string;
  name: string;
  position: string;
  department: string;
  salary: number;
  startDate: string;
  status: 'active' | 'on-leave' | 'terminated';
};

type EmployeesStore = {
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
};

export const useEmployeesStore = create<EmployeesStore>()(
  persist(
    (set) => ({
      employees: [
        {
          id: '1',
          name: 'John Doe',
          position: 'Senior Developer',
          department: 'Engineering',
          salary: 8000,
          startDate: '2024-01-15',
          status: 'active'
        },
        {
          id: '2',
          name: 'Jane Smith',
          position: 'Product Manager',
          department: 'Product',
          salary: 7500,
          startDate: '2024-02-01',
          status: 'active'
        },
        {
          id: '3',
          name: 'Mike Johnson',
          position: 'UI Designer',
          department: 'Design',
          salary: 6000,
          startDate: '2024-01-20',
          status: 'on-leave'
        }
      ],
      addEmployee: (employee) =>
        set((state) => ({
          employees: [
            ...state.employees,
            { ...employee, id: Math.random().toString(36).substr(2, 9) }
          ]
        })),
      updateEmployee: (id, employee) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === id ? { ...emp, ...employee } : emp
          )
        })),
      deleteEmployee: (id) =>
        set((state) => ({
          employees: state.employees.filter((emp) => emp.id !== id)
        }))
    }),
    {
      name: 'employees-storage'
    }
  )
);
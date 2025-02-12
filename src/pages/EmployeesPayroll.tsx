import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Plus, Pencil, Trash2, X } from 'lucide-react';
import { useCostsStore } from '../data/costs';
import { useEmployeesStore, Employee } from '../data/employees';

export default function EmployeesPayroll() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployeesStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
    name: '',
    position: '',
    department: '',
    salary: 0,
    startDate: new Date().toISOString().split('T')[0],
    status: 'active'
  });

  const totalSalary = employees.reduce((sum, employee) => sum + employee.salary, 0);
  const updateCost = useCostsStore((state) => state.updateCost);

  React.useEffect(() => {
    updateCost('employeesPayroll', totalSalary);
  }, [totalSalary, updateCost]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateEmployee(editingId, formData);
    } else {
      addEmployee(formData);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      name: '',
      position: '',
      department: '',
      salary: 0,
      startDate: new Date().toISOString().split('T')[0],
      status: 'active'
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      deleteEmployee(id);
    }
  };

  const getStatusColor = (status: Employee['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      'on-leave': 'bg-yellow-100 text-yellow-800',
      terminated: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      Engineering: 'bg-blue-100 text-blue-800',
      Product: 'bg-purple-100 text-purple-800',
      Design: 'bg-pink-100 text-pink-800',
      Marketing: 'bg-green-100 text-green-800',
      Sales: 'bg-yellow-100 text-yellow-800',
      HR: 'bg-orange-100 text-orange-800'
    };
    return colors[department] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-[#fefae0] p-6">
      <div className="max-w-7xl mx-auto">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-[#a47148]" />
            <div>
              <h1 className="text-3xl font-bold text-stone-900">Employees Payroll</h1>
              <p className="text-stone-600">Manage employee salaries and payroll information</p>
            </div>
          </div>
          <button
            onClick={() => {
              setFormData({
                name: '',
                position: '',
                department: '',
                salary: 0,
                startDate: new Date().toISOString().split('T')[0],
                status: 'active'
              });
              setEditingId(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-[#a47148] to-black text-[#fefae0] rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Employee
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-[#fefae0] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-700 mb-4">Total Payroll</h3>
            <p className="text-3xl font-bold">${totalSalary.toFixed(2)}</p>
            <p className="text-stone-600 mt-2">{employees.length} employees</p>
          </div>
          <div className="bg-[#fefae0] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-700 mb-4">Active Employees</h3>
            <p className="text-3xl font-bold">
              {employees.filter(e => e.status === 'active').length}
            </p>
            <p className="text-stone-600 mt-2">Currently working</p>
          </div>
          <div className="bg-[#fefae0] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-700 mb-4">On Leave</h3>
            <p className="text-3xl font-bold">
              {employees.filter(e => e.status === 'on-leave').length}
            </p>
            <p className="text-stone-600 mt-2">Temporary absence</p>
          </div>
          <div className="bg-[#fefae0] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-700 mb-4">Average Salary</h3>
            <p className="text-3xl font-bold">
              ${(totalSalary / employees.length || 0).toFixed(2)}
            </p>
            <p className="text-stone-600 mt-2">Per employee</p>
          </div>
        </div>

        <div className="bg-[#fefae0] rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1fr,auto,auto,auto,auto,auto] gap-4 p-4 bg-gray-50 font-medium text-gray-700">
            <div>Name</div>
            <div>Department</div>
            <div>Position</div>
            <div>Start Date</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          <div className="divide-y">
            {employees.map((employee) => (
              <div key={employee.id} className="grid grid-cols-[1fr,auto,auto,auto,auto,auto] gap-4 p-4 items-center">
                <div>
                  <div className="font-medium text-gray-900">{employee.name}</div>
                  <div className="text-sm text-gray-500">${employee.salary.toFixed(2)}/month</div>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDepartmentColor(employee.department)}`}>
                    {employee.department}
                  </span>
                </div>
                <div className="text-gray-600">{employee.position}</div>
                <div className="text-gray-600">{employee.startDate}</div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                    {employee.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setFormData(employee);
                      setEditingId(employee.id);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(employee.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#fefae0] rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingId ? 'Edit Employee' : 'Add Employee'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingId(null);
                  setFormData({
                    name: '',
                    position: '',
                    department: '',
                    salary: 0,
                    startDate: new Date().toISOString().split('T')[0],
                    status: 'active'
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary (monthly)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Employee['status'] })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="active">Active</option>
                  <option value="on-leave">On Leave</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                    setFormData({
                      name: '',
                      position: '',
                      department: '',
                      salary: 0,
                      startDate: new Date().toISOString().split('T')[0],
                      status: 'active'
                    });
                  }}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#a47148] to-black text-[#fefae0] rounded-lg"
                >
                  {editingId ? 'Save Changes' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
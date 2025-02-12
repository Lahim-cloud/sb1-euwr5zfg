import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Plus, Pencil, Trash2, X, DollarSign } from 'lucide-react';
import { useCostsStore } from '../data/costs';

type InsurancePolicy = {
  id: string;
  employeeName: string;
  policyNumber: string;
  provider: string;
  monthlyCost: number;
  coverage: 'basic' | 'standard' | 'premium';
  status: 'active' | 'pending' | 'expired';
  startDate: string;
  endDate: string;
  dependents: number;
};

export default function HealthInsurance() {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([
    {
      id: '1',
      employeeName: 'John Doe',
      policyNumber: 'HI-2025-001',
      provider: 'Blue Cross',
      monthlyCost: 350,
      coverage: 'premium',
      status: 'active',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      dependents: 2
    },
    {
      id: '2',
      employeeName: 'Jane Smith',
      policyNumber: 'HI-2025-002',
      provider: 'Aetna',
      monthlyCost: 300,
      coverage: 'standard',
      status: 'active',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      dependents: 1
    },
    {
      id: '3',
      employeeName: 'Mike Johnson',
      policyNumber: 'HI-2025-003',
      provider: 'United Health',
      monthlyCost: 200,
      coverage: 'basic',
      status: 'active',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      dependents: 0
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<InsurancePolicy, 'id'>>({
    employeeName: '',
    policyNumber: '',
    provider: '',
    monthlyCost: 0,
    coverage: 'basic',
    status: 'active',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    dependents: 0
  });

  const totalMonthlyCost = policies.reduce((sum, policy) => sum + policy.monthlyCost, 0);
  const updateCost = useCostsStore((state) => state.updateCost);

  React.useEffect(() => {
    updateCost('healthInsurance', totalMonthlyCost);
  }, [totalMonthlyCost, updateCost]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setPolicies(policies.map(policy => 
        policy.id === editingId ? { ...formData, id: editingId } : policy
      ));
    } else {
      setPolicies([...policies, { ...formData, id: Math.random().toString(36).substr(2, 9) }]);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      employeeName: '',
      policyNumber: '',
      provider: '',
      monthlyCost: 0,
      coverage: 'basic',
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      dependents: 0
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this policy?')) {
      setPolicies(policies.filter(policy => policy.id !== id));
    }
  };

  const getCoverageColor = (coverage: InsurancePolicy['coverage']) => {
    const colors = {
      basic: 'bg-blue-100 text-blue-800',
      standard: 'bg-green-100 text-green-800',
      premium: 'bg-purple-100 text-purple-800'
    };
    return colors[coverage];
  };

  const getStatusColor = (status: InsurancePolicy['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800'
    };
    return colors[status];
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
            <Heart className="w-8 h-8 text-[#a47148]" />
            <div>
              <h1 className="text-3xl font-bold text-stone-900">Health Insurance</h1>
              <p className="text-stone-600">Manage employee health insurance policies</p>
            </div>
          </div>
          <button
            onClick={() => {
              setFormData({
                employeeName: '',
                policyNumber: '',
                provider: '',
                monthlyCost: 0,
                coverage: 'basic',
                status: 'active',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                dependents: 0
              });
              setEditingId(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-[#a47148] to-black text-[#fefae0] rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Policy
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-[#fefae0] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-700 mb-4">Total Monthly Cost</h3>
            <p className="text-3xl font-bold">${totalMonthlyCost.toFixed(2)}</p>
            <p className="text-stone-600 mt-2">{policies.length} active policies</p>
          </div>
          <div className="bg-[#fefae0] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-700 mb-4">Total Employees</h3>
            <p className="text-3xl font-bold">{policies.length}</p>
            <p className="text-stone-600 mt-2">Insured employees</p>
          </div>
          <div className="bg-[#fefae0] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-700 mb-4">Total Dependents</h3>
            <p className="text-3xl font-bold">
              {policies.reduce((sum, policy) => sum + policy.dependents, 0)}
            </p>
            <p className="text-stone-600 mt-2">Covered family members</p>
          </div>
          <div className="bg-[#fefae0] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-700 mb-4">Average Cost</h3>
            <p className="text-3xl font-bold">
              ${(totalMonthlyCost / policies.length || 0).toFixed(2)}
            </p>
            <p className="text-stone-600 mt-2">Per employee</p>
          </div>
        </div>

        <div className="bg-[#fefae0] rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1fr,auto,auto,auto,auto,auto,auto] gap-4 p-4 bg-gray-50 font-medium text-gray-700">
            <div>Employee</div>
            <div>Policy Number</div>
            <div>Provider</div>
            <div>Coverage</div>
            <div>Monthly Cost</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          <div className="divide-y">
            {policies.map((policy) => (
              <div key={policy.id} className="grid grid-cols-[1fr,auto,auto,auto,auto,auto,auto] gap-4 p-4 items-center">
                <div>
                  <div className="font-medium text-gray-900">{policy.employeeName}</div>
                  <div className="text-sm text-gray-500">{policy.dependents} dependents</div>
                </div>
                <div className="text-gray-600">{policy.policyNumber}</div>
                <div className="text-gray-600">{policy.provider}</div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCoverageColor(policy.coverage)}`}>
                    {policy.coverage}
                  </span>
                </div>
                <div className="font-medium">${policy.monthlyCost.toFixed(2)}</div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}>
                    {policy.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setFormData(policy);
                      setEditingId(policy.id);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(policy.id)}
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
                {editingId ? 'Edit Policy' : 'Add Policy'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingId(null);
                  setFormData({
                    employeeName: '',
                    policyNumber: '',
                    provider: '',
                    monthlyCost: 0,
                    coverage: 'basic',
                    status: 'active',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: '',
                    dependents: 0
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
                  Employee Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.employeeName}
                  onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policy Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.policyNumber}
                  onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider
                </label>
                <input
                  type="text"
                  required
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Cost
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.monthlyCost}
                    onChange={(e) => setFormData({ ...formData, monthlyCost: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coverage Level
                </label>
                <select
                  value={formData.coverage}
                  onChange={(e) => setFormData({ ...formData, coverage: e.target.value as InsurancePolicy['coverage'] })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as InsurancePolicy['status'] })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    min={formData.startDate}
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Dependents
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.dependents}
                  onChange={(e) => setFormData({ ...formData, dependents: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                    setFormData({
                      employeeName: '',
                      policyNumber: '',
                      provider: '',
                      monthlyCost: 0,
                      coverage: 'basic',
                      status: 'active',
                      startDate: new Date().toISOString().split('T')[0],
                      endDate: '',
                      dependents: 0
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
                  {editingId ? 'Save Changes' : 'Add Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
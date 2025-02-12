import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, Plus, Pencil, Trash2, X, DollarSign, MapPin, Clock } from 'lucide-react';
import { useCostsStore } from '../data/costs';

type Branch = {
  id: string;
  name: string;
  location: string;
  expenses: RentExpense[];
};

type RentExpense = {
  id: string;
  name: string;
  annualAmount: number;
  dueDate: string;
  category: 'rent' | 'utilities' | 'maintenance' | 'security' | 'other';
  status: 'paid' | 'pending' | 'overdue';
  notes: string;
};

type Period = 'monthly' | 'quarterly' | 'semi-annually' | 'annually';

export default function OfficeRent() {
  const [branches, setBranches] = useState<Branch[]>([
    {
      id: '1',
      name: 'Main Office',
      location: 'Downtown',
      expenses: [
        {
          id: '1',
          name: 'Annual Office Rent',
          annualAmount: 18000,
          dueDate: '2025-03-01',
          category: 'rent',
          status: 'pending',
          notes: 'Main office space annual rent'
        },
        {
          id: '2',
          name: 'Annual Electricity',
          annualAmount: 2400,
          dueDate: '2025-03-05',
          category: 'utilities',
          status: 'pending',
          notes: 'Annual electricity charges'
        }
      ]
    },
    {
      id: '2',
      name: 'Branch Office',
      location: 'Suburb Area',
      expenses: [
        {
          id: '3',
          name: 'Annual Office Rent',
          annualAmount: 12000,
          dueDate: '2025-03-01',
          category: 'rent',
          status: 'pending',
          notes: 'Branch office annual rent'
        },
        {
          id: '4',
          name: 'Annual Utilities',
          annualAmount: 1800,
          dueDate: '2025-03-05',
          category: 'utilities',
          status: 'pending',
          notes: 'Branch utilities'
        }
      ]
    }
  ]);

  const [selectedBranch, setSelectedBranch] = useState<string>(branches[0]?.id || '');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);

  const [expenseFormData, setExpenseFormData] = useState<Omit<RentExpense, 'id'>>({
    name: '',
    annualAmount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    category: 'rent',
    status: 'pending',
    notes: ''
  });

  const [branchFormData, setBranchFormData] = useState<Omit<Branch, 'id' | 'expenses'>>({
    name: '',
    location: ''
  });

  const [selectedPeriod, setSelectedPeriod] = useState<Period>('monthly');

  const calculatePeriodCost = (annualAmount: number, period: Period) => {
    switch (period) {
      case 'monthly':
        return annualAmount / 12;
      case 'quarterly':
        return annualAmount / 4;
      case 'semi-annually':
        return annualAmount / 2;
      case 'annually':
        return annualAmount;
      default:
        return annualAmount;
    }
  };

  const getPeriodLabel = (period: Period) => {
    switch (period) {
      case 'monthly':
        return 'Monthly';
      case 'quarterly':
        return 'Quarterly';
      case 'semi-annually':
        return 'Semi-Annually';
      case 'annually':
        return 'Annually';
      default:
        return '';
    }
  };

  const totalAnnualRent = branches.reduce((sum, branch) => 
    sum + branch.expenses.reduce((branchSum, expense) => branchSum + expense.annualAmount, 0), 0
  );
  
  const periodCost = calculatePeriodCost(totalAnnualRent, selectedPeriod);
  const monthlyRent = totalAnnualRent / 12;
  const updateCost = useCostsStore((state) => state.updateCost);

  React.useEffect(() => {
    updateCost('officeRent', monthlyRent);
  }, [monthlyRent, updateCost]);

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const branch = branches.find(b => b.id === selectedBranch);
    if (!branch) return;

    if (editingExpenseId) {
      setBranches(branches.map(b => b.id === selectedBranch ? {
        ...b,
        expenses: b.expenses.map(expense => 
          expense.id === editingExpenseId ? { ...expenseFormData, id: editingExpenseId } : expense
        )
      } : b));
    } else {
      setBranches(branches.map(b => b.id === selectedBranch ? {
        ...b,
        expenses: [...b.expenses, { ...expenseFormData, id: Math.random().toString(36).substr(2, 9) }]
      } : b));
    }
    setIsExpenseModalOpen(false);
    setEditingExpenseId(null);
    setExpenseFormData({
      name: '',
      annualAmount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      category: 'rent',
      status: 'pending',
      notes: ''
    });
  };

  const handleBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBranchId) {
      setBranches(branches.map(branch => 
        branch.id === editingBranchId ? 
        { ...branch, ...branchFormData } : 
        branch
      ));
    } else {
      const newBranch: Branch = {
        ...branchFormData,
        id: Math.random().toString(36).substr(2, 9),
        expenses: []
      };
      setBranches([...branches, newBranch]);
      setSelectedBranch(newBranch.id);
    }
    setIsBranchModalOpen(false);
    setEditingBranchId(null);
    setBranchFormData({ name: '', location: '' });
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      setBranches(branches.map(b => b.id === selectedBranch ? {
        ...b,
        expenses: b.expenses.filter(expense => expense.id !== id)
      } : b));
    }
  };

  const handleDeleteBranch = (id: string) => {
    if (confirm('Are you sure you want to delete this branch and all its expenses?')) {
      setBranches(branches.filter(branch => branch.id !== id));
      if (selectedBranch === id) {
        setSelectedBranch(branches[0]?.id || '');
      }
    }
  };

  const getCategoryColor = (category: RentExpense['category']) => {
    const colors = {
      rent: 'bg-blue-100 text-blue-800',
      utilities: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      security: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category];
  };

  const getStatusColor = (status: RentExpense['status']) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const currentBranch = branches.find(b => b.id === selectedBranch);
  const branchTotalAnnual = currentBranch?.expenses.reduce((sum, expense) => sum + expense.annualAmount, 0) || 0;
  const branchMonthlyAverage = branchTotalAnnual / 12;

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
            <Building2 className="w-8 h-8 text-[#a47148]" />
            <div>
              <h1 className="text-3xl font-bold text-stone-900">Office Rent & Utilities</h1>
              <p className="text-stone-600">Manage annual office space expenses across branches</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setBranchFormData({ name: '', location: '' });
                setEditingBranchId(null);
                setIsBranchModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-[#a47148] to-black text-[#fefae0] rounded-lg flex items-center gap-2"
            >
              <Building2 className="w-5 h-5" />
              Add Branch
            </button>
            <button
              onClick={() => {
                if (!selectedBranch) {
                  alert('Please select a branch first');
                  return;
                }
                setExpenseFormData({
                  name: '',
                  annualAmount: 0,
                  dueDate: new Date().toISOString().split('T')[0],
                  category: 'rent',
                  status: 'pending',
                  notes: ''
                });
                setEditingExpenseId(null);
                setIsExpenseModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-[#a47148] to-black text-[#fefae0] rounded-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Expense
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Clock className="w-5 h-5 text-[#a47148]" />
            <h2 className="text-xl font-semibold">Select Period</h2>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {(['monthly', 'quarterly', 'semi-annually', 'annually'] as Period[]).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`p-4 rounded-xl transition-all duration-200 ${
                  selectedPeriod === period
                    ? 'bg-[#a47148] text-[#fefae0]'
                    : 'bg-[#fefae0] text-stone-900 hover:bg-[#a47148]/10'
                }`}
              >
                <div className="font-semibold">{getPeriodLabel(period)}</div>
                <div className={selectedPeriod === period ? 'text-[#fefae0]/80' : 'text-stone-600'}>
                  ${calculatePeriodCost(totalAnnualRent, period).toFixed(2)}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-[#fefae0] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-700 mb-4">{getPeriodLabel(selectedPeriod)} Cost</h3>
            <p className="text-3xl font-bold">${periodCost.toFixed(2)}</p>
            <p className="text-stone-600 mt-2">{branches.length} branches</p>
          </div>
          <div className="bg-[#fefae0] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-700 mb-4">Monthly Average</h3>
            <p className="text-3xl font-bold">${monthlyRent.toFixed(2)}</p>
            <p className="text-stone-600 mt-2">Per month</p>
          </div>
          <div className="bg-[#fefae0] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-700 mb-4">Branch {getPeriodLabel(selectedPeriod)}</h3>
            <p className="text-3xl font-bold">
              ${calculatePeriodCost(currentBranch?.expenses.reduce((sum, expense) => sum + expense.annualAmount, 0) || 0, selectedPeriod).toFixed(2)}
            </p>
            <p className="text-stone-600 mt-2">Current branch</p>
          </div>
          <div className="bg-[#fefae0] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-700 mb-4">Branch Annual</h3>
            <p className="text-3xl font-bold">${(currentBranch?.expenses.reduce((sum, expense) => sum + expense.annualAmount, 0) || 0).toFixed(2)}</p>
            <p className="text-stone-600 mt-2">Current branch</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Select Branch
          </label>
          <div className="grid grid-cols-4 gap-4">
            {branches.map((branch) => (
              <div
                key={branch.id}
                onClick={() => setSelectedBranch(branch.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedBranch === branch.id
                    ? 'bg-[#a47148] text-[#fefae0]'
                    : 'bg-[#fefae0] text-stone-900 hover:bg-[#a47148]/10'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{branch.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setBranchFormData({
                          name: branch.name,
                          location: branch.location
                        });
                        setEditingBranchId(branch.id);
                        setIsBranchModalOpen(true);
                      }}
                      className={`p-1 rounded-lg ${
                        selectedBranch === branch.id
                          ? 'hover:bg-[#a47148]/80 text-[#fefae0]'
                          : 'hover:bg-stone-100 text-stone-600'
                      }`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBranch(branch.id);
                      }}
                      className={`p-1 rounded-lg ${
                        selectedBranch === branch.id
                          ? 'hover:bg-red-500/80 text-[#fefae0]'
                          : 'hover:bg-red-50 text-red-600'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  selectedBranch === branch.id
                    ? 'text-[#fefae0]/80'
                    : 'text-stone-600'
                }`}>
                  <MapPin className="w-4 h-4" />
                  {branch.location}
                </div>
              </div>
            ))}
          </div>
        </div>

        {currentBranch && (
          <div className="bg-[#fefae0] rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-[1fr,auto,auto,auto,auto,auto] gap-4 p-4 bg-gray-50 font-medium text-gray-700">
              <div>Name</div>
              <div>Category</div>
              <div>Annual Amount</div>
              <div>Due Date</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            <div className="divide-y">
              {currentBranch.expenses.map((expense) => (
                <div key={expense.id} className="grid grid-cols-[1fr,auto,auto,auto,auto,auto] gap-4 p-4 items-center">
                  <div>
                    <div className="font-medium text-gray-900">{expense.name}</div>
                    <div className="text-sm text-gray-500">{expense.notes}</div>
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                      {expense.category}
                    </span>
                  </div>
                  <div className="font-medium">${expense.annualAmount.toFixed(2)}</div>
                  <div className="text-gray-600">{expense.dueDate}</div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                      {expense.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setExpenseFormData(expense);
                        setEditingExpenseId(expense.id);
                        setIsExpenseModalOpen(true);
                      }}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Branch Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#fefae0] rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingBranchId ? 'Edit Branch' : 'Add Branch'}
              </h2>
              <button
                onClick={() => {
                  setIsBranchModalOpen(false);
                  setEditingBranchId(null);
                  setBranchFormData({ name: '', location: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleBranchSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Name
                </label>
                <input
                  type="text"
                  required
                  value={branchFormData.name}
                  onChange={(e) => setBranchFormData({ ...branchFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  required
                  value={branchFormData.location}
                  onChange={(e) => setBranchFormData({ ...branchFormData, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsBranchModalOpen(false);
                    setEditingBranchId(null);
                    setBranchFormData({ name: '', location: '' });
                  }}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#a47148] to-black text-[#fefae0] rounded-lg"
                >
                  {editingBranchId ? 'Save Changes' : 'Add Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#fefae0] rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingExpenseId ? 'Edit Expense' : 'Add Expense'}
              </h2>
              <button
                onClick={() => {
                  setIsExpenseModalOpen(false);
                  setEditingExpenseId(null);
                  setExpenseFormData({
                    name: '',
                    annualAmount: 0,
                    dueDate: new Date().toISOString().split('T')[0],
                    category: 'rent',
                    status: 'pending',
                    notes: ''
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={expenseFormData.name}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Amount
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
                    value={expenseFormData.annualAmount}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, annualAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-3 py-2 border rounded-lg"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Monthly: ${((expenseFormData.annualAmount || 0) / 12).toFixed(2)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={expenseFormData.category}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value as RentExpense['category'] })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="rent">Rent</option>
                  <option value="utilities">Utilities</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="security">Security</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  value={expenseFormData.dueDate}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={expenseFormData.status}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, status: e.target.value as RentExpense['status'] })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={expenseFormData.notes}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsExpenseModalOpen(false);
                    setEditingExpenseId(null);
                    setExpenseFormData({
                      name: '',
                      annualAmount: 0,
                      dueDate: new Date().toISOString().split('T')[0],
                      category: 'rent',
                      status: 'pending',
                      notes: ''
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
                  {editingExpenseId ? 'Save Changes' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
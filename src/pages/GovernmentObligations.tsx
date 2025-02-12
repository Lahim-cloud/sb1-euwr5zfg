import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, Plus, Pencil, Trash2, X } from 'lucide-react';
import { useCostsStore } from '../data/costs';
import { useObligationsStore, Obligation } from '../data/obligations';

export default function GovernmentObligations() {
  const { obligations, addObligation, updateObligation, deleteObligation } = useObligationsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Obligation, 'id'>>({
    name: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    category: 'other'
  });

  const totalAmount = obligations.reduce((sum, obligation) => sum + obligation.amount, 0);
  const updateCost = useCostsStore((state) => state.updateCost);

  React.useEffect(() => {
    updateCost('governmentObligations', totalAmount);
  }, [totalAmount, updateCost]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateObligation(editingId, formData);
    } else {
      addObligation(formData);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      name: '',
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      category: 'other'
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this obligation?')) {
      deleteObligation(id);
    }
  };

  const getStatusColor = (status: Obligation['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const getCategoryColor = (category: Obligation['category']) => {
    const colors = {
      tax: 'bg-blue-100 text-blue-800',
      license: 'bg-purple-100 text-purple-800',
      permit: 'bg-green-100 text-green-800',
      insurance: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category];
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
            <Scale className="w-8 h-8 text-orange-600" />
            <div>
              <h1 className="text-3xl font-bold text-stone-900">Government Obligations</h1>
              <p className="text-stone-600">Manage your regulatory and compliance costs</p>
            </div>
          </div>
          <button
            onClick={() => {
              setFormData({
                name: '',
                amount: 0,
                dueDate: new Date().toISOString().split('T')[0],
                status: 'pending',
                category: 'other'
              });
              setEditingId(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-[#fefae0] rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Obligation
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-[#fefae0] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-700 mb-4">Total Obligations</h3>
            <p className="text-3xl font-bold">${totalAmount.toFixed(2)}</p>
            <p className="text-stone-600 mt-2">{obligations.length} obligations</p>
          </div>
          <div className="bg-[#fefae0] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-700 mb-4">Pending</h3>
            <p className="text-3xl font-bold">
              ${obligations.filter(o => o.status === 'pending')
                .reduce((sum, o) => sum + o.amount, 0)
                .toFixed(2)}
            </p>
            <p className="text-stone-600 mt-2">
              {obligations.filter(o => o.status === 'pending').length} obligations
            </p>
          </div>
          <div className="bg-[#fefae0] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-700 mb-4">Paid</h3>
            <p className="text-3xl font-bold">
              ${obligations.filter(o => o.status === 'paid')
                .reduce((sum, o) => sum + o.amount, 0)
                .toFixed(2)}
            </p>
            <p className="text-stone-600 mt-2">
              {obligations.filter(o => o.status === 'paid').length} obligations
            </p>
          </div>
          <div className="bg-[#fefae0] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-700 mb-4">Overdue</h3>
            <p className="text-3xl font-bold text-red-600">
              ${obligations.filter(o => o.status === 'overdue')
                .reduce((sum, o) => sum + o.amount, 0)
                .toFixed(2)}
            </p>
            <p className="text-stone-600 mt-2">
              {obligations.filter(o => o.status === 'overdue').length} obligations
            </p>
          </div>
        </div>

        <div className="bg-[#fefae0] rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1fr,auto,auto,auto,auto] gap-4 p-4 bg-gray-50 font-medium text-gray-700">
            <div>Name</div>
            <div>Category</div>
            <div>Due Date</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          <div className="divide-y">
            {obligations.map((obligation) => (
              <div key={obligation.id} className="grid grid-cols-[1fr,auto,auto,auto,auto] gap-4 p-4 items-center">
                <div>
                  <div className="font-medium text-gray-900">{obligation.name}</div>
                  <div className="text-sm text-gray-500">${obligation.amount.toFixed(2)}</div>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(obligation.category)}`}>
                    {obligation.category}
                  </span>
                </div>
                <div className="text-gray-600">{obligation.dueDate}</div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(obligation.status)}`}>
                    {obligation.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setFormData(obligation);
                      setEditingId(obligation.id);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(obligation.id)}
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
                {editingId ? 'Edit Obligation' : 'Add Obligation'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingId(null);
                  setFormData({
                    name: '',
                    amount: 0,
                    dueDate: new Date().toISOString().split('T')[0],
                    status: 'pending',
                    category: 'other'
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
                  Amount
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Obligation['category'] })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="tax">Tax</option>
                  <option value="license">License</option>
                  <option value="permit">Permit</option>
                  <option value="insurance">Insurance</option>
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
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Obligation['status'] })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
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
                      amount: 0,
                      dueDate: new Date().toISOString().split('T')[0],
                      status: 'pending',
                      category: 'other'
                    });
                  }}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-[#fefae0] rounded-lg"
                >
                  {editingId ? 'Save Changes' : 'Add Obligation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
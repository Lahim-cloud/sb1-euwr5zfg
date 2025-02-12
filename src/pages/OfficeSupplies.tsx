import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Plus, Pencil, Trash2, X } from 'lucide-react';
import { useCostsStore } from '../data/costs';
import { useSuppliesStore, Supply } from '../data/supplies';

export default function OfficeSupplies() {
  const { supplies, addSupply, updateSupply, deleteSupply } = useSuppliesStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Supply, 'id'>>({
    name: '',
    monthlyQuantity: 0,
    unitCost: 0,
    category: 'office',
    lastPurchased: new Date().toISOString().split('T')[0],
    reorderPoint: 0,
    monthlyBudget: 0
  });

  const totalMonthlyCost = supplies.reduce((sum, supply) => sum + (supply.monthlyQuantity * supply.unitCost), 0);
  const totalMonthlyBudget = supplies.reduce((sum, supply) => sum + supply.monthlyBudget, 0);
  const updateCost = useCostsStore((state) => state.updateCost);

  React.useEffect(() => {
    updateCost('officeSupplies', totalMonthlyCost);
  }, [totalMonthlyCost, updateCost]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateSupply(editingId, formData);
    } else {
      addSupply(formData);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      name: '',
      monthlyQuantity: 0,
      unitCost: 0,
      category: 'office',
      lastPurchased: new Date().toISOString().split('T')[0],
      reorderPoint: 0,
      monthlyBudget: 0
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this supply item?')) {
      deleteSupply(id);
    }
  };

  const getLowStockItems = () => {
    return supplies.filter(supply => supply.monthlyQuantity <= supply.reorderPoint);
  };

  const getOverBudgetItems = () => {
    return supplies.filter(supply => (supply.monthlyQuantity * supply.unitCost) > supply.monthlyBudget);
  };

  const getCategoryColor = (category: Supply['category']) => {
    const colors = {
      office: 'bg-blue-100 text-blue-800',
      cleaning: 'bg-green-100 text-green-800',
      kitchen: 'bg-yellow-100 text-yellow-800',
      tech: 'bg-purple-100 text-purple-800',
      furniture: 'bg-orange-100 text-orange-800',
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
            <Package className="w-8 h-8 text-[#a47148]" />
            <div>
              <h1 className="text-3xl font-bold text-stone-900">Office Supplies & Bills</h1>
              <p className="text-stone-600">Manage your monthly office supplies and budgets</p>
            </div>
          </div>
          <button
            onClick={() => {
              setFormData({
                name: '',
                monthlyQuantity: 0,
                unitCost: 0,
                category: 'office',
                lastPurchased: new Date().toISOString().split('T')[0],
                reorderPoint: 0,
                monthlyBudget: 0
              });
              setEditingId(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-[#a47148] to-black text-[#fefae0] rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Supply
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-[#fefae0] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-700 mb-4">Monthly Cost</h3>
            <p className="text-3xl font-bold">${totalMonthlyCost.toFixed(2)}</p>
            <p className="text-stone-600 mt-2">{supplies.length} items</p>
          </div>
          <div className="bg-[#fefae0] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-700 mb-4">Monthly Budget</h3>
            <p className="text-3xl font-bold">${totalMonthlyBudget.toFixed(2)}</p>
            <p className={`text-sm mt-2 ${totalMonthlyCost > totalMonthlyBudget ? 'text-red-600' : 'text-green-600'}`}>
              {totalMonthlyCost > totalMonthlyBudget 
                ? `$${(totalMonthlyCost - totalMonthlyBudget).toFixed(2)} over budget`
                : `$${(totalMonthlyBudget - totalMonthlyCost).toFixed(2)} under budget`}
            </p>
          </div>
          <div className="bg-[#fefae0] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-700 mb-4">Low Stock</h3>
            <p className="text-3xl font-bold">{getLowStockItems().length}</p>
            <p className="text-stone-600 mt-2">Items to reorder</p>
          </div>
          <div className="bg-[#fefae0] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-700 mb-4">Over Budget</h3>
            <p className="text-3xl font-bold text-red-600">{getOverBudgetItems().length}</p>
            <p className="text-stone-600 mt-2">Items exceeding budget</p>
          </div>
        </div>

        {getLowStockItems().length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded-r-xl">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Low Stock Alert
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    {getLowStockItems().length} items need to be reordered:
                    {getLowStockItems().map(item => ` ${item.name}`).join(',')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {getOverBudgetItems().length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r-xl">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Budget Alert
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    {getOverBudgetItems().length} items are over their monthly budget:
                    {getOverBudgetItems().map(item => ` ${item.name}`).join(',')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#fefae0] rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1fr,auto,auto,auto,auto,auto,auto] gap-4 p-4 bg-gray-50 font-medium text-gray-700">
            <div>Name</div>
            <div>Category</div>
            <div>Monthly Qty</div>
            <div>Unit Cost</div>
            <div>Monthly Cost</div>
            <div>Monthly Budget</div>
            <div>Actions</div>
          </div>
          <div className="divide-y">
            {supplies.map((supply) => {
              const monthlyCost = supply.monthlyQuantity * supply.unitCost;
              const isOverBudget = monthlyCost > supply.monthlyBudget;

              return (
                <div key={supply.id} className="grid grid-cols-[1fr,auto,auto,auto,auto,auto,auto] gap-4 p-4 items-center">
                  <div>
                    <div className="font-medium text-gray-900">{supply.name}</div>
                    <div className="text-sm text-gray-500">
                      Last purchased: {supply.lastPurchased}
                    </div>
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(supply.category)}`}>
                      {supply.category}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{supply.monthlyQuantity}</div>
                    {supply.monthlyQuantity <= supply.reorderPoint && (
                      <div className="text-xs text-red-600">Low stock</div>
                    )}
                  </div>
                  <div>${supply.unitCost.toFixed(2)}</div>
                  <div className={isOverBudget ? 'text-red-600 font-medium' : ''}>
                    ${monthlyCost.toFixed(2)}
                  </div>
                  <div>${supply.monthlyBudget.toFixed(2)}</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setFormData(supply);
                        setEditingId(supply.id);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(supply.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#fefae0] rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingId ? 'Edit Supply' : 'Add Supply'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingId(null);
                  setFormData({
                    name: '',
                    monthlyQuantity: 0,
                    unitCost: 0,
                    category: 'office',
                    lastPurchased: new Date().toISOString().split('T')[0],
                    reorderPoint: 0,
                    monthlyBudget: 0
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.monthlyQuantity}
                    onChange={(e) => setFormData({ ...formData, monthlyQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Cost
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Budget
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.monthlyBudget}
                  onChange={(e) => setFormData({ ...formData, monthlyBudget: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Supply['category'] })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="office">Office</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="tech">Tech</option>
                  <option value="furniture">Furniture</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Purchased
                </label>
                <input
                  type="date"
                  required
                  value={formData.lastPurchased}
                  onChange={(e) => setFormData({ ...formData, lastPurchased: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reorder Point
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.reorderPoint}
                  onChange={(e) => setFormData({ ...formData, reorderPoint: parseInt(e.target.value) || 0 })}
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
                      name: '',
                      monthlyQuantity: 0,
                      unitCost: 0,
                      category: 'office',
                      lastPurchased: new Date().toISOString().split('T')[0],
                      reorderPoint: 0,
                      monthlyBudget: 0
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
                  {editingId ? 'Save Changes' : 'Add Supply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
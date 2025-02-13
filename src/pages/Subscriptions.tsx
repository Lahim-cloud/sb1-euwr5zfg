import React, { useState } from 'react';
import { Plus, ExternalLink, Pencil, Trash2, X, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSubscriptionsStore, Subscription } from '../data/subscriptions';

type SubscriptionFormData = Omit<Subscription, 'id'>;

const CATEGORIES = ['development', 'design', 'marketing', 'productivity', 'other'] as const;
const BILLING_CYCLES = ['monthly', 'annually'] as const;

const initialFormData: SubscriptionFormData = {
  name: '',
  description: '',
  monthlyCost: 0,
  billingCycle: 'monthly',
  category: 'other',
  website: '',
  renewalDate: new Date().toISOString().split('T')[0]
};

export default function Subscriptions() {
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription } = useSubscriptionsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SubscriptionFormData>(initialFormData);

  const totalMonthlyCost = subscriptions.reduce((sum, sub) => sum + sub.monthlyCost, 0);
  const totalAnnualCost = totalMonthlyCost * 12;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateSubscription(editingId, formData);
    } else {
      addSubscription(formData);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const handleEdit = (subscription: Subscription) => {
    setFormData(subscription);
    setEditingId(subscription.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this subscription?')) {
      deleteSubscription(id);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      development: 'bg-blue-100 text-blue-800',
      design: 'bg-purple-100 text-purple-800',
      marketing: 'bg-green-100 text-green-800',
      productivity: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
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
          <div>
            <h1 className="text-3xl font-bold text-stone-900">App Subscriptions</h1>
            <p className="text-stone-600">Manage your software subscriptions and costs</p>
          </div>
          <button
            onClick={() => {
              setFormData(initialFormData);
              setEditingId(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-[#a47148] to-black text-[#fefae0] rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Subscription
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-[#fefae0] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-700 mb-4">Monthly Cost</h3>
            <p className="text-3xl font-bold">${totalMonthlyCost.toFixed(2)}</p>
            <p className="text-stone-600 mt-2">{subscriptions.length} active subscriptions</p>
          </div>
          <div className="bg-[#fefae0] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-700 mb-4">Annual Cost</h3>
            <p className="text-3xl font-bold">${totalAnnualCost.toFixed(2)}</p>
            <p className="text-stone-600 mt-2">Projected yearly spending</p>
          </div>
        </div>

        <div className="bg-[#fefae0] rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1fr,1fr,auto,auto,auto,auto] gap-4 p-4 bg-gray-50 font-medium text-gray-700">
            <div>Name</div>
            <div>Description</div>
            <div>Category</div>
            <div>Billing Cycle</div>
            <div>Monthly Cost</div>
            <div>Actions</div>
          </div>
          <div className="divide-y">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="grid grid-cols-[1fr,1fr,auto,auto,auto,auto] gap-4 p-4 items-center">
                <div>
                  <div className="font-medium text-gray-900">{subscription.name}</div>
                  <a
                    href={subscription.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    Visit site <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="text-gray-600">{subscription.description}</div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(subscription.category)}`}>
                    {subscription.category}
                  </span>
                </div>
                <div className="text-gray-600">{subscription.billingCycle}</div>
                <div className="font-medium">${subscription.monthlyCost.toFixed(2)}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(subscription)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(subscription.id)}
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
                {editingId ? 'Edit Subscription' : 'Add Subscription'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingId(null);
                  setFormData(initialFormData);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  App Name
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
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Cost
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.monthlyCost}
                  onChange={(e) => setFormData({ ...formData, monthlyCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Subscription['category'] })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Billing Cycle
                </label>
                <select
                  value={formData.billingCycle}
                  onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as Subscription['billingCycle'] })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {BILLING_CYCLES.map((cycle) => (
                    <option key={cycle} value={cycle}>
                      {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  required
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Renewal Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.renewalDate}
                  onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                    setFormData(initialFormData);
                  }}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#a47148] to-black text-[#fefae0] rounded-lg"
                >
                  {editingId ? 'Save Changes' : 'Add Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

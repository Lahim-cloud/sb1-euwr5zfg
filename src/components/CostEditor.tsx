import React, { useState } from 'react';
import { useCostsStore } from '../data/costs';

type CostEditorProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CostEditor({ isOpen, onClose }: CostEditorProps) {
  const costs = useCostsStore((state) => state.costs);
  const updateCost = useCostsStore((state) => state.updateCost);
  const [editedCosts, setEditedCosts] = useState(
    costs.reduce((acc, cost) => ({
      ...acc,
      [cost.id]: cost.monthlyCost
    }), {} as Record<string, number>)
  );

  const handleSave = () => {
    Object.entries(editedCosts).forEach(([id, cost]) => {
      updateCost(id, cost);
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-[#e9edc9] rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Monthly Costs</h2>
        <div className="space-y-4">
          {costs.map((cost) => (
            <div key={cost.id} className="flex items-center gap-4">
              <label className="flex-1">{cost.name}</label>
              <input
                type="number"
                value={editedCosts[cost.id]}
                onChange={(e) => setEditedCosts(prev => ({
                  ...prev,
                  [cost.id]: parseFloat(e.target.value) || 0
                }))}
                className="w-32 px-3 py-2 border rounded-lg"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-gradient-to-r from-[#588157] to-black text-[#e9edc9] rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

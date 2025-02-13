import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, X, Calendar, Clock, AlertTriangle, DollarSign } from 'lucide-react';
import { useProjectsStore, Project } from '../data/projects';
import { useCostsStore } from '../data/costs';

type ProjectFormData = Omit<Project, 'id' | 'durationInWeeks' | 'remainingWeeks' | 'profitMargin'>;

export default function Projects() {
  const { 
    projects, 
    loading, 
    error, 
    fetchProjects, 
    addProject, 
    updateProject, 
    deleteProject,
    calculateProfitMargin 
  } = useProjectsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const monthlyOverhead = useCostsStore((state) => state.costs.reduce((sum, cost) => sum + cost.monthlyCost, 0));
  
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'active',
    overheadAllocationPercentage: 20,
    price: 0
  });

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateProject(editingId, formData);
    } else {
      await addProject(formData);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'active',
      overheadAllocationPercentage: 20,
      price: 0
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await deleteProject(id);
    }
  };

  const getStatusColor = (status: Project['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const calculateProjectCost = (project: Project) => {
    const weeklyOverhead = monthlyOverhead * (12/52);
    const allocatedOverhead = (weeklyOverhead * project.durationInWeeks) * (project.overheadAllocationPercentage / 100);
    return allocatedOverhead;
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
            <h1 className="text-3xl font-bold text-stone-900">Projects</h1>
            <p className="text-stone-600">Manage your projects and track their progress</p>
          </div>
          <button
            onClick={() => {
              setFormData({
                name: '',
                description: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                status: 'active',
                overheadAllocationPercentage: 20,
                price: 0
              });
              setEditingId(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-[#a47148] to-black text-[#fefae0] rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Project
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-xl">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-stone-600">
              No projects yet. Click "Add Project" to create one.
            </div>
          ) : (
            projects.map((project) => {
              const costs = calculateProjectCost(project);
              const profitMargin = calculateProfitMargin(project.price, costs);
              
              return (
                <div
                  key={project.id}
                  className="bg-[#fefae0] rounded-xl p-6 shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-stone-900">{project.name}</h2>
                      <p className="text-stone-600 mt-1">{project.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setFormData({
                            name: project.name,
                            description: project.description,
                            startDate: project.startDate,
                            endDate: project.endDate,
                            status: project.status,
                            overheadAllocationPercentage: project.overheadAllocationPercentage,
                            price: project.price
                          });
                          setEditingId(project.id);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-4">
                    <div>
                      <div className="text-sm text-stone-600">Status</div>
                      <span className={`mt-1 inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm text-stone-600">Duration</div>
                      <div className="font-medium">{project.durationInWeeks} weeks</div>
                    </div>
                    <div>
                      <div className="text-sm text-stone-600">Project Cost</div>
                      <div className="font-medium">${costs.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-stone-600">Project Price</div>
                      <div className="font-medium">${project.price.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-stone-600">Profit Margin</div>
                      <div className="font-medium">{profitMargin.toFixed(2)}%</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-4 border-t border-stone-200">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-stone-400" />
                      <span className="text-sm text-stone-600">
                        {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-stone-400" />
                      <span className="text-sm text-stone-600">
                        {project.remainingWeeks > 0
                          ? `${project.remainingWeeks} weeks remaining`
                          : 'Project end date has passed'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#fefae0] rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingId ? 'Edit Project' : 'Add Project'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingId(null);
                  setFormData({
                    name: '',
                    description: '',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: '',
                    status: 'active',
                    overheadAllocationPercentage: 20,
                    price: 0
                  });
                }}
                className="p-2 hover:bg-stone-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#a47148]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#a47148]"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#a47148]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    min={formData.startDate}
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#a47148]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#a47148]"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Overhead Allocation Percentage
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={formData.overheadAllocationPercentage}
                  onChange={(e) => setFormData({ ...formData, overheadAllocationPercentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#a47148]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Project Price
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="w-4 h-4 text-stone-400" />
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#a47148]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                    setFormData({
                      name: '',
                      description: '',
                      startDate: new Date().toISOString().split('T')[0],
                      endDate: '',
                      status: 'active',
                      overheadAllocationPercentage: 20,
                      price: 0
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
                  {editingId ? 'Save Changes' : 'Add Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

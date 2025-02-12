import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calculator, DollarSign, Building, Clock, Package, Percent, AlertTriangle, Calendar } from 'lucide-react';
import { useCostsStore } from '../data/costs';
import { useProjectsStore } from '../data/projects';

type ProjectDetails = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  durationInWeeks: number;
  remainingWeeks: number;
};

type OverheadCosts = {
  allocationPercentage: number;
  autoAllocate: boolean;
  manualAllocationPercentage: number | null;
};

export default function PricingCalculator() {
  const costs = useCostsStore((state) => state.costs);
  const { projects, fetchProjects } = useProjectsStore();
  const monthlyOverhead = costs.reduce((sum, cost) => sum + cost.monthlyCost, 0);

  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    durationInWeeks: 0,
    remainingWeeks: 0
  });

  const [overheadCosts, setOverheadCosts] = useState<OverheadCosts>({
    allocationPercentage: 20,
    autoAllocate: true,
    manualAllocationPercentage: null
  });

  const [profitMargin, setProfitMargin] = useState(20);

  // Fetch active projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Calculate duration and remaining weeks when dates change
  useEffect(() => {
    if (projectDetails.startDate && projectDetails.endDate) {
      const start = new Date(projectDetails.startDate);
      const end = new Date(projectDetails.endDate);
      const today = new Date();

      // Calculate total duration in weeks
      const totalWeeks = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
      
      // Calculate remaining weeks
      const remainingWeeks = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7));

      setProjectDetails(prev => ({
        ...prev,
        durationInWeeks: totalWeeks,
        remainingWeeks: Math.max(0, remainingWeeks)
      }));

      // Calculate automatic allocation if enabled
      if (overheadCosts.autoAllocate) {
        const activeProjects = projects.filter(p => p.status === 'active' && new Date(p.endDate) > new Date());
        
        // Calculate total remaining weeks including the new project
        const totalRemainingWeeks = activeProjects.reduce((sum, p) => sum + p.remainingWeeks, 0) + Math.max(0, remainingWeeks);
        
        if (totalRemainingWeeks > 0) {
          // Calculate new project's percentage
          const newProjectPercentage = (Math.max(0, remainingWeeks) / totalRemainingWeeks) * 100;
          
          // Calculate percentages for existing projects
          const existingProjectsPercentages = activeProjects.map(p => ({
            id: p.id,
            percentage: (p.remainingWeeks / totalRemainingWeeks) * 100
          }));

          // Set the allocation percentage for the new project
          setOverheadCosts(prev => ({
            ...prev,
            allocationPercentage: newProjectPercentage
          }));

          // Update the active projects array with new percentages
          const updatedActiveProjects = activeProjects.map(p => ({
            ...p,
            allocationPercentage: existingProjectsPercentages.find(ep => ep.id === p.id)?.percentage || 0
          }));

          // Sort projects by allocation percentage
          updatedActiveProjects.sort((a, b) => b.allocationPercentage - a.allocationPercentage);

          // Verify total equals 100%
          const totalPercentage = newProjectPercentage + updatedActiveProjects.reduce((sum, p) => sum + p.allocationPercentage, 0);
          console.log('Total allocation percentage:', totalPercentage.toFixed(2) + '%');
        } else {
          // If no active projects or all projects have ended, allocate 100% to the new project
          setOverheadCosts(prev => ({
            ...prev,
            allocationPercentage: 100
          }));
        }
      }
    }
  }, [projectDetails.startDate, projectDetails.endDate, projects, overheadCosts.autoAllocate]);

  // Calculations
  const weeklyOverhead = monthlyOverhead * (12/52); // Convert monthly overhead to weekly
  const allocatedOverhead = (weeklyOverhead * projectDetails.durationInWeeks) * (overheadCosts.allocationPercentage / 100);
  const totalCosts = allocatedOverhead;
  const profitAmount = totalCosts * (profitMargin / 100);
  const projectPrice = totalCosts + profitAmount;

  // Get active projects for display
  const activeProjects = projects
    .filter(p => p.status === 'active' && new Date(p.endDate) > new Date())
    .map(p => ({
      ...p,
      allocationPercentage: overheadCosts.autoAllocate 
        ? (p.remainingWeeks / (p.remainingWeeks + projectDetails.remainingWeeks)) * 100
        : p.overheadAllocationPercentage
    }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#fefae0] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Project Price Calculator</h1>
            <p className="text-stone-600">Calculate project costs and pricing based on duration</p>
          </div>
          <Link
            to="/projects"
            className="px-4 py-2 bg-gradient-to-r from-[#a47148] to-black text-[#fefae0] rounded-lg flex items-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            <span>View Projects</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Project Details Card */}
            <div className="bg-[#f5f5dc] rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Building className="w-5 h-5 text-amber-900" />
                <h2 className="text-xl font-semibold">Project Details</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={projectDetails.name}
                    onChange={(e) => setProjectDetails({ ...projectDetails, name: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-900"
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={projectDetails.description}
                    onChange={(e) => setProjectDetails({ ...projectDetails, description: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-900"
                    rows={3}
                    placeholder="Enter project description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={projectDetails.startDate}
                      onChange={(e) => setProjectDetails({ ...projectDetails, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={projectDetails.endDate}
                      min={projectDetails.startDate}
                      onChange={(e) => setProjectDetails({ ...projectDetails, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-900"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Duration (Weeks)
                    </label>
                    <input
                      type="number"
                      value={projectDetails.durationInWeeks}
                      disabled
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Remaining (Weeks)
                    </label>
                    <input
                      type="number"
                      value={projectDetails.remainingWeeks}
                      disabled
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50"
                    />
                  </div>
                </div>
                {projectDetails.remainingWeeks < 0 && (
                  <div className="flex items-center gap-2 text-amber-900 bg-amber-50 p-3 rounded-lg">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm">Project end date has passed</span>
                  </div>
                )}
              </div>
            </div>

            {/* Active Projects Card */}
            <div className="bg-[#f5f5dc] rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Active Projects</h2>
              <div className="space-y-4">
                {activeProjects.length === 0 ? (
                  <p className="text-stone-600">No active projects</p>
                ) : (
                  activeProjects.map(project => (
                    <div key={project.id} className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-stone-600">{project.remainingWeeks} weeks remaining</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{project.allocationPercentage.toFixed(2)}%</div>
                        <div className="text-sm text-stone-600">allocation</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Overhead Costs Card */}
            <div className="bg-[#f5f5dc] rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-amber-900" />
                <h2 className="text-xl font-semibold">Overhead Costs</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Weekly Overhead
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="w-4 h-4 text-stone-400" />
                    </div>
                    <input
                      type="number"
                      value={weeklyOverhead}
                      disabled
                      className="w-full pl-8 pr-3 py-2 border border-stone-300 rounded-lg bg-stone-50"
                    />
                  </div>
                  <p className="text-sm text-stone-500 mt-1">
                    Automatically calculated from monthly overhead
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Allocation Method
                  </label>
                  <div className="flex items-center gap-4 mb-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={overheadCosts.autoAllocate}
                        onChange={() => setOverheadCosts(prev => ({
                          ...prev,
                          autoAllocate: true,
                          manualAllocationPercentage: null
                        }))}
                        className="text-amber-900 focus:ring-amber-900"
                      />
                      <span>Automatic</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={!overheadCosts.autoAllocate}
                        onChange={() => setOverheadCosts(prev => ({
                          ...prev,
                          autoAllocate: false,
                          manualAllocationPercentage: prev.allocationPercentage
                        }))}
                        className="text-amber-900 focus:ring-amber-900"
                      />
                      <span>Manual</span>
                    </label>
                  </div>
                  {!overheadCosts.autoAllocate && (
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        Manual Allocation Percentage
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={overheadCosts.manualAllocationPercentage || 0}
                          onChange={(e) => setOverheadCosts(prev => ({
                            ...prev,
                            manualAllocationPercentage: parseFloat(e.target.value) || 0,
                            allocationPercentage: parseFloat(e.target.value) || 0
                          }))}
                          className="w-full pr-8 pl-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-900"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <Percent className="w-4 h-4 text-stone-400" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Current Allocation
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={overheadCosts.allocationPercentage}
                      disabled
                      className="w-full pr-8 pl-3 py-2 border border-stone-300 rounded-lg bg-stone-50"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Percent className="w-4 h-4 text-stone-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profit Margin Card */}
            <div className="bg-[#f5f5dc] rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-stone-900" />
                <h2 className="text-xl font-semibold">Profit Margin</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Desired Profit Margin
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)}
                    className="w-full pr-8 pl-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-900"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Percent className="w-4 h-4 text-stone-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <div className="bg-[#f5f5dc] rounded-xl p-6 shadow-sm sticky top-6">
              <h2 className="text-xl font-semibold mb-6">Project Price Breakdown</h2>

              {/* Overhead Costs */}
              <div className="space-y-4 mb-6">
                <h3 className="font-medium text-stone-700">Overhead Costs</h3>
                <div className="grid grid-cols-2 gap-4 pl-4">
                  <div className="text-stone-600">Weekly Overhead</div>
                  <div className="text-right font-medium">{formatCurrency(weeklyOverhead)}</div>
                  <div className="text-stone-600">Project Duration</div>
                  <div className="text-right font-medium">{projectDetails.durationInWeeks} weeks</div>
                  <div className="text-stone-600">Allocation Percentage</div>
                  <div className="text-right font-medium">{overheadCosts.allocationPercentage.toFixed(2)}%</div>
                </div>
                <div className="flex justify-between pt-2 border-t border-stone-200">
                  <div className="font-medium">Allocated Overhead</div>
                  <div className="font-medium">{formatCurrency(allocatedOverhead)}</div>
                </div>
              </div>

              {/* Total Costs */}
              <div className="flex justify-between py-4 border-t border-b border-stone-200">
                <div className="font-semibold">Total Costs</div>
                <div className="font-semibold">{formatCurrency(totalCosts)}</div>
              </div>

              {/* Profit */}
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-stone-600">Profit Margin</div>
                  <div className="text-right font-medium">{profitMargin}%</div>
                  <div className="text-stone-600">Profit Amount</div>
                  <div className="text-right font-medium">{formatCurrency(profitAmount)}</div>
                </div>
              </div>

              {/* Final Price */}
              <div className="pt-4 border-t border-stone-200">
                <div className="bg-gradient-to-r from-amber-50 to-stone-100 p-4 rounded-xl">
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-semibold">Project Price</div>
                    <div className="text-2xl font-bold">{formatCurrency(projectPrice)}</div>
                  </div>
                  <div className="text-sm text-stone-600 mt-2">
                    {projectDetails.remainingWeeks > 0
                      ? `${projectDetails.remainingWeeks} weeks remaining`
                      : 'Project end date has passed'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
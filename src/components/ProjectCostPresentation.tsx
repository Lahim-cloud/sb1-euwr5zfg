import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCostsStore } from '../data/costs';
import { Project } from '../data/projects';

type ProjectCostPresentationProps = {
  project: Project;
};

export function ProjectCostPresentation({ project }: ProjectCostPresentationProps) {
  const costs = useCostsStore((state) => state.costs);
  const monthlyOverhead = costs.reduce((sum, cost) => sum + cost.monthlyCost, 0);
  const weeklyOverhead = monthlyOverhead * (12/52);
  
  // Calculate allocated overhead for the project
  const allocatedOverhead = (weeklyOverhead * project.durationInWeeks) * (project.overheadAllocationPercentage / 100);
  
  // Calculate project metrics
  const projectCosts = {
    overhead: allocatedOverhead,
    profit: project.price - allocatedOverhead,
    profitMargin: ((project.price - allocatedOverhead) / allocatedOverhead) * 100
  };

  // Prepare data for charts
  const costBreakdownData = [
    { name: 'Overhead', value: projectCosts.overhead },
    { name: 'Profit', value: projectCosts.profit }
  ];

  const weeklyBreakdownData = Array.from({ length: project.durationInWeeks }, (_, i) => ({
    week: `Week ${i + 1}`,
    cost: weeklyOverhead * (project.overheadAllocationPercentage / 100)
  }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-[#fefae0] rounded-2xl p-6 shadow-sm space-y-6">
      {/* Project Overview */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-stone-900 mb-2">{project.name}</h3>
        <p className="text-stone-600">{project.description}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 text-center">
          <h4 className="text-sm font-medium text-stone-600 mb-1">Project Price</h4>
          <p className="text-2xl font-bold text-[#a47148]">{formatCurrency(project.price)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <h4 className="text-sm font-medium text-stone-600 mb-1">Duration</h4>
          <p className="text-2xl font-bold text-[#a47148]">{project.durationInWeeks} weeks</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <h4 className="text-sm font-medium text-stone-600 mb-1">Profit Margin</h4>
          <p className="text-2xl font-bold text-[#a47148]">{projectCosts.profitMargin.toFixed(1)}%</p>
        </div>
      </div>

      {/* Cost Distribution */}
      <div className="bg-white rounded-xl p-4">
        <h4 className="text-lg font-semibold text-stone-900 mb-4">Cost Distribution</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costBreakdownData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Bar dataKey="value" fill="#a47148" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Cost Breakdown */}
      <div className="bg-white rounded-xl p-4">
        <h4 className="text-lg font-semibold text-stone-900 mb-4">Weekly Cost Breakdown</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyBreakdownData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Bar dataKey="cost" fill="#a47148" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Breakdown Table */}
      <div className="bg-white rounded-xl p-4">
        <h4 className="text-lg font-semibold text-stone-900 mb-4">Detailed Cost Breakdown</h4>
        <table className="min-w-full divide-y divide-stone-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">% of Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            <tr>
              <td className="px-4 py-2">Overhead Costs</td>
              <td className="px-4 py-2 text-right">{formatCurrency(projectCosts.overhead)}</td>
              <td className="px-4 py-2 text-right">
                {((projectCosts.overhead / project.price) * 100).toFixed(1)}%
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2">Profit</td>
              <td className="px-4 py-2 text-right">{formatCurrency(projectCosts.profit)}</td>
              <td className="px-4 py-2 text-right">
                {((projectCosts.profit / project.price) * 100).toFixed(1)}%
              </td>
            </tr>
            <tr className="font-semibold">
              <td className="px-4 py-2">Total Project Price</td>
              <td className="px-4 py-2 text-right">{formatCurrency(project.price)}</td>
              <td className="px-4 py-2 text-right">100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Additional Notes */}
      <div className="bg-white rounded-xl p-4">
        <h4 className="text-lg font-semibold text-stone-900 mb-2">Notes</h4>
        <ul className="list-disc list-inside space-y-2 text-stone-600">
          <li>Overhead allocation: {project.overheadAllocationPercentage}% of total overhead costs</li>
          <li>Weekly overhead cost: {formatCurrency(weeklyOverhead * (project.overheadAllocationPercentage / 100))}</li>
          <li>Project duration: {project.durationInWeeks} weeks ({project.startDate} to {project.endDate})</li>
          <li>Status: {project.status}</li>
        </ul>
      </div>
    </div>
  );
}

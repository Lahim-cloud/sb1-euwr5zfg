import React, { useState, useRef, useEffect } from 'react';
import { Users, Building2, Package, AppWindow, Heart, Scale, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCostsStore, CostCategory } from '../data/costs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // Import recharts components

type TooltipData = {
  x: number;
  y: number;
  name: string;
  value: string;
  percentage: number;
};

function PresentationPage() {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [chartRotation, setChartRotation] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const costs = useCostsStore((state) => state.costs);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setChartRotation(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const totalMonthlyCosts = costs.reduce((sum, cost) => sum + cost.monthlyCost, 0);
  const totalAnnualCosts = totalMonthlyCosts * 12;

  const sortedCosts = costs
    .map((cost) => ({
      ...cost,
      percentage: Math.round((cost.monthlyCost / totalMonthlyCosts) * 100)
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const getIcon = (iconName: string) => {
    const icons = {
      users: <Users className="w-5 h-5 text-blue-600" />,
      building2: <Building2 className="w-5 h-5 text-purple-600" />,
      scale: <Scale className="w-5 h-5 text-orange-600" />,
      heart: <Heart className="w-5 h-5 text-red-600" />,
      package: <Package className="w-5 h-5 text-green-600" />,
      appWindow: <AppWindow className="w-5 h-5 text-indigo-600" />,
    };
    return icons[iconName as keyof typeof icons];
  };

  const getCostColor = (icon: string, isActive: boolean = false) => {
    const colors = {
      users: isActive ? 'text-blue-400' : 'text-blue-600',
      building2: isActive ? 'text-purple-400' : 'text-purple-600',
      scale: isActive ? 'text-orange-400' : 'text-orange-600',
      heart: isActive ? 'text-red-400' : 'text-red-600',
      package: isActive ? 'text-green-400' : 'text-green-600',
      appWindow: isActive ? 'text-indigo-400' : 'text-indigo-600',
    };
    return colors[icon as keyof typeof colors];
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const handleMouseMove = (e: React.MouseEvent, cost: typeof sortedCosts[0]) => {
    if (!chartRef.current) return;

    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setTooltip({
      x,
      y,
      name: cost.name,
      value: formatCurrency(cost.monthlyCost),
      percentage: cost.percentage,
    });
  };

  const handleSegmentHover = (costId: string) => {
    setActiveSegment(costId);
    setHoveredSegment(costId);
  };

  const handleSegmentLeave = () => {
    setActiveSegment(null);
    setHoveredSegment(null);
    setTooltip(null);
  };

  const barChartData = costs.map((cost) => ({
    name: cost.name,
    monthlyCost: cost.monthlyCost,
    color: getCostColor(cost.icon).replace('text-', '') // Extract color name for bar fill
  }));

  return (
    <div className="min-h-screen bg-[#fefae0] p-6">
      <header className="px-6 py-4 flex items-center justify-between bg-[#fefae0] shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        {/* Annual Cost Summary */}
        <div className="bg-[#fefae0] rounded-2xl p-8 shadow-md">
          <h2 className="text-3xl font-bold text-center mb-6 text-stone-900">
            Annual Cost Summary
          </h2>
          <div className="text-6xl font-bold text-center mb-4 text-[#a47148]">
            {formatCurrency(totalAnnualCosts)}
          </div>
          <p className="text-stone-600 text-center">
            Total projected annual operating costs.
          </p>
        </div>

        {/* Cost Distribution Overview */}
        <div className="bg-[#fefae0] rounded-2xl p-8 shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-stone-900">
            Monthly Cost Distribution
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <div className="relative" ref={chartRef}>
              <div className="relative w-96 h-96 mx-auto group">
                <svg
                  className="w-full h-full transform transition-all duration-500 ease-in-out hover:scale-110"
                  viewBox="0 0 100 100"
                  style={{ transform: `rotate(${-90 + chartRotation}deg)` }}
                >
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <circle
                    className="text-stone-200"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />

                  {sortedCosts.map((cost, index, array) => {
                    const previousPercentages = array
                      .slice(0, index)
                      .reduce((sum, c) => sum + c.percentage, 0);

                    const isActive = activeSegment === cost.id;

                    return (
                      <circle
                        key={cost.id}
                        className={`${getCostColor(
                          cost.icon,
                          isActive
                        )} transition-all duration-300 ease-in-out cursor-pointer`}
                        strokeWidth={isActive ? '12' : '8'}
                        strokeDasharray={`${cost.percentage * 2.512} 251.2`}
                        strokeDashoffset={-previousPercentages * 2.512}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                        filter={isActive ? 'url(#glow)' : ''}
                        onMouseEnter={() => handleSegmentHover(cost.id)}
                        onMouseMove={(e) => handleMouseMove(e, cost)}
                        onMouseLeave={handleSegmentLeave}
                        style={{
                          transform: isActive ? `scale(1.05)` : 'scale(1)',
                          transformOrigin: 'center',
                        }}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center transition-all duration-300 transform group-hover:scale-110">
                    <div className="text-4xl font-bold">
                      {formatCurrency(totalMonthlyCosts)}
                    </div>
                    <div className="text-md text-stone-600">
                      Total Monthly Costs
                    </div>
                  </div>
                </div>
                {tooltip && (
                  <div
                    className="absolute pointer-events-none bg-[#fefae0] shadow-lg rounded-lg p-3 z-10 transition-all duration-150 transform hover:scale-105"
                    style={{
                      left: `${tooltip.x}px`,
                      top: `${tooltip.y - 80}px`,
                      transform: 'translate(-50%, -50%)',
                      border: '2px solid #a47148',
                      animation: 'fadeIn 0.2s ease-in-out',
                    }}
                  >
                    <div className="font-semibold text-stone-900">
                      {tooltip.name}
                    </div>
                    <div className="text-[#a47148]">{tooltip.value}</div>
                    <div className="text-sm text-stone-600">
                      {tooltip.percentage}% of total
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bar Chart */}
            <div className="w-full h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Bar dataKey="monthlyCost" fill="#a47148"  // Default color, will be overridden
                    // Dynamically set bar color based on category
                    style={({ data, index }) => ({
                      fill: `#${data[index].color}-600` // Use color from data, e.g., blue-600
                    })}
                  >
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Cost Breakdown Table */}
        <div className="bg-[#fefae0] rounded-2xl p-8 shadow-md overflow-x-auto">
          <h2 className="text-2xl font-semibold mb-6 text-stone-900">
            Detailed Monthly Cost Breakdown
          </h2>
          <table className="min-w-full divide-y divide-stone-200 text-stone-700">
            <thead className="bg-stone-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Monthly Cost
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Annual Cost
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#fefae0] divide-y divide-stone-200">
              {costs.map((cost) => (
                <tr key={cost.id}>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                    {getIcon(cost.icon)}
                    {cost.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatCurrency(cost.monthlyCost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatCurrency(cost.monthlyCost * 12)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {Math.round((cost.monthlyCost / totalMonthlyCosts) * 100)}%
                  </td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="px-6 py-4 whitespace-nowrap">Total</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatCurrency(totalMonthlyCosts)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatCurrency(totalAnnualCosts)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>

      <div className="hidden">
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translate(-50%, -60%);
              }
              to {
                opacity: 1;
                transform: translate(-50%, -50%);
              }
            }
          `,
          }}
        />
      </div>
    </div>
  );
}

export default PresentationPage;

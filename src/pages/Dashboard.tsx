import React, { useState, useRef, useEffect } from 'react';
import { Users, Building2, Package, AppWindow, Heart, Scale, Settings, Calculator, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCostsStore } from '../data/costs';
import { CostEditor } from '../components/CostEditor';
import { ImageUploader } from '../components/ImageUploader';

type TimePeriod = 'hourly' | 'weekly' | 'monthly' | 'annually';

type TooltipData = {
  x: number;
  y: number;
  name: string;
  value: string;
  percentage: number;
};

function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('hourly');
  const [isEditing, setIsEditing] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [chartRotation, setChartRotation] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const costs = useCostsStore((state) => state.costs);
  const [autoSwitch, setAutoSwitch] = useState(true);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setChartRotation(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!autoSwitch) return;

    const periods: TimePeriod[] = ['hourly', 'weekly', 'monthly', 'annually'];
    const interval = setInterval(() => {
      setSelectedPeriod(current => {
        const currentIndex = periods.indexOf(current);
        return periods[(currentIndex + 1) % periods.length];
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [autoSwitch]);

  const totalMonthlyCosts = costs.reduce((sum, cost) => sum + cost.monthlyCost, 0);
  const totalAnnualCosts = totalMonthlyCosts * 12;

  const handleImageUpload = (file: File) => {
    console.log('Uploaded file:', file);
  };

  const getCostsByPeriod = (monthlyCost: number) => {
    return {
      hourly: monthlyCost / (24 * 30),
      weekly: monthlyCost / 4,
      monthly: monthlyCost,
      annually: monthlyCost * 12
    };
  };

  const periodCosts = getCostsByPeriod(totalMonthlyCosts);

  const getCurrentPeriodCosts = (monthlyCost: number) => {
    const periods = {
      hourly: monthlyCost / (24 * 30),
      weekly: monthlyCost / 4,
      monthly: monthlyCost,
      annually: monthlyCost * 12
    };
    return periods[selectedPeriod];
  };

  const sortedCosts = costs
    .map((cost) => ({
      ...cost,
      currentValue: getCurrentPeriodCosts(cost.monthlyCost),
      percentage: Math.round((cost.monthlyCost / totalMonthlyCosts) * 100)
    }))
    .sort((a, b) => b.currentValue - a.currentValue);

  const getIcon = (iconName: string) => {
    const icons = {
      users: <Users className="w-5 h-5 text-blue-600" />,
      building2: <Building2 className="w-5 h-5 text-purple-600" />,
      scale: <Scale className="w-5 h-5 text-orange-600" />,
      heart: <Heart className="w-5 h-5 text-red-600" />,
      package: <Package className="w-5 h-5 text-green-600" />,
      appWindow: <AppWindow className="w-5 h-5 text-indigo-600" />
    };
    return icons[iconName as keyof typeof icons];
  };

  const getCostColor = (icon: string, isActive: boolean = false) => {
    const colors = {
      users: isActive ? "text-blue-400" : "text-blue-600",
      building2: isActive ? "text-purple-400" : "text-purple-600",
      scale: isActive ? "text-orange-400" : "text-orange-600",
      heart: isActive ? "text-red-400" : "text-red-600",
      package: isActive ? "text-green-400" : "text-green-600",
      appWindow: isActive ? "text-indigo-400" : "text-indigo-600"
    };
    return colors[icon as keyof typeof colors];
  };

  const getCostGradient = (icon: string, isActive: boolean = false) => {
    const gradients = {
      users: isActive ? "from-blue-200 to-blue-100" : "from-blue-100 to-blue-50",
      building2: isActive ? "from-purple-200 to-purple-100" : "from-purple-100 to-purple-50",
      scale: isActive ? "from-orange-200 to-orange-100" : "from-orange-100 to-orange-50",
      heart: isActive ? "from-red-200 to-red-100" : "from-red-100 to-red-50",
      package: isActive ? "from-green-200 to-green-100" : "from-green-100 to-green-50",
      appWindow: isActive ? "from-indigo-200 to-indigo-100" : "from-indigo-100 to-indigo-50"
    };
    return gradients[icon as keyof typeof gradients];
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
      value: formatCurrency(cost.currentValue),
      percentage: cost.percentage
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

  return (
    <div className="min-h-screen bg-[#fefae0]">
      <header className="px-6 py-4 flex items-center justify-between bg-[#fefae0] shadow-sm">
        <div className="flex items-center gap-4">
          <ImageUploader onImageUpload={handleImageUpload} />
        </div>
        <div className="flex items-center gap-6">
          <Link
            to="/projects"
            className="px-4 py-2 bg-gradient-to-r from-[#a47148] to-black text-[#fefae0] rounded-lg flex items-center gap-2 mr-2"
          >
            <Calendar className="w-5 h-5" />
            <span>Projects</span>
          </Link>
          <Link
            to="/pricing-calculator"
            className="px-4 py-2 bg-gradient-to-r from-[#a47148] to-black text-[#fefae0] rounded-lg flex items-center gap-2"
          >
            <Calculator className="w-5 h-5" />
            <span>Price Calculator</span>
          </Link>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-[#fefae0] rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Annual Cost</h2>
            <div className="text-6xl font-bold mb-6">${totalAnnualCosts.toFixed(2)}</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#a47148]/20 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-4 border-[#a47148]" />
                </div>
                <div>
                  <div className="text-sm text-stone-600">Monthly cost</div>
                  <div className="font-semibold">${totalMonthlyCosts.toFixed(2)}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-4 border-stone-900" />
                </div>
                <div>
                  <div className="text-sm text-stone-600">Weekly cost</div>
                  <div className="font-semibold">${(totalMonthlyCosts / 4).toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#fefae0] rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Cost Distribution</h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-stone-100 rounded-full"
                  title="Edit Costs"
                >
                  <Settings className="w-5 h-5 text-[#a47148]" />
                </button>
              </div>
              <div className="relative" ref={chartRef}>
                <div className="relative w-64 h-64 mx-auto mb-6 group">
                  <svg 
                    className="w-full h-full transform transition-all duration-500 ease-in-out hover:scale-110"
                    viewBox="0 0 100 100"
                    style={{ transform: `rotate(${-90 + chartRotation}deg)` }}
                  >
                    <defs>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
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
                          className={`${getCostColor(cost.icon, isActive)} transition-all duration-300 ease-in-out cursor-pointer`}
                          strokeWidth={isActive ? "12" : "8"}
                          strokeDasharray={`${cost.percentage * 2.512} 251.2`}
                          strokeDashoffset={-previousPercentages * 2.512}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="40"
                          cx="50"
                          cy="50"
                          filter={isActive ? "url(#glow)" : ""}
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
                      <div className="text-3xl font-bold">{formatCurrency(periodCosts[selectedPeriod])}</div>
                      <div className="text-sm text-stone-600">Total {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Costs</div>
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
                      <div className="font-semibold text-stone-900">{tooltip.name}</div>
                      <div className="text-[#a47148]">{tooltip.value}</div>
                      <div className="text-sm text-stone-600">{tooltip.percentage}% of total</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {sortedCosts.map((cost) => {
                    const isClickable = [
                      'appsSubscriptions',
                      'employeesPayroll',
                      'officeSupplies',
                      'governmentObligations',
                      'officeRent',
                      'healthInsurance'
                    ].includes(cost.id);
                    
                    const getRoute = () => {
                      switch(cost.id) {
                        case 'appsSubscriptions': return '/subscriptions';
                        case 'employeesPayroll': return '/employees-payroll';
                        case 'officeSupplies': return '/office-supplies';
                        case 'governmentObligations': return '/government-obligations';
                        case 'officeRent': return '/office-rent';
                        case 'healthInsurance': return '/health-insurance';
                        default: return null;
                      }
                    };

                    const route = getRoute();
                    const Component = route ? Link : 'div';
                    const props = route ? { to: route } : {};
                    const isActive = activeSegment === cost.id;

                    return (
                      <Component
                        key={cost.id}
                        {...props}
                        className={`bg-gradient-to-r ${getCostGradient(cost.icon, isActive)} p-4 rounded-xl ${isClickable ? 'hover:opacity-80 transition-opacity cursor-pointer' : ''} transition-all duration-300`}
                        onMouseEnter={() => handleSegmentHover(cost.id)}
                        onMouseLeave={handleSegmentLeave}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {getIcon(cost.icon)}
                          <span className="text-sm font-medium text-black">{cost.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-black">{formatCurrency(cost.currentValue)}</span>
                          <span className="text-sm text-stone-600">{cost.percentage}%</span>
                        </div>
                      </Component>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-[#fefae0] rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Cost Charts</h2>
              <div className="flex gap-4 mb-6 items-center">
                <div className="flex gap-4">
                  {(['hourly', 'weekly', 'monthly', 'annually'] as TimePeriod[]).map((period) => (
                    <button
                      key={period}
                      onClick={() => {
                        setSelectedPeriod(period);
                        setAutoSwitch(false);
                      }}
                      className={`px-4 py-2 rounded-full transition-all duration-300 ${
                        selectedPeriod === period
                          ? 'bg-gradient-to-r from-[#a47148] to-black text-[#fefae0] shadow-lg scale-105'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setAutoSwitch(prev => !prev)}
                  className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                    autoSwitch 
                      ? 'bg-[#a47148] text-[#fefae0] shadow-lg'
                      : 'text-stone-600 border border-stone-300'
                  }`}
                >
                  {autoSwitch ? 'Auto Switch: On' : 'Auto Switch: Off'}
                </button>
              </div>
              <div className="h-40 bg-[#fefae0]/50 rounded-xl mb-6" />
              <div className="bg-gradient-to-r from-[#a47148]/20 to-stone-100 p-4 rounded-xl mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-stone-600">Total {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Costs</div>
                    <div className="text-2xl font-bold text-stone-900">{formatCurrency(periodCosts[selectedPeriod])}</div>
                  </div>
                  <div className="text-sm text-stone-600">
                    <div>Hourly: {formatCurrency(periodCosts.hourly)}</div>
                    <div>Weekly: {formatCurrency(periodCosts.weekly)}</div>
                    <div>Monthly: {formatCurrency(periodCosts.monthly)}</div>
                    <div>Annually: {formatCurrency(periodCosts.annually)}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {sortedCosts.map((cost) => {
                  const isClickable = [
                    'appsSubscriptions',
                    'employeesPayroll',
                    'officeSupplies',
                    'governmentObligations',
                    'officeRent',
                    'healthInsurance'
                  ].includes(cost.id);
                  
                  const getRoute = () => {
                    switch(cost.id) {
                      case 'appsSubscriptions': return '/subscriptions';
                      case 'employeesPayroll': return '/employees-payroll';
                      case 'officeSupplies': return '/office-supplies';
                      case 'governmentObligations': return '/government-obligations';
                      case 'officeRent': return '/office-rent';
                      case 'healthInsurance': return '/health-insurance';
                      default: return null;
                    }
                  };

                  const route = getRoute();
                  const Component = route ? Link : 'div';
                  const props = route ? { to: route } : {};
                  const isActive = activeSegment === cost.id;

                  return (
                    <Component
                      key={cost.id}
                      {...props}
                      className={`flex items-center justify-between p-3 bg-gradient-to-r ${getCostGradient(cost.icon, isActive)} rounded-xl ${isClickable ? 'hover:opacity-80 transition-opacity cursor-pointer' : ''} transition-all duration-300`}
                      onMouseEnter={() => handleSegmentHover(cost.id)}
                      onMouseLeave={handleSegmentLeave}
                    >
                      <div className="flex items-center gap-3">
                        {getIcon(cost.icon)}
                        <span className="text-black">{cost.name}</span>
                      </div>
                      <span className="font-semibold text-black">
                        {formatCurrency(cost.currentValue)}
                      </span>
                    </Component>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <CostEditor isOpen={isEditing} onClose={() => setIsEditing(false)} />
      
      <div className="hidden">
        <style dangerouslySetInnerHTML={{
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
          `
        }} />
      </div>
    </div>
  );
}

export default Dashboard;
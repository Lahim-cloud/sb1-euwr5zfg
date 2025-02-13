import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Subscriptions from './pages/Subscriptions';
import GovernmentObligations from './pages/GovernmentObligations';
import EmployeesPayroll from './pages/EmployeesPayroll';
import OfficeSupplies from './pages/OfficeSupplies';
import PricingCalculator from './pages/PricingCalculator';
import Projects from './pages/Projects';
import OfficeRent from './pages/OfficeRent';
import HealthInsurance from './pages/HealthInsurance';
import PresentationPage from './pages/PresentationPage'; // Import PresentationPage

function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/subscriptions" element={<Subscriptions />} />
      <Route path="/government-obligations" element={<GovernmentObligations />} />
      <Route path="/employees-payroll" element={<EmployeesPayroll />} />
      <Route path="/office-supplies" element={<OfficeSupplies />} />
      <Route path="/pricing-calculator" element={<PricingCalculator />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/office-rent" element={<OfficeRent />} />
      <Route path="/health-insurance" element={<HealthInsurance />} />
      <Route path="/presentation" element={<PresentationPage />} /> {/* Add route for PresentationPage */}
      <Route path="/" element={<Navigate to="/signin" replace />} />
    </Routes>
  );
}

export default App;

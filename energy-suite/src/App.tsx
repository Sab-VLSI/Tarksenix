import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import VendorsPage from './pages/VendorsPage';
import SolarPlansPage from './pages/SolarPlansPage';
import VSPPlansPage from './pages/VSPPlansPage';
import BillAnalyzerPage from './pages/BillAnalyzerPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/solar-plans" element={<SolarPlansPage />} />
        <Route path="/vsp-plans" element={<VSPPlansPage />} />
        <Route path="/bill-analyzer" element={<BillAnalyzerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

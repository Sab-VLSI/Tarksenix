import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 md:p-12 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back to EnergyNest.</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm"
          >
            Sign out
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div 
            onClick={() => navigate('/vendors')}
            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">Vendor Marketplace</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">Connect with certified energy vendors and installers in your area.</p>
            <div className="text-blue-600 font-medium text-sm flex items-center">
              Explore vendors →
            </div>
          </div>

          {/* Card 2 */}
          <div 
            onClick={() => navigate('/solar-plans')}
            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer group"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">Rooftop Solar Plans</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">Browse and subscribe to customized rooftop solar installation plans.</p>
            <div className="text-emerald-600 font-medium text-sm flex items-center">
              View plans →
            </div>
          </div>

          {/* Card 3 */}
          <div 
            onClick={() => navigate('/vsp-plans')}
            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer group"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">Virtual Solar Plants</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">Invest in remote solar projects and earn energy credits without installation.</p>
            <div className="text-purple-600 font-medium text-sm flex items-center">
              Explore VSP →
            </div>
          </div>

          {/* Card 4 */}
          <div 
            onClick={() => navigate('/bill-analyzer')}
            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all cursor-pointer group"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">Bill Analyzer</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">Upload your electricity bill to get AI-driven savings recommendations.</p>
            <div className="text-orange-600 font-medium text-sm flex items-center">
              Analyze bill →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

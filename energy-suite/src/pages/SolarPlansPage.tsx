import { useNavigate } from 'react-router-dom';

const SolarPlansPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center gap-4 mb-12 border-b border-slate-200 pb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-slate-500 hover:text-slate-900 bg-white p-2 rounded-lg border border-slate-200 shadow-sm transition-colors"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Rooftop Solar Plans</h1>
            <p className="text-slate-500 mt-1">Smart subscription models for your home.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plan 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-100 flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">Most Popular</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Standard Grid</h3>
            <p className="text-slate-500 text-sm mb-6">Perfect for average households</p>
            
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-slate-900">$89</span>
              <span className="text-slate-500 font-medium">/month</span>
            </div>
            
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-emerald-500 font-bold">✓</span> 5kW System Installation
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-emerald-500 font-bold">✓</span> Zero Upfront Cost
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-emerald-500 font-bold">✓</span> Maintenance Included
              </li>
            </ul>
            
            <button className="w-full bg-emerald-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-emerald-700 transition-colors">
              Select Plan
            </button>
          </div>

          {/* Plan 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Premium Off-Grid</h3>
            <p className="text-slate-500 text-sm mb-6">For maximum independence with battery</p>
            
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-slate-900">$149</span>
              <span className="text-slate-500 font-medium">/month</span>
            </div>
            
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-slate-400 font-bold">✓</span> 8kW System + 10kWh Battery
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-slate-400 font-bold">✓</span> Advanced App Monitoring
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-slate-400 font-bold">✓</span> Priority Support
              </li>
            </ul>
            
            <button className="w-full bg-slate-900 text-white font-medium py-3 px-4 rounded-xl hover:bg-slate-800 transition-colors">
              Select Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolarPlansPage;

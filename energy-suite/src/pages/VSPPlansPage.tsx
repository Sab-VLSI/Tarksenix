import { useNavigate } from 'react-router-dom';

const VSPPlansPage = () => {
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
            <h1 className="text-3xl font-bold text-slate-900">Virtual Solar Plants (VSP)</h1>
            <p className="text-slate-500 mt-1">Invest in renewable energy anywhere.</p>
          </div>
        </header>

        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100 mb-6 font-sans">
          <div className="max-w-2xl">
            <span className="inline-block bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded-full text-xs mb-4">New Asset Class</span>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">How VSP Works</h2>
            <p className="text-slate-600 leading-relaxed mb-8">
              Don't have a suitable roof? You can still benefit from solar energy. Buy shares in our community solar farms and receive credits directly on your utility bill, proportionally to the energy your shares produce.
            </p>
            
            <div className="space-y-4">
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex items-center justify-between transition-colors hover:bg-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900">Micro Share</h4>
                  <p className="text-sm text-slate-500">1 Panel Equivalent (400W)</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-slate-900">$200</div>
                  <button className="text-purple-600 text-sm font-medium hover:underline mt-1">Invest Now</button>
                </div>
              </div>
              
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex items-center justify-between transition-colors hover:bg-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900">Standard Share</h4>
                  <p className="text-sm text-slate-500">5 Panel Equivalent (2kW)</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-slate-900">$950</div>
                  <button className="text-purple-600 text-sm font-medium hover:underline mt-1">Invest Now</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VSPPlansPage;

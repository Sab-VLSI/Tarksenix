import { useNavigate } from 'react-router-dom';

const VendorsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 md:p-12 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center gap-4 mb-12 border-b border-slate-200 pb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-slate-500 hover:text-slate-900 bg-white p-2 rounded-lg border border-slate-200 shadow-sm transition-colors"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Vendor Marketplace</h1>
            <p className="text-slate-500 mt-1">Find certified solar installers.</p>
          </div>
        </header>

        <div className="space-y-6">
          {[1, 2, 3].map((vendor) => (
            <div key={vendor} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-slate-900">Sunrise Energy Solutions {vendor}</h3>
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">Certified</span>
                </div>
                <p className="text-slate-500 text-sm">Providing premium installation services with 10 years of warranty.</p>
                <div className="flex gap-4 mt-4 text-sm font-medium text-slate-600">
                  <span className="flex items-center gap-1">★ 4.8 Rating</span>
                  <span className="flex items-center gap-1">• 120+ Installations</span>
                </div>
              </div>
              
              <button className="bg-blue-600 text-white font-medium py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors shrink-0 w-full md:w-auto mt-2 md:mt-0">
                Contact Vendor
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendorsPage;

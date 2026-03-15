import { useNavigate } from 'react-router-dom';

const BillAnalyzerPage = () => {
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
            <h1 className="text-3xl font-bold text-slate-900">AI Bill Analyzer</h1>
            <p className="text-slate-500 mt-1">Upload your bill for smart recommendations.</p>
          </div>
        </header>

        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Upload your latest bill</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Our AI will analyze your consumption patterns, peak usage rates, and cross-reference with our solar plans to provide an exact ROI calculation.
            </p>
            
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 mb-6 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
              <p className="text-slate-500 font-medium group-hover:text-slate-600 transition-colors">Click to browse or drag PDF here</p>
              <p className="text-slate-400 text-xs mt-2">Max file size: 5MB</p>
            </div>
            
            <button className="w-full bg-orange-500 text-white font-medium py-4 px-6 rounded-xl hover:bg-orange-600 transition-colors shadow-sm active:scale-[0.98]">
              Analyze My Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillAnalyzerPage;

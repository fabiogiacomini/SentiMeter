import React, { useState } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ResultsTable } from './components/ResultsTable';
import { Charts } from './components/Charts';
import { parseFileContent } from './services/fileService';
import { analyzeSentimentBatch } from './services/geminiService';
import { AppState, AnalysisStatus } from './types';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    status: AnalysisStatus.IDLE,
    results: [],
    fileName: null,
    error: null,
    progress: 0
  });

  const handleFileSelect = async (file: File) => {
    setState(prev => ({ ...prev, status: AnalysisStatus.PARSING, fileName: file.name, error: null }));

    try {
      // 1. Parse File
      const chunks = await parseFileContent(file);
      
      setState(prev => ({ ...prev, status: AnalysisStatus.ANALYZING }));

      // 2. Analyze with Gemini
      // NOTE: Ideally we would chunk this if the file is huge, but for this demo we do one batch
      const results = await analyzeSentimentBatch(chunks);

      setState({
        status: AnalysisStatus.COMPLETED,
        results: results,
        fileName: file.name,
        error: null,
        progress: 100
      });

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        status: AnalysisStatus.ERROR,
        error: error.message || "Si è verificato un errore imprevisto.",
        progress: 0
      }));
    }
  };

  const resetApp = () => {
    setState({
      status: AnalysisStatus.IDLE,
      results: [],
      fileName: null,
      error: null,
      progress: 0
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro / File Upload State */}
        {state.status === AnalysisStatus.IDLE && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
                Scopri la sentiment nei tuoi dati
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Carica un file Excel o CSV contenente le tue frasi. Saranno analizzate istantaneamente fornendo punteggio e intensità emotiva.
              </p>
            </div>
            <FileUpload onFileSelect={handleFileSelect} isLoading={false} />
          </div>
        )}

        {/* Loading State */}
        {(state.status === AnalysisStatus.PARSING || state.status === AnalysisStatus.ANALYZING) && (
          <div className="max-w-xl mx-auto mt-20 text-center">
             <div className="relative inline-block">
                <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-75"></div>
                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin relative z-10" />
             </div>
             <h3 className="mt-6 text-xl font-semibold text-slate-800">
               {state.status === AnalysisStatus.PARSING ? 'Lettura del file in corso...' : 'L\'IA sta analizzando il sentiment...'}
             </h3>
             <p className="text-slate-500 mt-2">L'operazione potrebbe richiedere qualche secondo.</p>
          </div>
        )}

        {/* Error State */}
        {state.status === AnalysisStatus.ERROR && (
          <div className="max-w-xl mx-auto mt-10 p-6 bg-red-50 border border-red-100 rounded-xl text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-red-800 mb-2">Ops, qualcosa è andato storto</h3>
            <p className="text-red-600 mb-6">{state.error}</p>
            <button 
              onClick={resetApp}
              className="px-6 py-2 bg-white text-red-600 border border-red-200 font-semibold rounded-lg hover:bg-red-50 transition-colors"
            >
              Riprova
            </button>
          </div>
        )}

        {/* Results State */}
        {state.status === AnalysisStatus.COMPLETED && (
          <div className="space-y-8 animate-fade-in">
             <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="text-green-500 w-6 h-6" />
                    Analisi Completata
                  </h2>
                  <p className="text-slate-500 mt-1">File: {state.fileName} • {state.results.length} frasi analizzate</p>
                </div>
                <button 
                  onClick={resetApp}
                  className="text-sm text-indigo-600 font-medium hover:text-indigo-800"
                >
                  Analizza un altro file
                </button>
             </div>

             <Charts data={state.results} />
             <ResultsTable results={state.results} />
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
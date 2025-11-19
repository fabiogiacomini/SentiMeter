import React, { useCallback } from 'react';
import { UploadCloud, FileText } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect, isLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`
          relative group border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
          ${isLoading ? 'opacity-50 cursor-not-allowed border-slate-300 bg-slate-50' : 'border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50/30 cursor-pointer bg-white'}
        `}
      >
        <input
          type="file"
          accept=".xlsx,.xls,.csv,.txt"
          onChange={handleChange}
          disabled={isLoading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-4 rounded-full transition-colors duration-300 ${isLoading ? 'bg-slate-200' : 'bg-indigo-100 group-hover:bg-indigo-200'}`}>
            {isLoading ? (
              <UploadCloud className="w-8 h-8 text-slate-400 animate-pulse" />
            ) : (
              <UploadCloud className="w-8 h-8 text-indigo-600" />
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-lg font-semibold text-slate-700">
              {isLoading ? 'Analisi in corso...' : 'Trascina qui il tuo file o clicca per caricare'}
            </p>
            <p className="text-sm text-slate-500">
              Supporta Excel (.xlsx), CSV o Testo.
            </p>
            <p className="text-xs text-slate-400 mt-2 bg-slate-100 py-1 px-2 rounded inline-block">
              Format: Frasi separate da una riga vuota
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
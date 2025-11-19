export interface AnalysisResult {
  originalText: string;
  score: number; // -1.0 to 1.0
  magnitude: number; // 0.0 to 1.0
  explanation?: string;
}

export interface BatchAnalysisResponse {
  results: AnalysisResult[];
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  PARSING = 'PARSING',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface AppState {
  status: AnalysisStatus;
  results: AnalysisResult[];
  fileName: string | null;
  error: string | null;
  progress: number;
}
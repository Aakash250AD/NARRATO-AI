
export interface UserSettings {
  aiAccuracy: boolean;
  realtimeSync: boolean;
  weeklyReports: boolean;
  defaultExportFormat: 'pdf' | 'md' | 'txt';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'Free' | 'Enterprise';
  joinedDate: string;
  settings: UserSettings;
}

export interface StructuredReport {
  title: string;
  executiveSummary: string;
  keyInsights: string[];
  trends: string[];
  recommendations: string[];
  conclusion: string;
}

export interface Report {
  id: string;
  filename: string;
  reportData: StructuredReport;
  createdAt: string;
  fileType: string;
}

export type AppView = 'dashboard' | 'history' | 'profile' | 'settings';

export interface FileData {
  content: string;   // base64 data URL for PDFs, plain text for everything else
  name: string;
  type: string;
  size: number;
  isPdf?: boolean;
}

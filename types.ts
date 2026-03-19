
// Unified user type — works with both Supabase and Firebase users
export interface AppUser {
  id: string;       // Supabase: user.id | Firebase: user.uid
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  provider?: 'email' | 'google';
}

export type Language = 'en' | 'ru' | 'uz-lat' | 'uz-cyr';
export type View = 'dashboard' | 'assessor' | 'about' | 'plans' | 'login' | 'profile';

export interface RubricItem {
  id: string;
  label: string;
  description: string;
  weight: number;
  maxWeight: number; // For the slider max value
  enabled: boolean;
}

export interface Rubric {
  type: 'quick' | 'custom';
  items: RubricItem[];
  customInstructions: string; // New field for free-text instructions
}

export interface Question {
  id: string;
  text: string;
  maxWeight: number;
}

export interface AssessmentResult {
  score: number;
  rationale: string;
  roadmap: string;
  citations: string[]; // List of lex.uz articles
  groundingUrls?: string[];
}

export interface StudentAnswer {
  questionId: string;
  text: string;
  assessment?: AssessmentResult;
  isAssessing: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Plan {
  id: 'free' | 'daily' | 'monthly' | 'yearly';
  price: number; // in UZS
  currency: string;
  duration: string;
  features: string[];
  isPopular?: boolean;
}

export type SubscriptionTier = 'free' | 'daily' | 'monthly' | 'yearly';

export interface ExamContextState {
  view: View;
  step: 1 | 2 | 3;
  language: Language;
  masterCase: string;
  questions: Question[];
  rubric: Rubric;
  answers: Record<string, StudentAnswer>; // Keyed by Question ID
  overallFeedback: string | null;
  chatHistory: ChatMessage[];
  subscriptionTier: SubscriptionTier;
  user: AppUser | null;
  
  // Theme
  isDarkMode: boolean;
  toggleTheme: () => void;
  
  // Usage
  dailyUsage: number;
  
  setView: (view: View) => void;
  setStep: (step: 1 | 2 | 3) => void;
  setLanguage: (lang: Language) => void;
  setMasterCase: (text: string) => void;
  setQuestions: (questions: Question[]) => void;
  setRubric: (rubric: Rubric) => void;
  updateAnswer: (questionId: string, text: string) => void;
  setAssessment: (questionId: string, result: AssessmentResult) => void;
  setAssessingStatus: (questionId: string, isAssessing: boolean) => void;
  setOverallFeedback: (feedback: string | null) => void;
  addChatMessage: (role: 'user' | 'model', text: string) => void;
  resetAnswers: () => void;
  upgradeSubscription: (tier: SubscriptionTier) => void;
  logout: () => void;
  checkUsage: () => boolean;
  incrementUsage: () => void;
  
  // New bulk import
  importExamData: (masterCase: string, questions: Question[], answers: Record<string, StudentAnswer>) => void;
}

export const SUPPORTED_LANGUAGES: { code: Language; label: string }[] = [
  { code: 'uz-lat', label: "O'zbekcha" },
  { code: 'uz-cyr', label: "Ўзбекча" },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
];

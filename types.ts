export type Language = 'en' | 'ru' | 'uz-lat' | 'uz-cyr';
export type View = 'dashboard' | 'assessor' | 'about';

export interface RubricItem {
  id: string;
  label: string;
  description: string;
  weight: number;
  maxWeight: number; // For the slider max value
  enabled: boolean;
}

export interface Rubric {
  type: 'quick' | 'advanced';
  items: RubricItem[];
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

export interface ExamContextState {
  view: View;
  step: 1 | 2 | 3;
  language: Language;
  masterCase: string;
  questions: Question[];
  rubric: Rubric;
  answers: Record<string, StudentAnswer>; // Keyed by Question ID
  
  setView: (view: View) => void;
  setStep: (step: 1 | 2 | 3) => void;
  setLanguage: (lang: Language) => void;
  setMasterCase: (text: string) => void;
  setQuestions: (questions: Question[]) => void;
  setRubric: (rubric: Rubric) => void;
  updateAnswer: (questionId: string, text: string) => void;
  setAssessment: (questionId: string, result: AssessmentResult) => void;
  setAssessingStatus: (questionId: string, isAssessing: boolean) => void;
  resetAnswers: () => void;
}

export const SUPPORTED_LANGUAGES: { code: Language; label: string }[] = [
  { code: 'uz-lat', label: "O'zbekcha" },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
];
export type AIActionType = 
  | 'summarize'
  | 'generate_quiz'
  | 'explain_simple'
  | 'create_questions'
  | 'extract_vocabulary';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface AIResponse {
  type: AIActionType;
  content: string;
  quizzes?: QuizQuestion[];
  vocabulary?: Array<{ word: string; definition: string }>;
  timestamp: number;
}

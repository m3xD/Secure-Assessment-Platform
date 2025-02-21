export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer?: number;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  duration: number;
  questions: Question[];
}

export interface QuizSummary {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: "upcoming" | "completed" | "in-progress";
}

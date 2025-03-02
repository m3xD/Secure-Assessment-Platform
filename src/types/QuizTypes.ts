export interface Question {
  id: string;
  text: string;
  options: string[];
  correct_option?: number;
  exam_id: string;
}

export interface Quiz {
  id: string;
  title: string;
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

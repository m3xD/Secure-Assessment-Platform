import { useEffect, useState } from "react";
import quizService from "../services/quizService";
import { Quiz, QuizSummary } from "../types/QuizTypes";

export const useQuiz = (quizId?: string) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      if (!quizId) return;
      const data = await quizService.getQuizById(quizId);
      setQuiz(data);
    } catch (err) {
      setError("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async (quizId: string, answers: Record<string, number>) => {
    try {
      if (!quizId) throw new Error("Quiz ID is required");
      await quizService.submitQuiz(quizId, answers);
      return true;
    } catch (err) {
      throw new Error("Failed to submit quiz");
      return false;
    }
  };

  return { quiz, loading, error, submitQuiz };
};

export const useStudentDashboard = () => {
  const [data, setData] = useState<{
    upcomingQuizzes: QuizSummary[];
    recentQuizzes: QuizSummary[];
    stats: {
      averageScore: number;
      completedQuizzes: number;
      upcomingQuizzes: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const dashboardData = await quizService.getStudentDashboard();
      setData(dashboardData);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refresh: loadDashboard };
};

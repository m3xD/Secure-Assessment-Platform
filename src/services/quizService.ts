import axios from "axios";
import { Quiz, QuizSummary } from "../types/QuizTypes";

const API_URL = "https://exam-service-39fe1c7b96de.herokuapp.com/api/v1";

const quizService = {
  async getStudentDashboard(): Promise<{
    upcomingQuizzes: QuizSummary[];
    recentQuizzes: QuizSummary[];
    stats: {
      averageScore: number;
      completedQuizzes: number;
      upcomingQuizzes: number;
    };
  }> {
    const response = await axios.get(`${API_URL}/student/dashboard`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });
    return response.data;
  },

  async getQuizById(quizId: string): Promise<Quiz> {
    const response = await axios.get(`${API_URL}/quizzes/${quizId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });
    return response.data;
  },

  async submitQuiz(
    quizId: string,
    answers: Record<string, number>
  ): Promise<void> {
    await axios.post(
      `${API_URL}/quizzes/${quizId}/submit`,
      { answers },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      }
    );
  },

  async getAllExams(): Promise<Quiz[]> {
    const token = localStorage.getItem("access_token");
    if(!token) {
      throw new Error("No authentication token found");
    }
    console.log(`>>> check bearer token: Bearer ${token}`);
    const res = await axios.get(`${API_URL}/exams`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    console.log(">>> check res.data.data: ", res.data.data);
    return res.data.data;
  }
};

export default quizService;

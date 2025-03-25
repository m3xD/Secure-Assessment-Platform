import axios from "axios";
import { getTokenFromLocalStorage } from "../utils/localStorageUtils";
import { Question, QuestionData } from "../types/QuestionTypes";

const API_URL = "https://main-backend-f59ecff5cbde.herokuapp.com";

const questionsApi = () => {
  const token = getTokenFromLocalStorage();
  return axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const questionsService = {
  /**
   * Get all questions for an assessment
   * @param {string} id - Assessment ID
   * @returns {Promise<Question[]>} - Returns list of questions for the assessment
   */
  async getAssessmentQuestions(id: string) {
    try {
      const res = await questionsApi().get(`/assessments/${id}/questions`);
      const questions: Question[] = res.data;
      return questions;
    } catch (error) {
      throw new Error("Failed to get assessment questions");
    }
  },

  /**
   * Add question to an assessment
   * @param {string} id - Assessment ID
   * @param {QuestionData} questionData - Question data
   * @returns {Promise<Question>} - Returns the created question
   */
  async addQuestion(id: string, questionData: QuestionData): Promise<Question> {
    try {
      const res = await questionsApi().post(
        `/assessments/${id}/questions`,
        questionData
      );
      const newQuestion: Question = res.data;
      return newQuestion;
    } catch (error) {
      throw new Error("Failed to add question");
    }
  },

  /**
   * Update question
   * @param {string} assessmentId - Assessment ID
   * @param {string} questionId - Question ID
   * @param {QuestionData} questionData - Question data
   * @returns {Promise<Question>} - Returns the updated question
   */
  async updateQuestion(
    assessmentId: string,
    questionId: string,
    questionData: QuestionData
  ): Promise<Question> {
    try {
      const res = await questionsApi().put(
        `/assessments/${assessmentId}/questions/${questionId}`,
        questionData
      );
      const updatedQuestion: Question = res.data;
      return updatedQuestion;
    } catch (error) {
      throw new Error("Failed to update question");
    }
  },

  /**
   * Delete question
   * @param {string} assessmentId - Assessment ID
   * @param {string} questionId - Question ID
   * @returns {Promise<void>}
   */
  async deleteQuestion(
    assessmentId: string,
    questionId: string
  ): Promise<void> {
    try {
      await questionsApi().delete(
        `/assessments/${assessmentId}/questions/${questionId}`
      );
    } catch (error) {
      throw new Error("Failed to delete question");
    }
  },
};
export default questionsService;

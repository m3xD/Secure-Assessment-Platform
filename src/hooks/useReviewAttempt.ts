import { Suspense, useCallback, useEffect, useReducer } from "react";
import {
  Answer,
  StudentAttemptHistory,
  StudentAttemptHistoryDetails,
} from "../types/AdminServiceTypes";
import adminService from "../services/adminService";
import { Question } from "../types/QuestionTypes";
import questionsService from "../services/questionsService";
import { toast } from "react-toastify";

interface ReviewAttemptState {
  attemptList: StudentAttemptHistory[];
  attemptDetails: StudentAttemptHistoryDetails;
  questionsList: Question[];
  suspiciousList: any[];
  loading: boolean;
  error: string | null;
}

type ReviewAttemptStateAction =
  | { type: "SET_ATTEMPT_LIST"; payload: StudentAttemptHistory[] }
  | { type: "SET_ATTEMPT_DETAILS"; payload: StudentAttemptHistoryDetails }
  | { type: "SET_QUESTION_LIST"; payload: Question[] }
  | { type: "SET_SUSPICIOUS_LIST"; payload: any[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: ReviewAttemptState = {
  attemptList: [],
  attemptDetails: {} as StudentAttemptHistoryDetails,
  questionsList: [],
  suspiciousList: [],
  loading: false,
  error: null,
};

// Reducer
const reviewAttemptReducer = (
  state: ReviewAttemptState,
  action: ReviewAttemptStateAction
): ReviewAttemptState => {
  switch (action.type) {
    case "SET_ATTEMPT_LIST":
      return {
        ...state,
        attemptList: action.payload,
        loading: false,
      };
    case "SET_ATTEMPT_DETAILS":
      return {
        ...state,
        attemptDetails: action.payload,
        loading: false,
      };
    case "SET_QUESTION_LIST":
      return {
        ...state,
        questionsList: action.payload,
      };
    case "SET_SUSPICIOUS_LIST":
      return {
        ...state,
        suspiciousList: action.payload,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
};

export const useReviewAttempt = (assessmentId: string, userId: string) => {
  const [state, dispatch] = useReducer(reviewAttemptReducer, initialState);

  const fetchAttemptList = useCallback(async () => {
    try {
      if (!assessmentId || !userId) return;

      dispatch({ type: "SET_LOADING", payload: true });
      const attemptList = await adminService.getStudentAttemptHistory(
        assessmentId,
        userId
      );

      dispatch({ type: "SET_ATTEMPT_LIST", payload: attemptList });
    } catch (error) {
      console.error("Error fetching attempt list:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to load attempt list. Please try again.",
      });
    }
  }, [assessmentId, userId, dispatch]);

  const fetchAttemptDetails = useCallback(
    async (attemptId: string) => {
      if (!assessmentId || !userId) return;

      dispatch({ type: "SET_LOADING", payload: true });
      const attemptDetails = await adminService.getStudentAttemptHistoryDetails(
        attemptId,
        userId
      );

      dispatch({ type: "SET_ATTEMPT_DETAILS", payload: attemptDetails });
    },
    [assessmentId, userId, dispatch]
  );

  const fetchQuestionList = useCallback(async () => {
    if (!assessmentId) return;

    const questionsList = await questionsService.getAssessmentQuestions(
      assessmentId
    );
    console.log(">>>> check questionsList", questionsList);
    dispatch({ type: "SET_QUESTION_LIST", payload: questionsList });
  }, []);

  const fetchSuspiciousList = useCallback(async () => {
    if (!assessmentId || !userId) return;

    dispatch({ type: "SET_LOADING", payload: true });
    const res =
      await adminService.getSuspiciousActOfUserInAssessment(
        userId,
        assessmentId
      );
    const suspiciousList = res.content;
    dispatch({ type: "SET_SUSPICIOUS_LIST", payload: suspiciousList });
  }, []);

  const gradeAttempt = useCallback(
    async (
      attemptId: string,
      feedback?: string,
      score?: number,
      answers?: Answer[]
    ) => {
      if (!attemptId) return;
      try {
        const res = await adminService.gradeAttempt(
          attemptId,
          feedback,
          score,
          answers
        );
        toast.success("Attempt graded successfully!");
        return res;
      } catch (error) {
        console.error("Error grading attempt:", error);
        toast.error("Failed to grade attempt. Please try again.");
        return;
      }
    },
    []
  );

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Run these in parallel since they don't depend on each other
        await Promise.all([
          fetchAttemptList(),
          fetchQuestionList(),
          fetchSuspiciousList(),
        ]);
      } catch (error) {
        console.error("Error loading review data:", error);
      }
    };

    fetchAllData();
  }, [fetchAttemptList, fetchQuestionList, fetchSuspiciousList]);

  return {
    studentAttemptHistory: state.attemptList,
    studentAttempHistoryDetail: state.attemptDetails,
    questionsList: state.questionsList,
    suspiciousList: state.suspiciousList,
    loading: state.loading,
    error: state.error,
    fetchAttemptDetails,
    gradeAttempt,
  };
};

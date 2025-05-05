import React, { createContext, ReactNode, useContext, useReducer } from "react";
import {
	Answer,
	StartAssessment,
	SubmitAssessmentResponse,
} from "../types/StudentServiceTypes";

// State interface
interface AssessmentTakingState {
  loading: boolean;
  error: string | null;
  assessment: StartAssessment | null;
  currentQuestionIndex: number;
  answers: Answer[];
  remainingTime: number;
  isSubmitting: boolean;
  webcamWarnings: number;
  submittedResult: SubmitAssessmentResponse | null;
  ui: {
    showResultModal: boolean;
  };
  suspiciousActivity: {
    type:
      | "TAB_SWITCHING"
      | "FACE_NOT_DETECTED"
      | "MULTIPLE_FACES"
      | "LOOKING_AWAY"
      | "SUSPICIOUS_OBJECT"
      | "VOICE_DETECTED"
      | null;
    tabSwitches: number;
  };
  attemptId?: string; // <-- Add attemptId to state interface
}

// Initial state
const initialState: AssessmentTakingState = {
  loading: true,
  error: null,
  assessment: null,
  currentQuestionIndex: 0,
  answers: [],
  remainingTime: 0,
  isSubmitting: false,
  webcamWarnings: 0,
  submittedResult: null,
  ui: {
    showResultModal: false,
  },
  suspiciousActivity: {
    type: null,
    tabSwitches: 0,
  },
};

// Action types
type AssessmentTakingAction =
  | { type: "LOAD_ASSESSMENT_START" }
  | {
      type: "LOAD_ASSESSMENT_SUCCESS";
      payload: {
        assessment: StartAssessment;
        initialAnswers: Answer[];
        timeRemaining: number;
        attemptId: string; // <-- Add attemptId to payload type
      };
    }
  | { type: "LOAD_ASSESSMENT_ERROR"; payload: string }
  | { type: "NEXT_QUESTION" }
  | { type: "PREV_QUESTION" }
  | { type: "UPDATE_ANSWER"; payload: { questionId: string; value: string } }
  | { type: "DECREASE_TIME" }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "ADD_WEBCAM_WARNING" }
  | { type: "RESET_STATE" }
  | { type: "OPEN_RESULT_MODAL"; payload: SubmitAssessmentResponse }
  | { type: "CLOSE_RESULT_MODAL" }
  | {
      type: "LOG_SUSPICIOUS_ACTIVITY";
      payload: {
        type:
          | "TAB_SWITCHING"
          | "FACE_NOT_DETECTED"
          | "MULTIPLE_FACES"
          | "LOOKING_AWAY"
          | "SUSPICIOUS_OBJECT"
          | "VOICE_DETECTED";
      };
    }
  | { type: "TAB_SWITCHING"; payload: number }
  | { type: "CLEAR_SUSPICIOUS_ACTIVITY" };

// Reducer function
const assessmentTakingReducer = (
  state: AssessmentTakingState,
  action: AssessmentTakingAction
): AssessmentTakingState => {
  switch (action.type) {
    case "LOAD_ASSESSMENT_START":
      return {
        ...state,
        loading: true,
        error: null,
      };

    case "LOAD_ASSESSMENT_SUCCESS":
      return {
        ...state,
        loading: false,
        assessment: action.payload.assessment,
        attemptId: action.payload.attemptId, // <-- Set attemptId in state
        answers: action.payload.initialAnswers,
        remainingTime: action.payload.timeRemaining,
        error: null,
      };

    case "LOAD_ASSESSMENT_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case "NEXT_QUESTION":
      if (!state.assessment) return state;
      return {
        ...state,
        currentQuestionIndex: Math.min(
          state.currentQuestionIndex + 1,
          state.assessment.questions.length - 1
        ),
      };

    case "PREV_QUESTION":
      return {
        ...state,
        currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
      };

    case "UPDATE_ANSWER":
      return {
        ...state,
        answers: state.answers.map((a) =>
          a.questionId === action.payload.questionId
            ? { ...a, answer: action.payload.value }
            : a
        ),
      };

    case "DECREASE_TIME":
      return {
        ...state,
        remainingTime: Math.max(0, state.remainingTime - 1),
      };

    case "SET_SUBMITTING":
      return {
        ...state,
        isSubmitting: action.payload,
      };

    case "ADD_WEBCAM_WARNING":
      return {
        ...state,
        webcamWarnings: state.webcamWarnings + 1,
      };

    case "RESET_STATE":
      return initialState;

    case "OPEN_RESULT_MODAL":
      return {
        ...state,
        ui: {
          ...state.ui,
          showResultModal: true,
        },
        submittedResult: action.payload,
      };

    case "CLOSE_RESULT_MODAL":
      return {
        ...state,
        ui: {
          ...state.ui,
          showResultModal: false,
        },
        submittedResult: null,
      };

    case "LOG_SUSPICIOUS_ACTIVITY":
      return {
        ...state,
        suspiciousActivity: {
          ...state.suspiciousActivity,
          type: action.payload.type,
        },
      };

    case "CLEAR_SUSPICIOUS_ACTIVITY":
      return {
        ...state,
        suspiciousActivity: {
          ...state.suspiciousActivity,
          type: null,
        },
      };

    case "TAB_SWITCHING":
      return {
        ...state,
        suspiciousActivity: {
          ...state.suspiciousActivity,
          tabSwitches: action.payload,
        },
      };

    default:
      return state;
  }
};

// Create context
interface AssessmentTakingContextType {
  state: AssessmentTakingState;
  dispatch: React.Dispatch<AssessmentTakingAction>;
}

const AssessmentTakingContext = createContext<
  AssessmentTakingContextType | undefined
>(undefined);

// Provider component
export const AssessmentTakingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(assessmentTakingReducer, initialState);

  return (
    <AssessmentTakingContext.Provider value={{ state, dispatch }}>
      {children}
    </AssessmentTakingContext.Provider>
  );
};

// Hook for using the context
export const useAssessmentTakingContext = () => {
  const context = useContext(AssessmentTakingContext);
  if (context === undefined) {
    throw new Error(
      "useAssessmentTakingContext must be used within an AssessmentTakingProvider"
    );
  }
  return context;
};

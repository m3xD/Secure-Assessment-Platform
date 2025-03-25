import { Option } from "./QuestionTypes";

export interface StartAssessmentSettings {
    randomizeQuestions: boolean;
    showResults: boolean;
    preventTabSwitching: boolean;
    requireWebcam: boolean;
}

export interface StartAssessmentQuestions {
    id: string;
    type: string;
    text: string;
    options: Option[];
}

export interface StartAssessment {
    attemptId: string;
    assessmentId: string;
    title: string;
    duration: number;
    timeLimit: boolean;
    endsAt: string;
    questions: StartAssessmentQuestions[];
    settings: StartAssessmentSettings;
}

/* ----------------------------------------------- */ 

export interface AssessmentResult {
    attemptId: string;
    assessmentId: string;
    title: string;
    date: string;
    score: number;
    duration: number;
    status: string;
    feedback: string;
}

/* ----------------------------------------------- */ 

export interface Answer {
    questionId: string;
    answer: string;
}

export interface Progress {
    answered: number;
    total: number;
    percentage: number;
}

export interface Attempt {
    attemptId: string;
    assessmentId: string;
    title: string;
    status: string;
    startedAt: string;
    endsAt: string;
    timeRemaining: number;
    progress: Progress;
    answers: Answer[];
}

/* --------------------------------- */

export interface SubmitAssessmentResponse {
    attemptId: string;
    assessmentId: string;
    completed: boolean;
    submittedAt: string;
    duration: number;
    showResults: boolean;
    results: {
        score: number;
        totalQuestions: number;
        correctAnswers: number;
        incorrectAnswers: number;
        unaswered: number;
        essayQuestions: number;
        status: string;
        feedback: string;
    };
}

/* ------------------------------------- */

export interface WebcamEvent {
    eventType: string;
    timestamp: string;
    details: {
        duration: number;
        confidence: number;
    };
    imageData: string;
}
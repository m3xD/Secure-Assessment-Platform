import { useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import studentService from '../services/studentService';
import { StartAssessmentQuestions, StartAssessment, SubmitAssessmentResponse } from '../types/StudentServiceTypes';
import { useAssessmentTakingContext } from '../contexts/AssessmentTakingContext';

export const useTakingAssessment = (attemptId: string | undefined) => {
  const navigate = useNavigate();
  const { state, dispatch } = useAssessmentTakingContext();
  const answerSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [pendingAnswers, setPendingAnswers] = useState<{[key: string]: string}>({});
  const [loadingAttempt, setLoadingAttempt] = useState<boolean>(false);
  
  const { 
    loading, 
    error, 
    assessment, 
    currentQuestionIndex, 
    answers, 
    remainingTime, 
    isSubmitting, 
    webcamWarnings,
  } = state;

  // Load assessment data
  useEffect(() => {
    const loadAssessmentData = async () => {
      if (!attemptId) return;
      
      // Check if we're already loading or if we already have the data
      if (loadingAttempt || (assessment && assessment.attemptId === attemptId)) {
        return;
      }
      
      setLoadingAttempt(true);
      
      try {
        dispatch({ type: 'LOAD_ASSESSMENT_START' });
        
        // First, get the assessment data from session storage (basic info)
        const savedAssessmentData = sessionStorage.getItem(`assessment_${attemptId}`);
        console.log('Saved assessment data:', savedAssessmentData);
        
        if (savedAssessmentData) {
          const assessmentData = JSON.parse(savedAssessmentData) as StartAssessment;
          
          // Now fetch the latest attempt details from the API to get current state and answers
          const attemptDetails = await studentService.getAttemptDetails(attemptId);
          
          console.log('Loaded assessment data and latest answers');
          
          // Initialize answers array from the attempt details
          const initialAnswers = assessmentData.questions.map(q => {
            // Find existing answer from the attempt details
            const existingAnswer = attemptDetails.answers?.find(a => a.questionId === q.id);
            return {
              questionId: q.id,
              answer: existingAnswer?.answer || ""
            };
          });
          
          // Set remaining time from the attempt details
          const endTime = new Date(assessmentData.endsAt).getTime();
          const now = Date.now();
          const timeRemaining = Math.max(0, Math.floor((endTime - now) / 1000));
          
          dispatch({ 
            type: 'LOAD_ASSESSMENT_SUCCESS', 
            payload: {
              assessment: assessmentData, // Use the original assessment data, not a merged version
              initialAnswers,
              timeRemaining
            }
          });
        } else {
          // If no saved data, the assessment is considered abandoned or invalid
          console.error('No saved assessment data found');
          dispatch({ 
            type: 'LOAD_ASSESSMENT_ERROR',
            payload: "Assessment data not found. This attempt may have expired or been completed."
          });
        }
      } catch (err) {
        console.error('Error loading assessment:', err);
        dispatch({ 
          type: 'LOAD_ASSESSMENT_ERROR',
          payload: "Failed to load assessment. Please try again."
        });
      } finally {
        setLoadingAttempt(false);
      }
    };
    
    loadAssessmentData();
    
    // Clean up function
    return () => {
      dispatch({ type: 'RESET_STATE' });
      if (answerSaveTimerRef.current) {
        clearTimeout(answerSaveTimerRef.current);
      }
    };
  }, [attemptId, dispatch, navigate]);  // Removed assessment from dependencies

  // Auto-save answers effect
  useEffect(() => {
    const autoSaveAnswers = async () => {
      if (!attemptId || Object.keys(pendingAnswers).length === 0) return;
      
      try {
        const answersToSave = { ...pendingAnswers };
        setPendingAnswers({});
        
        // Save each pending answer
        for (const [questionId, answer] of Object.entries(answersToSave)) {
          await studentService.saveAnswer(attemptId, { 
            questionId, 
            answer 
          });
        }
        
        console.log('Auto-saved answers:', Object.keys(answersToSave).length);
      } catch (err) {
        console.error('Error auto-saving answers:', err);
      }
    };

    if (Object.keys(pendingAnswers).length > 0) {
      if (answerSaveTimerRef.current) {
        clearTimeout(answerSaveTimerRef.current);
      }
      
      // Schedule saving after 5 seconds of inactivity
      answerSaveTimerRef.current = setTimeout(autoSaveAnswers, 5000);
    }
    
    return () => {
      if (answerSaveTimerRef.current) {
        clearTimeout(answerSaveTimerRef.current);
      }
    };
  }, [attemptId, pendingAnswers]);

  // Timer effect remains the same
  useEffect(() => {
    if (!assessment || remainingTime <= 0) return;
    
    const timer = setInterval(() => {
      dispatch({ type: 'DECREASE_TIME' });
      
      // Check if time is up
      if (remainingTime <= 1) {
        clearInterval(timer);
        handleTimeUp();
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [assessment, remainingTime]);

  // Handle time up
  const handleTimeUp = useCallback(() => {
    toast.error("Time's up! Your assessment will be submitted automatically.");
    handleSubmitAssessment();
  }, []);

  // Format time remaining remains the same
  const formatTimeRemaining = useCallback(() => {
    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    const seconds = remainingTime % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [remainingTime]);

  // Handle answer change - updated to queue answers for auto-save
  const handleAnswerChange = useCallback((questionId: string, value: string) => {
    // Update the state immediately
    dispatch({
      type: 'UPDATE_ANSWER',
      payload: { questionId, value }
    });
    
    // Queue this answer for auto-saving
    setPendingAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  }, [dispatch]);

  // Other handlers remain the same
  const handleNextQuestion = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION' });
  }, [dispatch]);

  const handlePrevQuestion = useCallback(() => {
    dispatch({ type: 'PREV_QUESTION' });
  }, [dispatch]);

  const handleWebcamEvent = useCallback((eventType: string, details: any) => {
    if (eventType === 'warning') {
      dispatch({ type: 'ADD_WEBCAM_WARNING' });
      toast.warning(details.message);
      
      // Log webcam event to the server
      if (attemptId) {
        studentService.submitWebcamMonitorEvent(attemptId, { 
          eventType, 
          details, 
          timestamp: new Date().toISOString(), 
          imageData: details.imageData || '' 
        })
          .catch(err => console.error('Error logging webcam event:', err));
      }
    }
  }, [attemptId, dispatch]);

  // Submit assessment - updated to save pending answers first
  const handleSubmitAssessment = useCallback(async () => {
    if (!assessment || !attemptId) return;
    
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      
      // First, save any pending answers
      if (Object.keys(pendingAnswers).length > 0) {
        for (const [questionId, answer] of Object.entries(pendingAnswers)) {
          await studentService.saveAnswer(attemptId, { 
            questionId, 
            answer 
          });
        }
        setPendingAnswers({});
      }
      
      // Then submit the assessment
      const submitAssessmentResult: SubmitAssessmentResponse = await studentService.submitAssessment(attemptId);
      dispatch({ type: 'OPEN_RESULT_MODAL', payload: submitAssessmentResult });
      toast.success("Assessment submitted successfully!");
    } catch (err) {
      console.error('Error submitting assessment:', err);
      toast.error("Failed to submit assessment. Please try again.");
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [assessment, attemptId, navigate, dispatch, pendingAnswers]);

  // Other utility functions remain the same
  const calculateProgress = useCallback(() => {
    if (!assessment) return 0;
    
    const answeredCount = answers.filter(a => a.answer.trim() !== '').length;
    return Math.round((answeredCount / assessment.questions.length) * 100);
  }, [assessment, answers]);

  const getCurrentQuestion = useCallback((): StartAssessmentQuestions | null => {
    if (!assessment) return null;
    return assessment.questions[currentQuestionIndex];
  }, [assessment, currentQuestionIndex]);

  const getCurrentAnswer = useCallback(() => {
    if (!assessment) return '';
    const question = assessment.questions[currentQuestionIndex];
    if (!question) return '';
    return answers.find(a => a.questionId === question.id)?.answer || '';
  }, [assessment, currentQuestionIndex, answers]);

  return {
    loading,
    error,
    assessment,
    currentQuestionIndex,
    answers,
    isSubmitting,
    webcamWarnings,

    getCurrentQuestion,
    getCurrentAnswer,
    formatTimeRemaining,
    handleAnswerChange,
    handleNextQuestion,
    handlePrevQuestion,
    handleWebcamEvent,
    handleSubmitAssessment,
    calculateProgress
  };
};
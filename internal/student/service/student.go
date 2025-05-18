package service

import (
	"monitoring_service_v/internal/attempts/repository"
	models "monitoring_service_v/internal/model"

	"errors"
	"fmt"
	"go.uber.org/zap"
	"time"
)

type StudentService interface {
	SubmitMonitorEvent(attemptID uint, eventType string, details map[string]interface{}, imageData []byte, userID uint) (*map[string]interface{}, error)
}

type studentService struct {
	attemptRepo repository.AttemptRepository
	log         *zap.Logger
}

func NewStudentService(
	attemptRepo repository.AttemptRepository,
	log *zap.Logger,
) StudentService {
	return &studentService{
		attemptRepo: attemptRepo,
		log:         log,
	}
}

func (s *studentService) SubmitMonitorEvent(attemptID uint, eventType string, details map[string]interface{}, imageData []byte, userID uint) (*map[string]interface{}, error) {
	// Check if attempt exists and belongs to user
	attempt, err := s.attemptRepo.FindByID(attemptID)
	if err != nil {
		return nil, errors.New("attempt not found")
	}

	if attempt.UserID != userID {
		return nil, errors.New("unauthorized access to attempt")
	}

	// Check if attempt is still in progress
	if attempt.Status != "In Progress" {
		return nil, errors.New("attempt is not in progress")
	}

	// Determine severity based on event type
	severity := "NONE"
	message := "Event recorded."

	switch eventType {
	case "FACE_NOT_DETECTED":
		severity = "WARNING"
		message = "Please ensure your face is visible in the webcam at all times."
	case "MULTIPLE_FACES":
		severity = "CRITICAL"
		message = "Multiple faces detected. This is not allowed."
	case "LOOKING_AWAY":
		severity = "WARNING"
		message = "Please focus on your screen."
	case "SUSPICIOUS_OBJECT":
		severity = "WARNING"
		message = "Suspicious object detected. Please remove it."
	case "VOICE_DETECTED":
		severity = "WARNING"
		message = "Please remain quiet during the assessment."
	case "TAB_SWITCH":
		severity = "CRITICAL"
		message = "Switching tabs is not allowed during the assessment."
	}

	// Create suspicious activity record
	suspiciousActivity := &models.SuspiciousActivity{
		UserID:       userID,
		AssessmentID: attempt.AssessmentID,
		AttemptID:    attemptID,
		Type:         eventType,
		Details:      eventTypeToDetails(eventType, details),
		Timestamp:    time.Now(),
		Severity:     severity,
		ImageData:    imageData,
	}

	err = s.attemptRepo.SaveSuspiciousActivity(suspiciousActivity)
	if err != nil {
		return nil, err
	}

	result := map[string]interface{}{
		"received": true,
		"severity": severity,
		"message":  message,
	}

	return &result, nil
}

// Helper function to convert event type and details to a string
func eventTypeToDetails(eventType string, details map[string]interface{}) string {
	switch eventType {
	case "FACE_NOT_DETECTED":
		return fmt.Sprintf("Face not detected for %.1f seconds (confidence: %.2f)",
			details["duration"].(float64), details["confidence"].(float64))
	case "MULTIPLE_FACES":
		return fmt.Sprintf("Multiple faces detected: %d",
			int(details["count"].(float64)))
	case "LOOKING_AWAY":
		return fmt.Sprintf("Looking away for %.1f seconds",
			details["duration"].(float64))
	case "TAB_SWITCH":
		return "User switched tabs"
	default:
		return fmt.Sprintf("%s detected", eventType)
	}
}

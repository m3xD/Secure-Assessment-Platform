package rest

import (
	"encoding/json"
	"github.com/golang-jwt/jwt/v5"
	"monitoring_service_v/internal/activity/service"
	models "monitoring_service_v/internal/model"
	"monitoring_service_v/internal/util"
	"net/http"
	"strconv"
	"time"
)

type AnalyticsHandler struct {
	analyticsService service.AnalyticsService
}

func NewAnalyticsHandler(analyticsService service.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{analyticsService: analyticsService}
}

func (h *AnalyticsHandler) LogSuspiciousActivity(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	claims, _ := r.Context().Value("user").(jwt.MapClaims)
	userID, exists := claims["userID"]
	if !exists {
		util.ResponseMap(w, map[string]interface{}{
			"status":  "UNAUTHORIZED",
			"message": "User ID not found in context",
		}, http.StatusUnauthorized)
		return
	}

	var req struct {
		AttemptID    string `json:"attemptID"`
		AssessmentID string `json:"assessmentId" binding:"required"`
		Type         string `json:"type" binding:"required"`
		Details      string `json:"details"`
		Timestamp    string `json:"timestamp"`
		UserAgent    string `json:"userAgent"`
		Image        string `json:"imageData"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.ResponseMap(w, map[string]interface{}{
			"status":  "BAD_REQUEST",
			"message": "Invalid input",
		}, http.StatusBadRequest)
		return
	}

	assIDUINT, err := strconv.ParseUint(req.AssessmentID, 10, 32)
	if err != nil {
		util.ResponseMap(w, map[string]interface{}{
			"status":  "BAD_REQUEST",
			"message": "Invalid assessment ID",
		}, http.StatusBadRequest)
		return
	}

	userIDUINT, err := strconv.ParseUint(userID.(string), 10, 32)
	if err != nil {
		util.ResponseMap(w, map[string]interface{}{
			"status":  "BAD_REQUEST",
			"message": "Invalid user ID",
		}, http.StatusBadRequest)
		return
	}

	attemptID, err := strconv.ParseUint(req.AttemptID, 10, 32)
	if err != nil {
		util.ResponseMap(w, map[string]interface{}{
			"status":  "BAD_REQUEST",
			"message": "Invalid attempt ID",
		}, http.StatusBadRequest)
		return
	}

	// Create suspicious activity
	activity := &models.SuspiciousActivity{
		AttemptID:    uint(attemptID),
		UserID:       uint(userIDUINT),
		AssessmentID: uint(assIDUINT),
		Type:         req.Type,
		Details:      req.Details,
	}

	if req.Timestamp != "" {
		timestamp, err := time.Parse(time.RFC3339, req.Timestamp)
		if err != nil {
			util.ResponseMap(w, map[string]interface{}{
				"status":  "BAD_REQUEST",
				"message": "Invalid timestamp format",
			}, http.StatusBadRequest)
			return
		}
		activity.Timestamp = timestamp
	} else {
		activity.Timestamp = time.Now()
	}

	// Determine severity based on event type
	switch req.Type {
	case "TAB_SWITCHING", "MULTIPLE_FACES":
		activity.Severity = "HIGH"
	case "FACE_NOT_DETECTED", "LOOKING_AWAY":
		activity.Severity = "MEDIUM"
	default:
		activity.Severity = "LOW"
	}

	newErr := h.analyticsService.LogSuspiciousActivity(activity)
	if newErr != nil {
		util.ResponseMap(w, map[string]interface{}{
			"status":  "ERROR",
			"message": "Failed to log suspicious activity",
		}, http.StatusInternalServerError)
		return
	}

	util.ResponseInterface(w, activity, http.StatusCreated)
}

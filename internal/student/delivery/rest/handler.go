package rest

import (
	"encoding/base64"
	"encoding/json"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
	"go.uber.org/zap"
	"monitoring_service_v/internal/student/service"
	"monitoring_service_v/internal/util"
	"net/http"
	"strconv"
	"strings"
)

type StudentHandler struct {
	studentService service.StudentService
	log            *zap.Logger
}

func NewStudentHandler(studentService service.StudentService, log *zap.Logger) *StudentHandler {
	return &StudentHandler{studentService: studentService, log: log}
}

func (h *StudentHandler) SubmitMonitorEvent(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, exists := r.Context().Value("user").(jwt.MapClaims)["userID"]
	if !exists {
		h.log.Error("[SubmitMonitorEvent] userID not found in context")
		util.ResponseMap(w, map[string]interface{}{
			"status":  "UNAUTHORIZED",
			"message": "User ID not found in context",
		}, http.StatusUnauthorized)
		return
	}
	// parse userID to unit
	userIDUnit, err := strconv.ParseUint(userID.(string), 10, 32)
	if err != nil {
		h.log.Error("[SubmitMonitorEvent] failed to convert userID", zap.Error(err))
		util.ResponseMap(w, map[string]interface{}{
			"status":  "ERROR",
			"message": "Failed to convert userID",
		}, http.StatusInternalServerError)
		return
	}

	// Get attempt ID from path
	attemptID, err := strconv.ParseUint(mux.Vars(r)["attemptId"], 10, 32)
	if err != nil {
		h.log.Error("[SubmitMonitorEvent] invalid attempt ID", zap.Error(err))
		util.ResponseMap(w, map[string]interface{}{
			"status":  "BAD_REQUEST",
			"message": "Invalid attempt ID",
		}, http.StatusBadRequest)
		return
	}

	// Parse request
	var req struct {
		EventType string                 `json:"eventType" binding:"required"`
		Timestamp string                 `json:"timestamp" binding:"required"`
		Details   map[string]interface{} `json:"details"`
		ImageData string                 `json:"imageData"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.log.Error("[SubmitMonitorEvent] invalid input", zap.Error(err))
		util.ResponseMap(w, map[string]interface{}{
			"status":  "BAD_REQUEST",
			"message": "Invalid input",
		}, http.StatusBadRequest)
		return
	}

	// Decode image data if provided
	var imageData []byte
	var decodeErr error
	if req.ImageData != "" {
		imageData, decodeErr = base64.StdEncoding.DecodeString(strings.Split(req.ImageData, "base64,")[1])
		if decodeErr != nil {
			h.log.Error("[SubmitMonitorEvent] failed to decode image data", zap.Error(decodeErr))
			util.ResponseMap(w, map[string]interface{}{
				"status":  "BAD_REQUEST",
				"message": "Invalid image data",
			}, http.StatusBadRequest)
			return
		}
	}

	// Submit event
	result, err := h.studentService.SubmitMonitorEvent(uint(attemptID), req.EventType, req.Details, imageData, uint(userIDUnit))
	if err != nil {
		h.log.Error("[SubmitMonitorEvent] failed to submit monitor event", zap.Error(err))
		util.ResponseMap(w, map[string]interface{}{
			"status":  "ERROR",
			"message": "Failed to submit monitor event",
		}, http.StatusInternalServerError)
		return
	}

	util.ResponseInterface(w, result, http.StatusOK)
}

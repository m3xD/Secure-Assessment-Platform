package service

import (
	"go.uber.org/zap"
	"monitoring_service_v/internal/attempts/repository"
	models "monitoring_service_v/internal/model"
	"time"
)

type AnalyticsService interface {
	LogSuspiciousActivity(activity *models.SuspiciousActivity) error
}

type analyticsService struct {
	attemptRepo repository.AttemptRepository
	log         *zap.Logger
}

func NewAnalyticsService(attemptRepo repository.AttemptRepository, log *zap.Logger) AnalyticsService {
	return &analyticsService{attemptRepo: attemptRepo, log: log}
}

func (s *analyticsService) LogSuspiciousActivity(activity *models.SuspiciousActivity) error {
	// Set timestamp if not provided
	if activity.Timestamp.IsZero() {
		activity.Timestamp = time.Now()
	}

	return s.attemptRepo.SaveSuspiciousActivity(activity)
}

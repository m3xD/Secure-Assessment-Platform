package repository

import (
	"errors"
	"fmt"
	models "monitoring_service_v/internal/model"
	"time"

	"gorm.io/gorm"
)

// AttemptRepository defines operations for managing assessment attempts
type AttemptRepository interface {
	FindByID(id uint) (*models.Attempt, error)
	SaveSuspiciousActivity(activity *models.SuspiciousActivity) error
}

type attemptRepository struct {
	db *gorm.DB
}

// NewAttemptRepository creates a new instance of AttemptRepository
func NewAttemptRepository(db *gorm.DB) AttemptRepository {
	return &attemptRepository{db: db}
}

// FindByID finds an attempt by its ID
func (r *attemptRepository) FindByID(id uint) (*models.Attempt, error) {
	var attempt models.Attempt

	result := r.db.Where("id = ? AND deleted_at IS NULL", id).First(&attempt)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("attempt with ID %d not found", id)
		}
		return nil, fmt.Errorf("failed to find attempt: %w", result.Error)
	}

	// Load answers for this attempt
	var answers []models.Answer
	if err := r.db.Where("attempt_id = ?", id).Find(&answers).Error; err != nil {
		return nil, fmt.Errorf("failed to load answers: %w", err)
	}
	attempt.Answers = answers

	return &attempt, nil
}

// SaveSuspiciousActivity saves a suspicious activity record
func (r *attemptRepository) SaveSuspiciousActivity(activity *models.SuspiciousActivity) error {
	now := time.Now()
	activity.CreatedAt = now

	result := r.db.Create(&activity)
	if result.Error != nil {
		return fmt.Errorf("failed to save suspicious activity: %w", result.Error)
	}

	return nil
}

package api

import (
	"monitoring_service_v/configs"
	service4 "monitoring_service_v/internal/activity/service"
	repository4 "monitoring_service_v/internal/attempts/repository"

	"context"
	"fmt"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"go.uber.org/zap"
	"gorm.io/gorm"
	service3 "monitoring_service_v/internal/student/service"
	"net/http"
	"os"
	"os/signal"
	"time"
)

type Server struct {
	router *mux.Router
	config *configs.Config
	log    *zap.Logger
	db     *gorm.DB
}

func NewServer(config *configs.Config, db *gorm.DB, log *zap.Logger) *Server {
	return &Server{
		config: config,
		log:    log,
		db:     db,
	}
}

func (s *Server) Run() error {
	// Set up services and handlers
	// jwtUtil := util.NewJwtImpl()

	// Initialize repositories
	attemptRepo := repository4.NewAttemptRepository(s.db)

	// Initialize services
	studentService := service3.NewStudentService(attemptRepo, s.log)
	analyticsService := service4.NewAnalyticsService(attemptRepo, s.log)

	// Set up routes
	s.router = SetupRoutes(
		analyticsService,
		studentService,
		s.log,
	)

	port := getEnv("PORT", "8080")

	// Configure server
	srv := &http.Server{
		Addr: ":" + port,
		Handler: handlers.CORS(
			handlers.AllowedOrigins([]string{"*"}),
			handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
			handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"}))(s.router),
		ReadTimeout:  s.config.Server.ReadTimeout,
		WriteTimeout: s.config.Server.WriteTimeout,
	}

	// Run server in a goroutine
	go func() {
		s.log.Info(fmt.Sprintf("Server running on port %s", port))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			s.log.Fatal("Failed to start server", zap.Error(err))
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
	s.log.Info("Shutting down server...")

	// Gracefully shutdown with a timeout
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*15)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		s.log.Fatal("Server shutdown error", zap.Error(err))
		return err
	}

	s.log.Info("Server exited properly")
	return nil
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

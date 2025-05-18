package api

import (
	"github.com/gorilla/mux"
	"go.uber.org/zap"
	"monitoring_service_v/internal/activity/delivery/rest"
	"monitoring_service_v/internal/activity/service"
	"monitoring_service_v/internal/middleware"
	rest2 "monitoring_service_v/internal/student/delivery/rest"
	service2 "monitoring_service_v/internal/student/service"
	"monitoring_service_v/internal/util"
	"net/http"
)

func SetupRoutes(
	analyticsService service.AnalyticsService,
	studentService service2.StudentService,
	log *zap.Logger,
) *mux.Router {
	router := mux.NewRouter()
	jwtService := util.NewJwtImpl()

	loggingMiddleware := middleware.NewLogMiddleware(log)
	authMiddleware := middleware.NewAuthMiddleware(jwtService)

	healthCheckRouter := router.PathPrefix("/health").Subrouter()
	healthCheckRouter.HandleFunc("", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Welcome to the Assessment Service!"))
	})

	analyticsHandler := rest.NewAnalyticsHandler(analyticsService)
	studentHandler := rest2.NewStudentHandler(studentService, log)

	analyticsRouter := router.PathPrefix("/analytics").Subrouter()
	analyticsRouter.Use(loggingMiddleware.LoggingMiddleware)
	analyticsRouter.Use(authMiddleware.AuthMiddleware())
	analyticsRouter.HandleFunc("/suspicious", analyticsHandler.LogSuspiciousActivity).Methods("POST")

	// Student routes (for taking assessments)
	studentRouter := router.PathPrefix("/student").Subrouter()
	studentRouter.Use(loggingMiddleware.LoggingMiddleware)
	studentRouter.Use(authMiddleware.AuthMiddleware())
	studentRouter.HandleFunc("/attempts/{attemptId:[0-9]+}/monitor", studentHandler.SubmitMonitorEvent).Methods("POST")

	return router
}

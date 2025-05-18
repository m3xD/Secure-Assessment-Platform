package main

import (
	"go.uber.org/zap"
	"log"
	"monitoring_service_v/configs"
	"monitoring_service_v/internal/api"
	pkg "monitoring_service_v/pkg/logger"
	database "monitoring_service_v/pkg/postgres"
)

//TIP <p>To run your code, right-click the code and select <b>Run</b>.</p> <p>Alternatively, click
// the <icon src="AllIcons.Actions.Execute"/> icon in the gutter and select the <b>Run</b> menu item from here.</p>

func main() {
	cfg, err := configs.Load()
	if err != nil {
		log.Fatalln("failed to load config:", err)
	}

	// Initialize the logger
	log := pkg.NewLogger().Logger

	// Initialize the database
	db, err := database.Connect(cfg.Database)
	if err != nil {
		log.Fatal("failed to connect to database:", zap.Error(err))
	}

	server := api.NewServer(cfg, db, log)

	// Start the server
	err = server.Run()
	if err != nil {
		log.Fatal("failed to start server:", zap.Error(err))
	}
}

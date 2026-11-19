package repository

import (
	"log/slog"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func Connect(dbPath string) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		slog.Error("Failed to connect to db", "error", err)
		return nil, err
	}

	slog.Info("Database connected successfully")
	return db, nil
}

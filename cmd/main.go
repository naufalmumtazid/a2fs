package main

import (
	"log/slog"
	"os"

	"github.com/naufalmumtazid/a2fs/internal/repository"
)

// "github.com/gin-gonic/gin"

func main() {
	// r := gin.Default()

	// r.GET("/ping", func(c *gin.Context) {
	// 	c.JSON(http.StatusOK, gin.H{
	// 		"message": "pong",
	// 	})
	// })

	// r.Run()
	repository.Connect("internal/repository/a2fs.db?_pragma=foreign_keys(1)")
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level:     slog.LevelDebug,
		AddSource: true,
	}))

	slog.SetDefault(logger)
}

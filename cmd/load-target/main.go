package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/brilhante29/load-test-suite/internal/target"
)

func main() {
	port := getenv("PORT", "8080")
	if _, err := strconv.Atoi(port); err != nil {
		slog.Error("invalid port", "port", port, "error", err)
		os.Exit(1)
	}

	server := &http.Server{
		Addr:              fmt.Sprintf(":%s", port),
		Handler:           target.NewHandler(),
		ReadHeaderTimeout: 2 * time.Second,
		IdleTimeout:       10 * time.Second,
		WriteTimeout:      5 * time.Second,
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	go func() {
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		if err := server.Shutdown(shutdownCtx); err != nil {
			slog.Error("shutdown failed", "error", err)
		}
	}()

	slog.Info("load target listening", "address", server.Addr)
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		slog.Error("server stopped", "error", err)
		os.Exit(1)
	}
}

func getenv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

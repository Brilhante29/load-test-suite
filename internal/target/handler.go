package target

import (
	"io"
	"net/http"
	"time"
)

const healthBody = `{"status":"ok","service":"load-test-target","version":"1"}`

const (
	workerSlots = 4
	serviceTime = 2 * time.Millisecond
)

type workHandler struct {
	slots       chan struct{}
	serviceTime time.Duration
}

// NewHandler exposes a stable, dependency-free contract for the benchmark target.
func NewHandler() http.Handler {
	return newHandler(workerSlots, serviceTime)
}

func newHandler(slots int, delay time.Duration) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", health)
	mux.HandleFunc("/payload", payload)
	mux.Handle("/work", &workHandler{
		slots:       make(chan struct{}, slots),
		serviceTime: delay,
	})
	return mux
}

func (h *workHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}

	h.slots <- struct{}{}
	defer func() { <-h.slots }()
	time.Sleep(h.serviceTime)
	writeJSON(w, `{"status":"ok","fixture":"bounded-worker-pool","slots":4,"service_time_ms":2}`)
}

func health(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}
	writeJSON(w, healthBody)
}

func payload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}
	writeJSON(w, `{"service":"load-test-target","payload":"stable-fixture","seed":42}`)
}

func writeJSON(w http.ResponseWriter, body string) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(http.StatusOK)
	_, _ = io.WriteString(w, body)
}

func methodNotAllowed(w http.ResponseWriter) {
	w.Header().Set("Allow", http.MethodGet)
	http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
}

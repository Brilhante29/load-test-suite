package target

import (
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestHealthReturnsStableContract(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	res := httptest.NewRecorder()

	NewHandler().ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", res.Code, http.StatusOK)
	}
	if got := res.Header().Get("Content-Type"); got != "application/json" {
		t.Fatalf("content type = %q, want application/json", got)
	}
	body, err := io.ReadAll(res.Body)
	if err != nil {
		t.Fatalf("read body: %v", err)
	}
	if string(body) != healthBody {
		t.Fatalf("body = %q, want %q", string(body), healthBody)
	}
}

func TestPayloadIsDeterministic(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/payload", nil)
	res := httptest.NewRecorder()

	NewHandler().ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", res.Code, http.StatusOK)
	}
	if got := res.Body.String(); got != `{"service":"load-test-target","payload":"stable-fixture","seed":42}` {
		t.Fatalf("body = %q, want stable fixture", got)
	}
}

func TestHealthRejectsNonGet(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/health", nil)
	res := httptest.NewRecorder()

	NewHandler().ServeHTTP(res, req)

	if res.Code != http.StatusMethodNotAllowed {
		t.Fatalf("status = %d, want %d", res.Code, http.StatusMethodNotAllowed)
	}
	if got := res.Header().Get("Allow"); got != http.MethodGet {
		t.Fatalf("allow = %q, want GET", got)
	}
}

func TestWorkReturnsControlledFixture(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/work", nil)
	res := httptest.NewRecorder()

	newHandler(1, 0).ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", res.Code, http.StatusOK)
	}
	if body := res.Body.String(); !strings.Contains(body, `"bounded-worker-pool"`) {
		t.Fatalf("body = %q, want controlled fixture", body)
	}
}

func TestWorkAppliesBoundedConcurrency(t *testing.T) {
	handler := newHandler(1, 20*time.Millisecond)
	started := make(chan struct{}, 2)
	done := make(chan time.Duration, 2)
	start := time.Now()

	for range 2 {
		go func() {
			started <- struct{}{}
			req := httptest.NewRequest(http.MethodGet, "/work", nil)
			handler.ServeHTTP(httptest.NewRecorder(), req)
			done <- time.Since(start)
		}()
	}
	<-started
	<-started
	first, second := <-done, <-done
	if first > second {
		first, second = second, first
	}
	if second-first < 10*time.Millisecond {
		t.Fatalf("requests did not queue: first=%s second=%s", first, second)
	}
}

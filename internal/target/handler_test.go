package target

import (
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
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

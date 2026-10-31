package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestFetchFeedback(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost || r.URL.Path != "/admin/posts/3/feedback" {
			t.Errorf("got %s %s, want POST /admin/posts/3/feedback", r.Method, r.URL.Path)
		}
		if got := r.Header.Get("Authorization"); got != "Bearer secret" {
			t.Errorf("got Authorization %q, want %q", got, "Bearer secret")
		}
		w.Write([]byte(`{"type":"draft","feedback":"- Tighten the intro","cached":true,"generatedAt":"2026-10-31T18:00:00.000Z"}`))
	}))
	defer server.Close()

	var result FeedbackResponse
	if err := json.Unmarshal(fetchFeedback(newClient("secret", server.URL), "3"), &result); err != nil {
		t.Fatal(err)
	}

	want := FeedbackResponse{
		Type:        "draft",
		Feedback:    "- Tighten the intro",
		Cached:      true,
		GeneratedAt: time.Date(2026, 10, 31, 18, 0, 0, 0, time.UTC),
	}
	if result.Type != want.Type || result.Feedback != want.Feedback || result.Cached != want.Cached || !result.GeneratedAt.Equal(want.GeneratedAt) {
		t.Errorf("got %+v, want %+v", result, want)
	}
}

func TestFormatFeedback(t *testing.T) {
	generatedAt := time.Date(2026, 10, 31, 18, 0, 0, 0, time.UTC)
	stamp := generatedAt.Local().Format("2006-01-02 15:04")

	tests := []struct {
		name   string
		result FeedbackResponse
		want   string
	}{
		{
			name:   "new draft feedback",
			result: FeedbackResponse{Type: "draft", Feedback: "\n## Feedback\n- Tighten the intro\n", GeneratedAt: generatedAt},
			want: "# Feedback on post 3 (draft)\n\n" +
				"## Feedback\n- Tighten the intro\n\n" +
				"_new · generated " + stamp + "_\n",
		},
		{
			name:   "cached published feedback",
			result: FeedbackResponse{Type: "published", Feedback: "- Readers want examples", Cached: true, GeneratedAt: generatedAt},
			want: "# Feedback on post 3 (published)\n\n" +
				"- Readers want examples\n\n" +
				"_cached · generated " + stamp + "_\n",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := formatFeedback("3", tt.result); got != tt.want {
				t.Errorf("got\n%s\nwant\n%s", got, tt.want)
			}
		})
	}
}

func TestFormatFeedbackWrapsLongLines(t *testing.T) {
	long := "- " + strings.Repeat("word ", 30)
	got := formatFeedback("3", FeedbackResponse{Type: "draft", Feedback: long})

	for _, line := range strings.Split(got, "\n") {
		if len(line) > wrapWidth {
			t.Errorf("line longer than %d: %q", wrapWidth, line)
		}
	}
}

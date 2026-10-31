package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"os/exec"
	"testing"
)

func TestFetchPostsSendsDraftQuery(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/admin/posts" {
			t.Errorf("got path %s, want /admin/posts", r.URL.Path)
		}
		if got := r.URL.Query().Get("published"); got != "false" {
			t.Errorf("got published=%q, want false", got)
		}
		if got := r.URL.Query().Get("title"); got != "rate" {
			t.Errorf("got title=%q, want rate", got)
		}
		if got := r.Header.Get("Authorization"); got != "Bearer secret" {
			t.Errorf("got Authorization %q, want %q", got, "Bearer secret")
		}
		w.Write([]byte(`[{"id":4,"title":"Notes on rate limiting","published":false}]`))
	}))
	defer server.Close()

	q := parsePostFlags("drafts", []string{"--title", "rate"}, false)
	q.Set("published", "false")
	var posts []Post
	if err := json.Unmarshal(fetchPosts(newClient("secret", server.URL), "/admin/posts", q), &posts); err != nil {
		t.Fatal(err)
	}

	if len(posts) != 1 || posts[0].Id != 4 || posts[0].Published {
		t.Errorf("got %+v, want one draft with id 4", posts)
	}
}

func TestParsePostFlags(t *testing.T) {
	got := parsePostFlags("posts", []string{"--page", "2", "--include-comments"}, true)
	want := url.Values{"page": {"2"}, "withComments": {"true"}}

	if got.Encode() != want.Encode() {
		t.Errorf("got %s, want %s", got.Encode(), want.Encode())
	}
}

func TestDraftsRejectsIncludeComments(t *testing.T) {
	if os.Getenv("BLOGAPI_RUN_DRAFTS") == "1" {
		parsePostFlags("drafts", []string{"--include-comments"}, false)
		return
	}

	cmd := exec.Command(os.Args[0], "-test.run=TestDraftsRejectsIncludeComments")
	cmd.Env = append(os.Environ(), "BLOGAPI_RUN_DRAFTS=1")
	if err := cmd.Run(); err == nil {
		t.Error("expected drafts --include-comments to exit with an error")
	}
}

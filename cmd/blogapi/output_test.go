package main

import (
	"reflect"
	"strings"
	"testing"
	"time"
)

func TestExtractJSONFlag(t *testing.T) {
	tests := []struct {
		args     []string
		wantArgs []string
		wantJSON bool
	}{
		{[]string{"3"}, []string{"3"}, false},
		{[]string{"--json", "3"}, []string{"3"}, true},
		{[]string{"3", "--title", "x", "--json"}, []string{"3", "--title", "x"}, true},
		{[]string{"-json"}, []string{}, true},
	}

	for _, tt := range tests {
		args, asJSON := extractJSONFlag(tt.args)
		if !reflect.DeepEqual(args, tt.wantArgs) || asJSON != tt.wantJSON {
			t.Errorf("extractJSONFlag(%v) = %v, %v, want %v, %v", tt.args, args, asJSON, tt.wantArgs, tt.wantJSON)
		}
	}
}

func TestFormatPosts(t *testing.T) {
	updated := time.Date(2026, 10, 31, 12, 0, 0, 0, time.Local)
	posts := []Post{
		{Id: 3, Title: "Linking OAuth providers", Published: true, UpdatedAt: updated},
		{Id: 12, Title: "Notes", UpdatedAt: updated},
	}

	want := "ID  TITLE                    STATUS     UPDATED\n" +
		"3   Linking OAuth providers  published  2026-10-31\n" +
		"12  Notes                    draft      2026-10-31\n"
	if got := formatPosts("none")(posts); got != want {
		t.Errorf("got\n%s\nwant\n%s", got, want)
	}
}

func TestFormatPostsShowsCommentCount(t *testing.T) {
	posts := []Post{{Id: 1, Title: "A", Published: true, Comments: []Comment{{Id: 1}, {Id: 2}}}}

	got := formatPosts("none")(posts)
	if !strings.Contains(got, "COMMENTS") || !strings.HasSuffix(strings.TrimSpace(got), "2") {
		t.Errorf("expected a comment count column, got\n%s", got)
	}
}

func TestFormatPostsEmpty(t *testing.T) {
	if got := formatPosts("No drafts found")(nil); got != "No drafts found\n" {
		t.Errorf("got %q", got)
	}
}

func TestFormatComments(t *testing.T) {
	created := time.Date(2026, 10, 31, 12, 0, 0, 0, time.Local)
	comments := []Comment{{Id: 7, PostId: 3, UserId: 2, Text: "Great\nread", CreatedAt: created}}

	want := "ID  POST  USER  CREATED     TEXT\n" +
		"7   3     2     2026-10-31  Great read\n"
	if got := formatComments(comments); got != want {
		t.Errorf("got\n%s\nwant\n%s", got, want)
	}
	if got := formatComments(nil); got != "No comments found\n" {
		t.Errorf("got %q", got)
	}
}

func TestFormatPostAction(t *testing.T) {
	got := formatPostAction("Published")(Post{Id: 3, Title: "Hello", Published: true})
	if want := "Published post 3: Hello (published)\n"; got != want {
		t.Errorf("got %q, want %q", got, want)
	}
}

func TestTruncate(t *testing.T) {
	tests := []struct {
		in   string
		max  int
		want string
	}{
		{"short", 10, "short"},
		{"exactly10!", 10, "exactly10!"},
		{"this is too long", 10, "this is t…"},
		{"åäöåäöåäöåäö", 5, "åäöå…"},
		{"line\nbreak", 20, "line break"},
	}

	for _, tt := range tests {
		if got := truncate(tt.in, tt.max); got != tt.want {
			t.Errorf("truncate(%q, %d) = %q, want %q", tt.in, tt.max, got, tt.want)
		}
	}
}

func TestErrorMessage(t *testing.T) {
	if got := errorMessage(404, []byte(`{"message":"Post not found"}`)); got != "Error 404: Post not found" {
		t.Errorf("got %q", got)
	}
	if got := errorMessage(502, []byte("Bad Gateway\n")); got != "Error 502: Bad Gateway" {
		t.Errorf("got %q", got)
	}
}

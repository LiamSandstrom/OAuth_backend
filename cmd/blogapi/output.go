package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"
	"text/tabwriter"
	"time"
	"unicode/utf8"
)

var jsonOutput bool

func extractJSONFlag(args []string) ([]string, bool) {
	rest := make([]string, 0, len(args))
	found := false
	for _, arg := range args {
		if arg == "--json" || arg == "-json" {
			found = true
			continue
		}
		rest = append(rest, arg)
	}
	return rest, found
}

func render[T any](body []byte, format func(T) string) {
	if jsonOutput {
		printJSON(body)
		return
	}
	var v T
	must(json.Unmarshal(body, &v))
	fmt.Print(format(v))
}

func printJSON(body []byte) {
	var out bytes.Buffer
	if json.Indent(&out, body, "", "  ") != nil {
		fmt.Println(string(body))
		return
	}
	fmt.Println(out.String())
}

func errorMessage(status int, body []byte) string {
	var res struct {
		Message string `json:"message"`
	}
	if json.Unmarshal(body, &res) == nil && res.Message != "" {
		return fmt.Sprintf("Error %d: %s", status, res.Message)
	}
	return fmt.Sprintf("Error %d: %s", status, strings.TrimSpace(string(body)))
}

func table(header []string, rows [][]string) string {
	var b strings.Builder
	w := tabwriter.NewWriter(&b, 0, 0, 2, ' ', 0)
	fmt.Fprintln(w, strings.Join(header, "\t"))
	for _, row := range rows {
		fmt.Fprintln(w, strings.Join(row, "\t"))
	}
	w.Flush()
	return b.String()
}

func truncate(s string, max int) string {
	s = strings.Join(strings.Fields(s), " ")
	if utf8.RuneCountInString(s) <= max {
		return s
	}
	return string([]rune(s)[:max-1]) + "…"
}

func date(t time.Time) string {
	return t.Local().Format("2006-01-02")
}

func status(p Post) string {
	if p.Published {
		return "published"
	}
	return "draft"
}

func formatPosts(empty string) func([]Post) string {
	return func(posts []Post) string {
		if len(posts) == 0 {
			return empty + "\n"
		}

		withComments := false
		for _, p := range posts {
			if p.Comments != nil {
				withComments = true
			}
		}

		header := []string{"ID", "TITLE", "STATUS", "UPDATED"}
		if withComments {
			header = append(header, "COMMENTS")
		}

		rows := make([][]string, 0, len(posts))
		for _, p := range posts {
			row := []string{fmt.Sprint(p.Id), truncate(p.Title, 50), status(p), date(p.UpdatedAt)}
			if withComments {
				row = append(row, fmt.Sprint(len(p.Comments)))
			}
			rows = append(rows, row)
		}
		return table(header, rows)
	}
}

func formatComments(comments []Comment) string {
	if len(comments) == 0 {
		return "No comments found\n"
	}

	rows := make([][]string, 0, len(comments))
	for _, c := range comments {
		rows = append(rows, []string{fmt.Sprint(c.Id), fmt.Sprint(c.PostId), fmt.Sprint(c.UserId), date(c.CreatedAt), truncate(c.Text, 60)})
	}
	return table([]string{"ID", "POST", "USER", "CREATED", "TEXT"}, rows)
}

func formatPostAction(action string) func(Post) string {
	return func(p Post) string {
		return fmt.Sprintf("%s post %d: %s (%s)\n", action, p.Id, p.Title, status(p))
	}
}

func formatMessage(text string) func(json.RawMessage) string {
	return func(json.RawMessage) string {
		return text + "\n"
	}
}

package main

import (
	"fmt"
	"strings"
)

func feedback(args []string, client *Client) {
	requireArgs(args, 1, HelpFeedback)

	render(fetchFeedback(client, args[0]), func(result FeedbackResponse) string {
		return formatFeedback(args[0], result)
	})
}

func fetchFeedback(client *Client, id string) []byte {
	return postJSON(client, "/admin/posts/"+id+"/feedback", struct{}{})
}

func formatFeedback(id string, result FeedbackResponse) string {
	var b strings.Builder

	fmt.Fprintf(&b, "# Feedback on post %s (%s)\n\n", id, result.Type)
	fmt.Fprintln(&b, wrapMarkdown(strings.TrimSpace(result.Feedback), wrapWidth))
	fmt.Fprintln(&b)

	source := "new"
	if result.Cached {
		source = "cached"
	}
	fmt.Fprintf(&b, "_%s · generated %s_\n", source, result.GeneratedAt.Local().Format("2006-01-02 15:04"))

	return b.String()
}

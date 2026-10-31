package main

import "testing"

func TestWrapMarkdown(t *testing.T) {
	tests := []struct {
		name string
		text string
		want string
	}{
		{
			name: "leaves short lines alone",
			text: "## Summary\nShort line.",
			want: "## Summary\nShort line.",
		},
		{
			name: "wraps a paragraph",
			text: "one two three four five six",
			want: "one two three\nfour five six",
		},
		{
			name: "indents wrapped bullets under the text",
			text: "- one two three four five",
			want: "- one two three\n  four five",
		},
		{
			name: "indents wrapped numbered items",
			text: "10. one two three four five",
			want: "10. one two\n    three four\n    five",
		},
		{
			name: "keeps the quote marker on wrapped lines",
			text: "> one two three four five",
			want: "> one two three\n> four five",
		},
		{
			name: "never wraps headings",
			text: "## one two three four five six",
			want: "## one two three four five six",
		},
		{
			name: "never wraps code blocks",
			text: "```\none two three four five six seven\n```",
			want: "```\none two three four five six seven\n```",
		},
		{
			name: "puts a word longer than the width on its own line",
			text: "a averyveryverylongword b",
			want: "a\naveryveryverylongword\nb",
		},
		{
			name: "counts characters, not bytes",
			text: "åäö åäö åäö åäö åäö",
			want: "åäö åäö åäö åäö\nåäö",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := wrapMarkdown(tt.text, 15); got != tt.want {
				t.Errorf("got\n%s\nwant\n%s", got, tt.want)
			}
		})
	}
}

package main

import (
	"regexp"
	"strings"
	"unicode/utf8"
)

const wrapWidth = 80

var listItem = regexp.MustCompile(`^(\s*(?:[-*+]|\d+\.)\s+|\s*>\s?)`)

func wrapMarkdown(text string, width int) string {
	var out []string
	inCode := false

	for _, line := range strings.Split(text, "\n") {
		if strings.HasPrefix(strings.TrimSpace(line), "```") {
			inCode = !inCode
			out = append(out, line)
			continue
		}
		if inCode || strings.HasPrefix(strings.TrimSpace(line), "#") || utf8.RuneCountInString(line) <= width {
			out = append(out, line)
			continue
		}

		prefix := listItem.FindString(line)
		indent := strings.Repeat(" ", utf8.RuneCountInString(prefix))
		if strings.HasPrefix(strings.TrimSpace(prefix), ">") {
			indent = prefix
		}

		out = append(out, wrapLine(prefix, indent, strings.Fields(line[len(prefix):]), width)...)
	}

	return strings.Join(out, "\n")
}

func wrapLine(prefix, indent string, words []string, width int) []string {
	var lines []string
	current := prefix
	empty := true

	for _, word := range words {
		if !empty && utf8.RuneCountInString(current)+1+utf8.RuneCountInString(word) > width {
			lines = append(lines, current)
			current = indent
			empty = true
		}
		if !empty {
			current += " "
		}
		current += word
		empty = false
	}

	return append(lines, current)
}

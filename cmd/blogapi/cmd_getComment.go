package main

import (
	"flag"
	"net/url"
	"os"
)

func getComment(args []string, client *Client) {
	fs := flag.NewFlagSet("get-comment", flag.ExitOnError)
	id := fs.String("id", "", "")
	text := fs.String("text", "", "")
	fs.Parse(args)

	if *id == "" && *text == "" {
		printHelpCommand(HelpGetComment)
		os.Exit(1)
	}

	q := url.Values{}
	if *id != "" {
		q.Set("id", *id)
	}
	if *text != "" {
		q.Set("text", *text)
	}

	render(getJSON(client, "/admin/comments?"+q.Encode()), formatComments)
}

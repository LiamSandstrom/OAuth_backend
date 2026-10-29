package main

import (
	"encoding/json"
	"flag"
	"fmt"
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

	body := getJSON(client, "/admin/comments?"+q.Encode())
	var result []Comment
	must(json.Unmarshal(body, &result))

	out, err := json.MarshalIndent(result, "", "  ")
	must(err)
	fmt.Println(string(out))
}

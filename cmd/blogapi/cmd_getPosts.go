package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"net/url"
)

func setQuery(q url.Values, f *flag.Flag) {
	q.Set(f.Name, f.Value.String())
}

// key name has to match queryParam name
var handlers = map[string]func(url.Values, *flag.Flag){
	"id":               setQuery,
	"title":            setQuery,
	"page":             setQuery,
	"limit":            setQuery,
	"include-comments": func(q url.Values, _ *flag.Flag) { q.Set("withComments", "true") },
}

func getPosts(args []string, client *Client) {
	fs := flag.NewFlagSet("posts", flag.ExitOnError)
	fs.String("id", "", "")
	fs.String("title", "", "")
	fs.Bool("include-comments", false, "")
	fs.String("page", "", "")
	fs.String("limit", "", "")
	fs.Parse(args)

	q := url.Values{}
	fs.Visit(func(f *flag.Flag) {
		if h, ok := handlers[f.Name]; ok {
			h(q, f)
		}
	})

	body := getJSON(client, "/posts?"+q.Encode())
	var result []Post
	must(json.Unmarshal(body, &result))

	out, err := json.MarshalIndent(result, "", "  ")
	must(err)
	fmt.Println(string(out))
}

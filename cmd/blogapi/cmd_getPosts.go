package main

import (
	"flag"
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
	render(fetchPosts(client, "/posts", parsePostFlags("posts", args, true)), formatPosts("No published posts found"))
}

func getDrafts(args []string, client *Client) {
	q := parsePostFlags("drafts", args, false)
	q.Set("published", "false")
	render(fetchPosts(client, "/admin/posts", q), formatPosts("No drafts found"))
}

func parsePostFlags(name string, args []string, comments bool) url.Values {
	fs := flag.NewFlagSet(name, flag.ExitOnError)
	fs.String("id", "", "")
	fs.String("title", "", "")
	if comments {
		fs.Bool("include-comments", false, "")
	}
	fs.String("page", "", "")
	fs.String("limit", "", "")
	fs.Parse(args)

	q := url.Values{}
	fs.Visit(func(f *flag.Flag) {
		if h, ok := handlers[f.Name]; ok {
			h(q, f)
		}
	})
	return q
}

func fetchPosts(client *Client, path string, q url.Values) []byte {
	return getJSON(client, path+"?"+q.Encode())
}

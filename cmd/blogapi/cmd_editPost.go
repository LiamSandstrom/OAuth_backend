package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

type EditPostPayload struct {
	Title   *string `json:"title,omitempty"`
	Content *string `json:"content,omitempty"`
}

func editPost(args []string, client *Client) {
	requireArgs(args, 1, HelpEditPost)

	fs := flag.NewFlagSet("edit-post", flag.ExitOnError)
	title := fs.String("title", "", "")
	filePath := fs.String("filepath", "", "")
	fs.Parse(args[1:])

	payload := EditPostPayload{}

	if *title == "" && *filePath == "" {
		printHelpCommand(HelpEditPost)
		os.Exit(0)
	}

	set := map[string]bool{}
	fs.Visit(func(f *flag.Flag) { set[f.Name] = true })

	if !set["title"] && !set["filepath"] {
		printHelpCommand(HelpEditPost)
		os.Exit(0)
	}

	fs.Visit(func(f *flag.Flag) {
		switch f.Name {
		case "title":
			payload.Title = title
		case "filepath":
			fp := *filePath
			if strings.HasPrefix(fp, "~/") {
				home, err := os.UserHomeDir()
				must(err)
				fp = filepath.Join(home, fp[2:])
			}
			content, err := os.ReadFile(fp)
			must(err)
			str := string(content)
			payload.Content = &str
		}
	})

	body := patchJSON(client, "/admin/posts/"+args[0], payload)

	fmt.Println("Successfully edited post!")
	fmt.Println(string(body))
}

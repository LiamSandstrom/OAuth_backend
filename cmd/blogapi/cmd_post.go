package main

import (
	"fmt"
	"os"
)

type PostPayload struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}

func post(args []string, client *Client) {
	requireArgs(args, 2, HelpPost)

	title := args[0]
	filepath := args[1]

	content, err := os.ReadFile(filepath)
	must(err)

	body := postJSON(client, "/admin/posts", PostPayload{Title: title, Content: string(content)})

	fmt.Println("Successfully made post!")
	fmt.Println(string(body))
}

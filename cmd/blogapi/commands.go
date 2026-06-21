package main

import "fmt"

type Command struct {
	Help string
	Run  func(args []string, client *Client)
}

const (
	HelpPost          = "blogapi post $title $filepath"
	HelpEditPost      = "blogapi edit-post $id < --title | --filepath >"
	HelpPublish       = "blogapi publish $id"
	HelpUnpublish     = "blogapi unpublish $id"
	HelpPosts         = "blogapi posts [--id] [--title] [--include-comments] [--page] [--limit]"
	HelpDeleteUser    = "blogapi delete-user $id"
	HelpGetComment    = "blogapi get-comment < --id | --text >"
	HelpDeleteComment = "blogapi delete-comment $id"
)

var commands = map[string]Command{
	"help": {
		Help: "blogapi help",
		Run:  func(args []string, client *Client) {},
	},
	"post": {
		Help: HelpPost,
		Run:  post,
	},
	"edit-post": {
		Help: HelpEditPost,
		Run:  editPost,
	},
	"publish": {
		Help: HelpPublish,
		Run:  publishPost,
	},
	"unpublish": {
		Help: HelpUnpublish,
		Run:  unpublishPost,
	},
	"posts": {
		Help: HelpPosts,
		Run:  getPosts,
	},
	"delete-user": {
		Help: HelpDeleteUser,
		Run:  func(args []string, client *Client) {},
	},
	"get-comment": {
		Help: HelpGetComment,
		Run:  func(args []string, client *Client) {},
	},
	"delete-comment": {
		Help: HelpDeleteComment,
		Run:  func(args []string, client *Client) {},
	},
}

func printHelp() {
	fmt.Println("Usage:")
	for _, cmd := range commands {
		fmt.Println(" ", cmd.Help)
	}
}

func printHelpCommand(help string) {
	fmt.Println("Usage:\n ", help)
}

package main

import (
	"fmt"
	"sort"
)

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
	HelpDrafts        = "blogapi drafts [--id] [--title] [--page] [--limit]"
	HelpDeleteUser    = "blogapi delete-user $id"
	HelpGetComment    = "blogapi get-comment < --id | --text >"
	HelpDeleteComment = "blogapi delete-comment $id"
	HelpFeedback      = "blogapi feedback $id"
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
	"drafts": {
		Help: HelpDrafts,
		Run:  getDrafts,
	},
	"delete-user": {
		Help: HelpDeleteUser,
		Run:  deleteUser,
	},
	"get-comment": {
		Help: HelpGetComment,
		Run:  getComment,
	},
	"delete-comment": {
		Help: HelpDeleteComment,
		Run:  deleteComment,
	},
	"feedback": {
		Help: HelpFeedback,
		Run:  feedback,
	},
}

func printHelp() {
	names := make([]string, 0, len(commands))
	for name := range commands {
		names = append(names, name)
	}
	sort.Strings(names)

	fmt.Println("Usage:")
	for _, name := range names {
		fmt.Println(" ", commands[name].Help)
	}
	fmt.Println("\nAdd --json to any command to print the raw API response.")
}

func printHelpCommand(help string) {
	fmt.Println("Usage:\n ", help)
}

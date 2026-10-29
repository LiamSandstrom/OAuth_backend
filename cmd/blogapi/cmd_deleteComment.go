package main

import "fmt"

func deleteComment(args []string, client *Client) {
	requireArgs(args, 1, HelpDeleteComment)

	deleteJSON(client, "/admin/comments/"+args[0])
	fmt.Println("Successfully deleted comment!")
}

package main

func deleteComment(args []string, client *Client) {
	requireArgs(args, 1, HelpDeleteComment)

	body := deleteJSON(client, "/admin/comments/"+args[0])
	render(body, formatMessage("Deleted comment "+args[0]))
}

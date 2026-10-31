package main

func publishPost(args []string, client *Client) {
	requireArgs(args, 1, HelpPublish)

	body := patchJSON(client, "/admin/posts/"+args[0], publishPostPayload{Published: true})
	render(body, formatPostAction("Published"))
}

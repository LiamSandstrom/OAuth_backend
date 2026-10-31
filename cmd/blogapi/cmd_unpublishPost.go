package main

func unpublishPost(args []string, client *Client) {
	requireArgs(args, 1, HelpUnpublish)

	body := patchJSON(client, "/admin/posts/"+args[0], publishPostPayload{Published: false})
	render(body, formatPostAction("Unpublished"))
}

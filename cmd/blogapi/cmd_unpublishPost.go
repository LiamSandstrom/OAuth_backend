package main

import "fmt"

func unpublishPost(args []string, client *Client) {
	requireArgs(args, 1, HelpPublish)

	body := patchJSON(client, "/admin/posts/"+args[0], publishPostPayload{Published: false})
	fmt.Println("Successfully unpublished post!")
	fmt.Println(string(body))
}

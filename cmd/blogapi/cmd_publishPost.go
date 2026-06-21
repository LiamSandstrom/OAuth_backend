package main

import "fmt"

func publishPost(args []string, client *Client) {
	requireArgs(args, 1, HelpPublish)

	body := patchJSON(client, "/admin/posts/"+args[0], publishPostPayload{Published: true})
	fmt.Println("Successfully published post!")
	fmt.Println(string(body))
}

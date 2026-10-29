package main

import "fmt"

func deleteUser(args []string, client *Client) {
	requireArgs(args, 1, HelpDeleteUser)

	deleteJSON(client, "/admin/users/"+args[0])
	fmt.Println("Successfully deleted user!")
}

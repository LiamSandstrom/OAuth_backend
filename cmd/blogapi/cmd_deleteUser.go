package main

func deleteUser(args []string, client *Client) {
	requireArgs(args, 1, HelpDeleteUser)

	body := deleteJSON(client, "/admin/users/"+args[0])
	render(body, formatMessage("Deleted user "+args[0]))
}

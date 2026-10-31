package main

import (
	"fmt"
	"github.com/joho/godotenv"
	"os"
)

func main() {
	if len(os.Args) < 2 {
		printHelp()
		os.Exit(1)
	}

	if os.Args[1] == "help" {
		printHelp()
		os.Exit(0)
	}

	cmd, ok := commands[os.Args[1]]
	if !ok {
		fmt.Fprintf(os.Stderr, "unknown command '%s'\nuse help to see commands\n", os.Args[1])
		os.Exit(1)
	}

	godotenv.Load()
	token := os.Getenv("ADMIN_API_KEY")
	if token == "" {
		fmt.Fprintln(os.Stderr, "Missing ADMIN_API_KEY")
		os.Exit(1)
	}

	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		fmt.Fprintln(os.Stderr, "Missing BASE_URL")
		os.Exit(1)
	}

	client := newClient(token, baseURL)

	args, asJSON := extractJSONFlag(os.Args[2:])
	jsonOutput = asJSON
	cmd.Run(args, client)
}

package main

import (
	"fmt"
	"github.com/joho/godotenv"
	"os"
)

func main() {
	godotenv.Load()
	token := os.Getenv("ADMIN_API_KEY")
	if token == "" {
		fmt.Fprintf(os.Stderr, "Missing ADMIN_API_KEY")
		os.Exit(1)
	}

	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		fmt.Fprintf(os.Stderr, "Missing BASE_URL")
		os.Exit(1)
	}

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

	client := newClient(token, baseURL)

	cmd.Run(os.Args[2:], client)
}

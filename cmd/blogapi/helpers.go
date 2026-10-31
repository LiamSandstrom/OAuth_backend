package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

func requireArgs(args []string, reqAmount int, help string) {
	if len(args) < reqAmount {
		fmt.Fprintln(os.Stderr, "Call like:", help)
		os.Exit(1)
	}
}

func must(err error) {
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func checkStatus(resp *http.Response, body []byte) {
	if resp.StatusCode > 399 {
		if jsonOutput {
			fmt.Fprintln(os.Stderr, string(body))
		} else {
			fmt.Fprintln(os.Stderr, errorMessage(resp.StatusCode, body))
		}
		os.Exit(1)
	}
}

func readBody(resp *http.Response, err error) []byte {
	must(err)
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	must(err)
	checkStatus(resp, body)
	return body
}

func postJSON(client *Client, path string, payload any) []byte {
	data, err := json.Marshal(payload)
	must(err)
	return readBody(client.Post(path, bytes.NewBuffer(data)))
}

func getJSON(client *Client, path string) []byte {
	return readBody(client.Get(path))
}

func patchJSON(client *Client, path string, payload any) []byte {
	data, err := json.Marshal(payload)
	must(err)
	return readBody(client.Patch(path, bytes.NewBuffer(data)))
}

func deleteJSON(client *Client, path string) []byte {
	return readBody(client.Delete(path))
}

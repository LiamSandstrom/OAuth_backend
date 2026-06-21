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
		fmt.Println("Call like: ", help)
		os.Exit(0)
	}
}

func must(err error) {
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func checkStatus(resp *http.Response, body []byte) {
	if resp.StatusCode > 399 {
		fmt.Println(string(body))
		os.Exit(1)
	}
}

func postJSON(client *Client, path string, payload any) []byte {
	data, err := json.Marshal(payload)
	must(err)
	resp, err := client.Post(path, bytes.NewBuffer(data))
	must(err)
	body, err := io.ReadAll(resp.Body)
	must(err)
	checkStatus(resp, body)
	return body
}

func getJSON(client *Client, path string) []byte {
	resp, err := client.Get(path)
	must(err)
	body, err := io.ReadAll(resp.Body)
	must(err)
	checkStatus(resp, body)
	return body
}

func patchJSON(client *Client, path string, payload any) []byte {
	data, err := json.Marshal(payload)
	must(err)
	fmt.Println(string(data))
	resp, err := client.Patch(path, bytes.NewBuffer(data))
	must(err)
	body, err := io.ReadAll(resp.Body)
	must(err)
	checkStatus(resp, body)
	return body
}

func optionalBool(s string) *bool {
	if s == "true" || s == "false" {
		b := s == "true"
		return &b
	}
	return nil
}

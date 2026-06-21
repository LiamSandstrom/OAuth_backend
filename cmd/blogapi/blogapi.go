package main

import (
	"io"
	"net/http"
	"time"
)

type Client struct {
	http    *http.Client
	token   string
	baseURL string
}

func newClient(token, baseURL string) *Client {
	return &Client{
		http: &http.Client{
			Timeout: time.Second * 30,
		},
		token:   token,
		baseURL: baseURL,
	}
}

func (client *Client) BodyReqWithAuth(method, path string, body io.Reader) (*http.Response, error) {
	req, _ := http.NewRequest(method, client.baseURL+path, body)
	req.Header.Set("Authorization", "Bearer "+client.token)
	req.Header.Set("Content-Type", "application/json")
	return client.http.Do(req)
}

func (client *Client) Post(path string, body io.Reader) (*http.Response, error) {
	return client.BodyReqWithAuth("POST", path, body)
}

func (client *Client) Patch(path string, body io.Reader) (*http.Response, error) {
	return client.BodyReqWithAuth("PATCH", path, body)
}

func (client *Client) Get(path string) (*http.Response, error) {
	req, _ := http.NewRequest("GET", client.baseURL+path, nil)
	req.Header.Set("Authorization", "Bearer "+client.token)
	return client.http.Do(req)
}

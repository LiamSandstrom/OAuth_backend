package main

import "time"

type Post struct {
	Id        int       `json:"id"`
	UserId    int       `json:"userId"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Published bool      `json:"published"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	Comments  []Comment `json:"comments,omitempty"`
}

type Comment struct {
	Id        int       `json:"id"`
	PostId    int       `json:"postId"`
	UserId    int       `json:"userId"`
	Text      string    `json:"text"`
	CreatedAt time.Time `json:"createdAt"`
}

type publishPostPayload struct {
	Published bool `json:"published"`
}

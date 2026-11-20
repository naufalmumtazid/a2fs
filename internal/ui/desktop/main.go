package main

import (
	"log"

	"github.com/naufalmumtazid/a2fs/internal/repository"
	webview "github.com/webview/webview_go"
)

func main() {
	repository.Connect("internal/repository/a2fs.db?_pragma=foreign_keys(1)")

	window := webview.New(true)
	if window == nil {
		log.Fatal("failed to create desktop WebView")
	}
	defer window.Destroy()

	window.SetTitle("A2FS - Stock Research Software")
	window.SetSize(1280, 800, 0)
	window.Navigate("http://localhost:3000")
	window.Run()
}

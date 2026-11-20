build:
	go build -o bin/main cmd/main.go

run:
	go run cmd/main.go
	cd internal/ui/web && npm run dev

test:
	go test -v ./...

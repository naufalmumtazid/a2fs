export PKG_CONFIG_PATH := $(CURDIR)/pkgconfig:$(PKG_CONFIG_PATH)

build:
	go build -o bin/main cmd/main.go

# Membangun file binary khusus untuk desktop
build-desktop:
	go build -o bin/desktop internal/ui/desktop/main.go

# Jalankan Next.js saja (di Terminal 1)
run-web:
	cd internal/ui/web && npm run dev

# Jalankan WebView Go saja (di Terminal 2)
run-desktop:
	go run internal/ui/desktop/main.go

test:
	go test -v ./...
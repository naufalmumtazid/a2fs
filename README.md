# A2FS - Stock Research Software

A2FS is a lightweight and automated stock research tool written in Go. It is designed to fetch, process, and analyze financial reports (such as XBRL data and soft copies of financial statements) directly from sources like the Indonesia Stock Exchange (IDX) to assist with fundamental analysis and research.

---

## 🚀 Features

- **Automated Financial Report Scraping:** Fetches ZIP files containing XBRL and financial statements efficiently.
- **Concurrent Processing:** Uses Go routines (`sync.WaitGroup`) to scrape multiple quarterly reports concurrently.
- **Dynamic Cookie Management:** Integrates headless browser automation (`go-rod`) to handle session cookies and bypass basic blocks securely.
- **Local Database Storage:** Built-in SQLite repository integration for structured data management.
- **Robust Error Handling & Testing:** Comprehensive test coverage for scrapers.

---

## 🛠️ Tech Stack

- **Language:** [Go (Golang)](https://golang.org/)
- **Database:** SQLite
- **Browser Automation:** [Go-Rod](https://go-rod.github.io/)
- **Archiving:** Standard `archive/zip` library

---

## ⚙️ Getting Started & Installation

### Prerequisites
- Make sure you have **Go (v1.20 or higher)** installed.
- Ensure you have a Chromium-based browser installed to support browser-based cookie scraping (`go-rod`).

### 1. Clone the Repository
```bash
git clone https://github.com/naufalmumtazid/a2fs.git
cd a2fs
```

### 2. Install Dependencies
```bash
go mod tidy
```

### 3. Run the Application
```bash
go run cmd/main.go
```

### 4. Run Tests
To run all test suites in verbose mode:
```bash
go test -v ./...
```

---

## 🤝 Contributing

Contributions are **welcome and appreciated**! Whether it's fixing bugs, adding new scrapers, improving financial data parsers, or enhancing documentation, feel free to jump in.

### How to Contribute:
1. **Fork** the repository.
2. **Create a new branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**:
   ```bash
   git commit -m "Add some amazing feature"
   ```
4. **Push to the branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**.

Please make sure your code passes existing tests and adheres to standard Go formatting (`go fmt`).

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
